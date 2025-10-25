// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RealDEX
 * @dev Реальный DEX с хранением всех данных в смарт-контрактах
 * Никаких моков - только реальные транзакции!
 */
contract RealDEX {
    address public owner;
    address public wallet;
    address public tokenRegistry;
    
    // Структура торговой пары
    struct TradingPair {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        bool isActive;
        uint256 lastPrice;
        uint256 priceUpdateTime;
    }
    
    // Структура ордера
    struct Order {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        uint256 price;
        uint256 timestamp;
        bool isFilled;
        bool isCancelled;
    }
    
    // Структура торговли
    struct Trade {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        uint256 price;
        uint256 timestamp;
        bytes32 txHash;
    }
    
    // Хранение данных
    mapping(bytes32 => TradingPair) public pairs;
    mapping(address => mapping(address => bytes32)) public pairHashes;
    Order[] public orders;
    Trade[] public trades;
    mapping(address => uint256[]) public userOrders;
    mapping(address => uint256[]) public userTrades;
    
    // Комиссии
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // События
    event PairCreated(bytes32 indexed pairHash, address tokenA, address tokenB);
    event OrderPlaced(uint256 indexed orderId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn);
    event OrderFilled(uint256 indexed orderId, address indexed user, uint256 amountOut);
    event OrderCancelled(uint256 indexed orderId, address indexed user);
    event TradeExecuted(uint256 indexed tradeId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 price);
    event LiquidityAdded(bytes32 indexed pairHash, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    event PriceUpdated(bytes32 indexed pairHash, uint256 newPrice);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyWallet() {
        require(msg.sender == wallet, "Not wallet");
        _;
    }
    
    constructor(address _tokenRegistry, address _wallet) {
        owner = msg.sender;
        tokenRegistry = _tokenRegistry;
        wallet = _wallet;
    }
    
    /**
     * @dev Создать торговую пару
     */
    function createPair(
        address tokenA,
        address tokenB,
        uint256 initialAmountA,
        uint256 initialAmountB
    ) external onlyOwner {
        require(tokenA != tokenB, "Cannot create pair with same token");
        
        bytes32 pairHash = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pairs[pairHash].tokenA == address(0), "Pair already exists");
        
        // Переводим начальную ликвидность
        require(transferToken(tokenA, msg.sender, address(this), initialAmountA), "Transfer A failed");
        require(transferToken(tokenB, msg.sender, address(this), initialAmountB), "Transfer B failed");
        
        pairs[pairHash] = TradingPair({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: initialAmountA,
            reserveB: initialAmountB,
            totalLiquidity: initialAmountA + initialAmountB,
            isActive: true,
            lastPrice: (initialAmountB * 1e18) / initialAmountA,
            priceUpdateTime: block.timestamp
        });
        
        pairHashes[tokenA][tokenB] = pairHash;
        pairHashes[tokenB][tokenA] = pairHash;
        
        emit PairCreated(pairHash, tokenA, tokenB);
        emit LiquidityAdded(pairHash, tokenA, tokenB, initialAmountA, initialAmountB);
    }
    
    /**
     * @dev Выполнить свап
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external onlyWallet returns (uint256 amountOut) {
        bytes32 pairHash = pairHashes[tokenIn][tokenOut];
        require(pairHash != bytes32(0), "Pair does not exist");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        
        // Переводим токены от пользователя
        require(transferToken(tokenIn, msg.sender, address(this), amountIn), "Transfer failed");
        
        // Рассчитываем выходное количество
        amountOut = getAmountOut(amountIn, pair.reserveA, pair.reserveB);
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        // Рассчитываем комиссию
        uint256 fee = (amountOut * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 amountOutAfterFee = amountOut - fee;
        
        // Обновляем резервы
        if (tokenIn == pair.tokenA) {
            pair.reserveA += amountIn;
            pair.reserveB -= amountOut;
        } else {
            pair.reserveB += amountIn;
            pair.reserveA -= amountOut;
        }
        
        // Обновляем цену
        uint256 newPrice = (pair.reserveB * 1e18) / pair.reserveA;
        pair.lastPrice = newPrice;
        pair.priceUpdateTime = block.timestamp;
        
        // Переводим токены пользователю
        require(transferToken(tokenOut, address(this), msg.sender, amountOutAfterFee), "Transfer out failed");
        
        // Создаем ордер
        uint256 orderId = orders.length;
        orders.push(Order({
            user: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOut: amountOutAfterFee,
            price: newPrice,
            timestamp: block.timestamp,
            isFilled: true,
            isCancelled: false
        }));
        
        userOrders[msg.sender].push(orderId);
        
        // Создаем торговлю
        uint256 tradeId = trades.length;
        trades.push(Trade({
            user: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOut: amountOutAfterFee,
            price: newPrice,
            timestamp: block.timestamp,
            txHash: keccak256(abi.encodePacked(block.timestamp, msg.sender, amountIn, amountOutAfterFee))
        }));
        
        userTrades[msg.sender].push(tradeId);
        
        emit OrderPlaced(orderId, msg.sender, tokenIn, tokenOut, amountIn);
        emit OrderFilled(orderId, msg.sender, amountOutAfterFee);
        emit TradeExecuted(tradeId, msg.sender, tokenIn, tokenOut, amountIn, amountOutAfterFee, newPrice);
        emit PriceUpdated(pairHash, newPrice);
        
        return amountOutAfterFee;
    }
    
    /**
     * @dev Рассчитать выходное количество
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Amount in must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENTAGE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }
    
    /**
     * @dev Получить информацию о паре
     */
    function getPairInfo(address tokenA, address tokenB) external view returns (TradingPair memory) {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        return pairs[pairHash];
    }
    
    /**
     * @dev Получить ордера пользователя
     */
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }
    
    /**
     * @dev Получить торговли пользователя
     */
    function getUserTrades(address user) external view returns (uint256[] memory) {
        return userTrades[user];
    }
    
    /**
     * @dev Получить ордер
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
    
    /**
     * @dev Получить торговлю
     */
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
    
    /**
     * @dev Добавить ликвидность
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external onlyOwner {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        require(pairHash != bytes32(0), "Pair does not exist");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        
        // Переводим токены
        require(transferToken(tokenA, msg.sender, address(this), amountA), "Transfer A failed");
        require(transferToken(tokenB, msg.sender, address(this), amountB), "Transfer B failed");
        
        // Обновляем резервы
        pair.reserveA += amountA;
        pair.reserveB += amountB;
        pair.totalLiquidity += amountA + amountB;
        
        emit LiquidityAdded(pairHash, tokenA, tokenB, amountA, amountB);
    }
    
    /**
     * @dev Перевести токен
     */
    function transferToken(address token, address from, address to, uint256 amount) internal returns (bool) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
}
