// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleWorkingDEX {
    mapping(address => mapping(address => uint256)) public reserves;
    mapping(address => mapping(address => bool)) public pairs;
    
    address public owner;
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
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
        
        // Переводим токены от пользователя к контракту
        require(transferToken(tokenA, msg.sender, address(this), amountA), "Transfer A failed");
        require(transferToken(tokenB, msg.sender, address(this), amountB), "Transfer B failed");
        
        // Обновляем резервы
        reserves[tokenA][tokenB] += amountA;
        reserves[tokenB][tokenA] += amountB;
        pairs[tokenA][tokenB] = true;
        pairs[tokenB][tokenA] = true;
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB);
    }
    
    // Получить количество токенов на выходе
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        require(pairs[tokenIn][tokenOut], "Pair does not exist");
        
        uint256 reserveIn = reserves[tokenIn][tokenOut];
        uint256 reserveOut = reserves[tokenOut][tokenIn];
        
        if (reserveIn == 0 || reserveOut == 0) {
            return 0;
        }
        
        // Простая формула: amountOut = (amountIn * reserveOut) / reserveIn
        uint256 amountOut = (amountIn * reserveOut) / reserveIn;
        
        // Вычитаем комиссию
        uint256 fee = (amountOut * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        return amountOut - fee;
    }
    
    // Свап токенов
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external {
        require(pairs[tokenIn][tokenOut], "Pair does not exist");
        require(amountIn > 0, "Invalid amount");
        
        uint256 amountOut = this.getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        // Переводим токены от пользователя к контракту
        require(transferToken(tokenIn, msg.sender, address(this), amountIn), "Transfer in failed");
        
        // Переводим токены от контракта к пользователю
        require(transferToken(tokenOut, address(this), msg.sender, amountOut), "Transfer out failed");
        
        // Обновляем резервы
        reserves[tokenIn][tokenOut] += amountIn;
        reserves[tokenOut][tokenIn] -= amountOut;
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    // Простая функция перевода токенов
    function transferToken(address token, address from, address to, uint256 amount) internal returns (bool) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
    
    // Получить резервы пары
    function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256) {
        return (reserves[tokenA][tokenB], reserves[tokenB][tokenA]);
    }
}
