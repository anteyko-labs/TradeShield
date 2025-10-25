const { ethers } = require('ethers');

// Конфигурация
const SEPOLIA_RPC = 'https://sepolia.gateway.tenderly.co';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USER_ADDRESS = process.env.USER_ADDRESS || '0x5137B8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8C8'; // Замените на адрес пользователя

// Адреса контрактов
const TOKEN_ADDRESSES = {
  USDT: '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6',
  BTC: '0xC941593909348e941420D5404Ab00b5363b1dDB4',
  ETH: '0x13E5f0d98D1dA90931A481fe0CE9eDAb24bA2Ecb'
};

// ABI для токенов
const TOKEN_ABI = [
  "function mint(address to, uint256 amount) public onlyOwner",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function mintTokensToUser() {
  try {
    console.log('🚀 Starting token minting process...');
    
    // Подключаемся к сети
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('✅ Connected to Sepolia network');
    console.log('👤 Owner address:', await wallet.getAddress());
    console.log('👤 User address:', USER_ADDRESS);
    
    // Минтим токены
    const tokensToMint = [
      { symbol: 'USDT', amount: '10000', decimals: 6 },
      { symbol: 'BTC', amount: '0.1', decimals: 8 },
      { symbol: 'ETH', amount: '1', decimals: 18 }
    ];
    
    for (const token of tokensToMint) {
      try {
        console.log(`\n🪙 Minting ${token.amount} ${token.symbol}...`);
        
        const tokenContract = new ethers.Contract(
          TOKEN_ADDRESSES[token.symbol],
          TOKEN_ABI,
          wallet
        );
        
        // Проверяем текущий баланс
        const currentBalance = await tokenContract.balanceOf(USER_ADDRESS);
        console.log(`📊 Current ${token.symbol} balance:`, ethers.utils.formatUnits(currentBalance, token.decimals));
        
        // Минтим токены
        const amount = ethers.utils.parseUnits(token.amount, token.decimals);
        const tx = await tokenContract.mint(USER_ADDRESS, amount);
        console.log(`⏳ Transaction hash: ${tx.hash}`);
        
        await tx.wait();
        console.log(`✅ ${token.amount} ${token.symbol} minted successfully!`);
        
        // Проверяем новый баланс
        const newBalance = await tokenContract.balanceOf(USER_ADDRESS);
        console.log(`📊 New ${token.symbol} balance:`, ethers.utils.formatUnits(newBalance, token.decimals));
        
      } catch (error) {
        console.error(`❌ Error minting ${token.symbol}:`, error.message);
      }
    }
    
    console.log('\n🎉 Token minting process completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Запускаем скрипт
if (require.main === module) {
  mintTokensToUser();
}

module.exports = { mintTokensToUser };
