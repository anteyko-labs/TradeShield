// Check which account corresponds to your private key
const { ethers } = require('ethers');

async function checkPrivateKey() {
  console.log('🔍 Checking private key...');
  
  const PRIVATE_KEY = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
  const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet('0x' + PRIVATE_KEY, provider);
  
  console.log('Private key:', PRIVATE_KEY);
  console.log('Account address:', wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.utils.formatEther(balance), 'ETH');
  
  if (balance.gt(ethers.utils.parseEther('0.01'))) {
    console.log('\n✅ This account has enough ETH for deployment!');
    console.log('You can use this account to deploy contracts.');
  } else {
    console.log('\n❌ This account needs ETH');
    console.log('Get testnet ETH from: https://sepoliafaucet.com/');
    console.log('For account:', wallet.address);
  }
  
  console.log('\n📝 Your account details:');
  console.log('Address:', wallet.address);
  console.log('Private key:', PRIVATE_KEY);
}

checkPrivateKey().catch(console.error);
