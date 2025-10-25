// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RealUSDT
 * @dev Реальный USDT токен с начальным балансом 10,000 USDT для каждого пользователя
 * Никаких моков - только реальные токены!
 */
contract RealUSDT {
    string public name = "TradeShield USDT";
    string public symbol = "USDT";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    uint256 public maxSupply = 1000000000 * 10**6; // 1B USDT max
    
    address public owner;
    address public dex;
    address public wallet;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Начальный баланс для новых пользователей
    uint256 public constant INITIAL_BALANCE = 10000 * 10**6; // 10,000 USDT
    mapping(address => bool) public hasInitialBalance;
    
    // События
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event InitialBalanceGranted(address indexed user, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyDEX() {
        require(msg.sender == dex, "Not DEX");
        _;
    }
    
    modifier onlyWallet() {
        require(msg.sender == wallet, "Not wallet");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        totalSupply = 0;
    }
    
    /**
     * @dev Установить адрес DEX
     */
    function setDEX(address _dex) external onlyOwner {
        dex = _dex;
    }
    
    /**
     * @dev Установить адрес Wallet
     */
    function setWallet(address _wallet) external onlyOwner {
        wallet = _wallet;
    }
    
    /**
     * @dev Выдать начальный баланс новому пользователю
     */
    function grantInitialBalance(address user) external onlyWallet {
        require(!hasInitialBalance[user], "User already has initial balance");
        require(totalSupply + INITIAL_BALANCE <= maxSupply, "Max supply exceeded");
        
        hasInitialBalance[user] = true;
        balanceOf[user] += INITIAL_BALANCE;
        totalSupply += INITIAL_BALANCE;
        
        emit Transfer(address(0), user, INITIAL_BALANCE);
        emit InitialBalanceGranted(user, INITIAL_BALANCE);
    }
    
    /**
     * @dev Перевести токены
     */
    function transfer(address to, uint256 value) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    /**
     * @dev Перевести токены от имени
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    /**
     * @dev Одобрить трату
     */
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    /**
     * @dev Минт токенов (только для DEX)
     */
    function mint(address to, uint256 amount) external onlyDEX {
        require(totalSupply + amount <= maxSupply, "Max supply exceeded");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Сжечь токены
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
    }
    
    /**
     * @dev Проверить, есть ли у пользователя начальный баланс
     */
    function hasUserInitialBalance(address user) external view returns (bool) {
        return hasInitialBalance[user];
    }
    
    /**
     * @dev Получить баланс пользователя
     */
    function getBalance(address user) external view returns (uint256) {
        return balanceOf[user];
    }
}
