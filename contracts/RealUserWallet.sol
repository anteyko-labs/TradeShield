// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RealUserWallet
 * @dev Реальный кошелек пользователя с хранением токенов в смарт-контракте
 * Никаких localStorage - все в блокчейне!
 */
contract RealUserWallet {
    address public owner;
    address public dex;
    address public tokenRegistry;
    
    // Структура для хранения токена
    struct TokenInfo {
        address tokenAddress;
        string symbol;
        string name;
        uint8 decimals;
        uint256 balance;
        bool isActive;
    }
    
    // Балансы пользователей
    mapping(address => mapping(address => uint256)) public userBalances;
    
    // Зарегистрированные токены
    mapping(address => TokenInfo) public registeredTokens;
    address[] public tokenAddresses;
    
    // Торговые позиции
    struct Position {
        address token;
        uint256 amount;
        uint256 entryPrice;
        uint256 timestamp;
        bool isLong;
    }
    
    mapping(address => Position[]) public userPositions;
    mapping(address => uint256) public userPositionCount;
    
    // События
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event PositionOpened(address indexed user, address indexed token, uint256 amount, uint256 price, bool isLong);
    event PositionClosed(address indexed user, address indexed token, uint256 amount, uint256 price);
    event TokenRegistered(address indexed token, string symbol, string name);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyDEX() {
        require(msg.sender == dex, "Not DEX");
        _;
    }
    
    constructor(address _tokenRegistry) {
        owner = msg.sender;
        tokenRegistry = _tokenRegistry;
    }
    
    /**
     * @dev Установить адрес DEX
     */
    function setDEX(address _dex) external onlyOwner {
        dex = _dex;
    }
    
    /**
     * @dev Зарегистрировать токен
     */
    function registerToken(
        address tokenAddress,
        string memory symbol,
        string memory name,
        uint8 decimals
    ) external onlyOwner {
        require(registeredTokens[tokenAddress].tokenAddress == address(0), "Token already registered");
        
        registeredTokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            symbol: symbol,
            name: name,
            decimals: decimals,
            balance: 0,
            isActive: true
        });
        
        tokenAddresses.push(tokenAddress);
        emit TokenRegistered(tokenAddress, symbol, name);
    }
    
    /**
     * @dev Депозит токенов (только от DEX)
     */
    function depositToken(address user, address token, uint256 amount) external onlyDEX {
        require(registeredTokens[token].isActive, "Token not active");
        
        userBalances[user][token] += amount;
        registeredTokens[token].balance += amount;
        
        emit TokenDeposited(user, token, amount);
    }
    
    /**
     * @dev Вывод токенов (только от DEX)
     */
    function withdrawToken(address user, address token, uint256 amount) external onlyDEX {
        require(userBalances[user][token] >= amount, "Insufficient balance");
        
        userBalances[user][token] -= amount;
        registeredTokens[token].balance -= amount;
        
        emit TokenWithdrawn(user, token, amount);
    }
    
    /**
     * @dev Открыть позицию
     */
    function openPosition(
        address user,
        address token,
        uint256 amount,
        uint256 price,
        bool isLong
    ) external onlyDEX {
        require(registeredTokens[token].isActive, "Token not active");
        
        // Добавляем позицию в массив позиций пользователя
        Position memory newPosition = Position({
            token: token,
            amount: amount,
            entryPrice: price,
            timestamp: block.timestamp,
            isLong: isLong
        });
        
        // Добавляем позицию в массив
        userPositions[user].push(newPosition);
        
        userPositionCount[user]++;
        emit PositionOpened(user, token, amount, price, isLong);
    }
    
    /**
     * @dev Закрыть позицию
     */
    function closePosition(
        address user,
        address token,
        uint256 amount,
        uint256 price
    ) external onlyDEX {
        // Найти и закрыть позицию
        for (uint256 i = 0; i < userPositions[user].length; i++) {
            if (userPositions[user][i].token == token && userPositions[user][i].amount > 0) {
                userPositions[user][i].amount = 0; // Закрываем позицию
                break;
            }
        }
        
        emit PositionClosed(user, token, amount, price);
    }
    
    /**
     * @dev Получить баланс пользователя
     */
    function getBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }
    
    /**
     * @dev Получить все балансы пользователя
     */
    function getAllBalances(address user) external view returns (address[] memory tokens, uint256[] memory balances) {
        tokens = new address[](tokenAddresses.length);
        balances = new uint256[](tokenAddresses.length);
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            tokens[i] = tokenAddresses[i];
            balances[i] = userBalances[user][tokenAddresses[i]];
        }
    }
    
    /**
     * @dev Получить позиции пользователя
     */
    function getPositions(address user) external view returns (Position[] memory) {
        return userPositions[user];
    }
    
    /**
     * @dev Получить информацию о токене
     */
    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return registeredTokens[token];
    }
    
    /**
     * @dev Получить все зарегистрированные токены
     */
    function getAllTokens() external view returns (address[] memory) {
        return tokenAddresses;
    }
}
