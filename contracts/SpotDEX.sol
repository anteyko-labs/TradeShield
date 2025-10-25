// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SpotDEX {
    struct TradingPair {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        bool isActive;
    }
    
    address public owner;
    mapping(bytes32 => TradingPair) public pairs;
    mapping(address => mapping(address => bytes32)) public pairHashes;
    
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event PairCreated(bytes32 indexed pairHash, address tokenA, address tokenB);
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Создать торговую пару
    function createPair(
        address tokenA,
        address tokenB,
        uint256 initialAmountA,
        uint256 initialAmountB
    ) external onlyOwner {
        require(tokenA != tokenB, "Same token");
        require(initialAmountA > 0 && initialAmountB > 0, "Invalid amounts");
        
        bytes32 pairHash = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pairs[pairHash].tokenA == address(0), "Pair exists");
        
        // Переводим токены от владельца к контракту
        require(transferToken(tokenA, msg.sender, address(this), initialAmountA), "Transfer A failed");
        require(transferToken(tokenB, msg.sender, address(this), initialAmountB), "Transfer B failed");
        
        pairs[pairHash] = TradingPair({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: initialAmountA,
            reserveB: initialAmountB,
            isActive: true
        });
        
        pairHashes[tokenA][tokenB] = pairHash;
        pairHashes[tokenB][tokenA] = pairHash;
        
        emit PairCreated(pairHash, tokenA, tokenB);
        emit LiquidityAdded(msg.sender, tokenA, tokenB, initialAmountA, initialAmountB);
    }
    
    // Добавить ликвидность
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external {
        require(tokenA != tokenB, "Same token");
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        require(pairHash != bytes32(0), "Pair not exists");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        
        // Переводим токены от пользователя к контракту
        require(transferToken(tokenA, msg.sender, address(this), amountA), "Transfer A failed");
        require(transferToken(tokenB, msg.sender, address(this), amountB), "Transfer B failed");
        
        // Обновляем резервы
        pair.reserveA += amountA;
        pair.reserveB += amountB;
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB);
    }
    
    // Свап токенов
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external {
        bytes32 pairHash = pairHashes[tokenIn][tokenOut];
        require(pairHash != bytes32(0), "Pair not exists");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        require(amountIn > 0, "Invalid amount");
        
        // Переводим токены от пользователя к контракту
        require(transferToken(tokenIn, msg.sender, address(this), amountIn), "Transfer failed");
        
        // Вычисляем количество токенов на выходе
        uint256 amountOut = getAmountOut(amountIn, pair.reserveA, pair.reserveB);
        require(amountOut >= minAmountOut, "Insufficient output");
        
        // Вычисляем комиссию
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
        
        // Переводим токены пользователю
        require(transferToken(tokenOut, address(this), msg.sender, amountOutAfterFee), "Transfer failed");
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOutAfterFee);
    }
    
    // Получить количество токенов на выходе
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        bytes32 pairHash = pairHashes[tokenIn][tokenOut];
        require(pairHash != bytes32(0), "Pair not exists");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        
        uint256 reserveIn = tokenIn == pair.tokenA ? pair.reserveA : pair.reserveB;
        uint256 reserveOut = tokenOut == pair.tokenA ? pair.reserveA : pair.reserveB;
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENTAGE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }
    
    // Получить резервы пары
    function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256) {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        if (pairHash == bytes32(0)) {
            return (0, 0);
        }
        TradingPair storage pair = pairs[pairHash];
        return (pair.reserveA, pair.reserveB);
    }
    
    // Простая функция перевода токенов
    function transferToken(address token, address from, address to, uint256 amount) internal returns (bool) {
        if (from == address(this)) {
            return IERC20(token).transfer(to, amount);
        } else {
            return IERC20(token).transferFrom(from, to, amount);
        }
    }
    
    // Получить баланс токена в контракте
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
