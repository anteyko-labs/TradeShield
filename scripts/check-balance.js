// Check balance of your account
const { ethers } = require('ethers');

async function checkBalance() {
  console.log('🔍 Checking account balances...');
  
  const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  // Your account
  const yourAccount = '0x513756b7eD711c472537cb497833c5d5Eb02A3Df';
  const yourBalance = await provider.getBalance(yourAccount);
  
  // Account from private key
  const privateKeyAccount = '0x7153b82C3858BA4b5030d3599Ef2daaC9b75dE31';
  const privateKeyBalance = await provider.getBalance(privateKeyAccount);
  
  console.log('\n📊 Account Balances:');
  console.log('Your account:', yourAccount);
  console.log('Balance:', ethers.utils.formatEther(yourBalance), 'ETH');
  console.log('');
  console.log('Private key account:', privateKeyAccount);
  console.log('Balance:', ethers.utils.formatEther(privateKeyBalance), 'ETH');
  
  console.log('\n💡 Recommendations:');
  if (yourBalance.gt(ethers.utils.parseEther('0.01'))) {
    console.log('✅ Use YOUR account for deployment (has ETH)');
    console.log('You can deploy contracts using your MetaMask wallet');
  } else if (privateKeyBalance.gt(ethers.utils.parseEther('0.01'))) {
    console.log('✅ Use PRIVATE KEY account for deployment (has ETH)');
  } else {
    console.log('❌ Both accounts need ETH');
    console.log('Get testnet ETH from: https://sepoliafaucet.com/');
    console.log('For your account:', yourAccount);
    console.log('For private key account:', privateKeyAccount);
  }
}

checkBalance().catch(console.error);
