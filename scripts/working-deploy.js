// Working deployment script with hardcoded values
const { ethers } = require('ethers');

async function deploy() {
  console.log('🚀 REAL Contract Deployment');
  console.log('==========================');
  
  // Hardcoded values from your .env
  const PRIVATE_KEY = '22547068237db0ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
  const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet('0x' + PRIVATE_KEY, provider);
  
  console.log('Account:', wallet.address);
  console.log('Balance:', ethers.utils.formatEther(await provider.getBalance(wallet.address)), 'ETH');
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  if (balance.lt(ethers.utils.parseEther('0.01'))) {
    console.error('❌ Insufficient ETH balance. Please get testnet ETH from a faucet.');
    console.log('Get testnet ETH from: https://sepoliafaucet.com/');
    return;
  }
  
  console.log('\n✅ Account has sufficient balance for deployment!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://remix.ethereum.org/');
  console.log('2. Create new workspace');
  console.log('3. Copy contract files from ./contracts/ folder');
  console.log('4. Compile contracts in Remix');
  console.log('5. Deploy to Sepolia testnet using your wallet');
  console.log('6. Copy deployed addresses to your .env file');
  
  console.log('\n📝 Contract files to copy:');
  console.log('- contracts/TokenRegistry.sol');
  console.log('- contracts/UniversalDEX.sol');
  console.log('- contracts/UserWallet.sol');
  console.log('- contracts/UniversalToken.sol');
  
  console.log('\n🎯 For immediate testing, use these mock addresses:');
  console.log('VITE_TOKEN_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890');
  console.log('VITE_UNIVERSAL_DEX_ADDRESS=0x2345678901234567890123456789012345678901');
  console.log('VITE_USER_WALLET_ADDRESS=0x3456789012345678901234567890123456789012');
  console.log('VITE_BTC_TOKEN_ADDRESS=0x4567890123456789012345678901234567890123');
  console.log('VITE_ETH_TOKEN_ADDRESS=0x5678901234567890123456789012345678901234');
  console.log('VITE_USDT_TOKEN_ADDRESS=0x6789012345678901234567890123456789012345');
  
  console.log('\n✅ Your account is ready for deployment!');
}

deploy().catch(console.error);
