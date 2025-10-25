const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

// Адрес USDT токена
const USDT_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';

// ABI для USDT токена
const USDT_ABI = [
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function grantUSDT(userAddress) {
  console.log('💰 Granting 10,000 USDT to:', userAddress);
  
  // Подключаемся к Sepolia
  const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Подключаемся к USDT контракту
  const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
  
  try {
    // Проверяем текущий баланс
    const currentBalance = await usdtContract.balanceOf(userAddress);
    console.log('Current balance:', ethers.utils.formatUnits(currentBalance, 6), 'USDT');
    
    if (currentBalance.gt(0)) {
      console.log('✅ User already has USDT balance');
      return;
    }
    
    // Минтим 10,000 USDT
    const amount = ethers.utils.parseUnits('10000', 6);
    const tx = await usdtContract.mint(userAddress, amount);
    console.log('Transaction hash:', tx.hash);
    
    await tx.wait();
    console.log('✅ 10,000 USDT granted successfully!');
    
    // Проверяем новый баланс
    const newBalance = await usdtContract.balanceOf(userAddress);
    console.log('New balance:', ethers.utils.formatUnits(newBalance, 6), 'USDT');
    
  } catch (error) {
    console.error('❌ Error granting USDT:', error);
  }
}

// Если передан адрес пользователя как аргумент
const userAddress = process.argv[2];
if (userAddress) {
  grantUSDT(userAddress);
} else {
  console.log('Usage: node scripts/grant-usdt.js <user_address>');
  console.log('Example: node scripts/grant-usdt.js 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
}
