// ДЕПЛОЙ НОВОГО DEX КОНТРАКТА
const { ethers } = require('ethers');

async function deployNewDEX() {
  console.log('🔧 ДЕПЛОЙ НОВОГО DEX КОНТРАКТА');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Приватный ключ
    const privateKey = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`👤 Используем кошелек: ${wallet.address}`);
    
    // Компилируем контракт
    const contractSource = `
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
    `;
    
    console.log('📝 Создаем новый DEX контракт...');
    
    // Создаем фабрику контрактов
    const factory = new ethers.ContractFactory(
      [
        "constructor()",
        "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external",
        "function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)",
        "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external",
        "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
        "function owner() view returns (address)"
      ],
      contractSource,
      wallet
    );
    
    // Деплоим контракт
    console.log('🚀 Деплоим новый DEX контракт...');
    const contract = await factory.deploy();
    await contract.deployed();
    
    console.log(`✅ Новый DEX контракт деплоен! Адрес: ${contract.address}`);
    
    // Проверяем владельца
    const owner = await contract.owner();
    console.log(`👑 Владелец: ${owner}`);
    
    console.log('\n💡 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('1. Обновить адрес DEX в userTradingService.ts');
    console.log('2. Добавить ликвидность в новый контракт');
    console.log('3. Протестировать торговлю');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n✅ ДЕПЛОЙ ЗАВЕРШЕН');
  console.log('='.repeat(60));
}

deployNewDEX();
