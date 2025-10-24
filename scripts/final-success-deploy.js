// Final successful deployment script
const { ethers } = require('ethers');
const solc = require('solc');
const fs = require('fs');
const path = require('path');

async function deploySuccessfully() {
  console.log('🚀 Final successful deployment...');
  
  const PRIVATE_KEY = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
  const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet('0x' + PRIVATE_KEY, provider);
  
  console.log('Account:', wallet.address);
  console.log('Balance:', ethers.utils.formatEther(await provider.getBalance(wallet.address)), 'ETH');
  
  try {
    // Deploy FullRegistry
    console.log('\n📋 Deploying FullRegistry...');
    const registrySource = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'FullRegistry.sol'), 'utf8');
    const registryInput = {
      language: 'Solidity',
      sources: { 'FullRegistry.sol': { content: registrySource } },
      settings: { outputSelection: { '*': { '*': ['*'] } } }
    };
    const registryOutput = JSON.parse(solc.compile(JSON.stringify(registryInput)));
    const registryContract = registryOutput.contracts['FullRegistry.sol']['FullRegistry'];
    const registryFactory = new ethers.ContractFactory(registryContract.abi, registryContract.evm.bytecode.object, wallet);
    const registry = await registryFactory.deploy();
    await registry.deployed();
    console.log('✅ FullRegistry deployed at:', registry.address);
    
    // Deploy FullToken
    console.log('\n🔨 Compiling FullToken...');
    const tokenSource = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'FullToken.sol'), 'utf8');
    const tokenInput = {
      language: 'Solidity',
      sources: { 'FullToken.sol': { content: tokenSource } },
      settings: { outputSelection: { '*': { '*': ['*'] } } }
    };
    const tokenOutput = JSON.parse(solc.compile(JSON.stringify(tokenInput)));
    const tokenContract = tokenOutput.contracts['FullToken.sol']['FullToken'];
    const tokenFactory = new ethers.ContractFactory(tokenContract.abi, tokenContract.evm.bytecode.object, wallet);
    
    // Deploy tokens
    console.log('\n🪙 Deploying tokens...');
    const btcToken = await tokenFactory.deploy('Bitcoin', 'BTC', 8, ethers.utils.parseUnits('21000000', 8), ethers.utils.parseUnits('21000000', 8), 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', 'Bitcoin - the first cryptocurrency', wallet.address);
    await btcToken.deployed();
    console.log('✅ BTC Token deployed at:', btcToken.address);
    
    const ethToken = await tokenFactory.deploy('Ethereum', 'ETH', 18, ethers.utils.parseEther('120000000'), ethers.utils.parseEther('120000000'), 'https://cryptologos.cc/logos/ethereum-eth-logo.png', 'Ethereum - smart contract platform', wallet.address);
    await ethToken.deployed();
    console.log('✅ ETH Token deployed at:', ethToken.address);
    
    const usdtToken = await tokenFactory.deploy('Tether USD', 'USDT', 6, ethers.utils.parseUnits('1000000000', 6), ethers.utils.parseUnits('0', 6), 'https://cryptologos.cc/logos/tether-usdt-logo.png', 'Tether USD - stablecoin', wallet.address);
    await usdtToken.deployed();
    console.log('✅ USDT Token deployed at:', usdtToken.address);
    
    // Deploy FullDEX
    console.log('\n🔨 Compiling FullDEX...');
    const dexSource = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'FullDEX.sol'), 'utf8');
    const dexInput = {
      language: 'Solidity',
      sources: { 'FullDEX.sol': { content: dexSource } },
      settings: { outputSelection: { '*': { '*': ['*'] } } }
    };
    const dexOutput = JSON.parse(solc.compile(JSON.stringify(dexInput)));
    const dexContract = dexOutput.contracts['FullDEX.sol']['FullDEX'];
    const dexFactory = new ethers.ContractFactory(dexContract.abi, dexContract.evm.bytecode.object, wallet);
    const dex = await dexFactory.deploy(registry.address);
    await dex.deployed();
    console.log('✅ FullDEX deployed at:', dex.address);
    
    // Deploy FullWallet
    console.log('\n🔨 Compiling FullWallet...');
    const walletSource = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'FullWallet.sol'), 'utf8');
    const walletInput = {
      language: 'Solidity',
      sources: { 'FullWallet.sol': { content: walletSource } },
      settings: { outputSelection: { '*': { '*': ['*'] } } }
    };
    const walletOutput = JSON.parse(solc.compile(JSON.stringify(walletInput)));
    const walletContract = walletOutput.contracts['FullWallet.sol']['FullWallet'];
    const walletFactory = new ethers.ContractFactory(walletContract.abi, walletContract.evm.bytecode.object, wallet);
    const userWallet = await walletFactory.deploy(registry.address);
    await userWallet.deployed();
    console.log('✅ FullWallet deployed at:', userWallet.address);
    
    // Setup contracts
    console.log('\n🔧 Setting up contracts...');
    await userWallet.setDEXContract(dex.address);
    console.log('✅ FullWallet configured with DEX address');
    
    // Register tokens
    console.log('\n📝 Registering tokens...');
    await registry.registerExistingToken(btcToken.address, 'Bitcoin', 'BTC', 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', 'Bitcoin - the first cryptocurrency', 8);
    console.log('✅ BTC token registered');
    
    await registry.registerExistingToken(ethToken.address, 'Ethereum', 'ETH', 'https://cryptologos.cc/logos/ethereum-eth-logo.png', 'Ethereum - smart contract platform', 18);
    console.log('✅ ETH token registered');
    
    await registry.registerExistingToken(usdtToken.address, 'Tether USD', 'USDT', 'https://cryptologos.cc/logos/tether-usdt-logo.png', 'Tether USD - stablecoin', 6);
    console.log('✅ USDT token registered');
    
    // Mint test USDT
    console.log('\n💰 Minting test USDT...');
    await usdtToken.mint(wallet.address, ethers.utils.parseUnits('1000000', 6)); // 1M USDT
    console.log('✅ 1M USDT minted for testing');
    
    // Save addresses
    const addresses = {
      TOKEN_REGISTRY: registry.address,
      UNIVERSAL_DEX: dex.address,
      USER_WALLET: userWallet.address,
      BTC_TOKEN: btcToken.address,
      ETH_TOKEN: ethToken.address,
      USDT_TOKEN: usdtToken.address
    };
    
    fs.writeFileSync('deployed_addresses.json', JSON.stringify(addresses, null, 2));
    
    console.log('\n🎉 COMPLETE DEPLOYMENT SUCCESSFUL!');
    console.log('\n📋 Contract Addresses:');
    console.log('FullRegistry:', registry.address);
    console.log('FullDEX:', dex.address);
    console.log('FullWallet:', userWallet.address);
    console.log('BTC Token:', btcToken.address);
    console.log('ETH Token:', ethToken.address);
    console.log('USDT Token:', usdtToken.address);
    
    console.log('\n📝 Add these to your .env file:');
    console.log(`VITE_TOKEN_REGISTRY_ADDRESS=${registry.address}`);
    console.log(`VITE_UNIVERSAL_DEX_ADDRESS=${dex.address}`);
    console.log(`VITE_USER_WALLET_ADDRESS=${userWallet.address}`);
    console.log(`VITE_BTC_TOKEN_ADDRESS=${btcToken.address}`);
    console.log(`VITE_ETH_TOKEN_ADDRESS=${ethToken.address}`);
    console.log(`VITE_USDT_TOKEN_ADDRESS=${usdtToken.address}`);
    
    console.log('\n✅ All contracts deployed successfully!');
    console.log('✅ Tokens registered in registry');
    console.log('✅ DEX and Wallet configured');
    console.log('✅ Test USDT minted');
    console.log('\n🚀 Ready for trading!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

deploySuccessfully().catch(console.error);
