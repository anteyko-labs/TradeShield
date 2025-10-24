// Simple deployment script for basic contracts
const { ethers } = require('ethers');
const solc = require('solc');
const fs = require('fs');
const path = require('path');

async function deploySimpleContracts() {
  console.log('🚀 Deploying simple contracts...');
  
  const PRIVATE_KEY = '22547068237db8ba6738009e6cc6279e33cec1d5665033b0b881fc49b11e71ba';
  const RPC_URL = 'https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9';
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet('0x' + PRIVATE_KEY, provider);
  
  console.log('Account:', wallet.address);
  console.log('Balance:', ethers.utils.formatEther(await provider.getBalance(wallet.address)), 'ETH');
  
  // Compile SimpleToken
  console.log('\n🔨 Compiling SimpleToken...');
  const tokenSource = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'SimpleToken.sol'), 'utf8');
  const tokenInput = {
    language: 'Solidity',
    sources: { 'SimpleToken.sol': { content: tokenSource } },
    settings: { outputSelection: { '*': { '*': ['*'] } } }
  };
  const tokenOutput = JSON.parse(solc.compile(JSON.stringify(tokenInput)));
  
  if (tokenOutput.errors) {
    console.log('❌ Token compilation errors:', tokenOutput.errors);
    return;
  }
  
  const tokenContract = tokenOutput.contracts['SimpleToken.sol']['SimpleToken'];
  const tokenFactory = new ethers.ContractFactory(
    tokenContract.abi,
    tokenContract.evm.bytecode.object,
    wallet
  );
  
  // Deploy SimpleToken (BTC)
  console.log('\n🪙 Deploying BTC Token...');
  const btcToken = await tokenFactory.deploy(
    'Bitcoin',
    'BTC',
    8,
    ethers.utils.parseUnits('21000000', 8),
    ethers.utils.parseUnits('21000000', 8),
    'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'Bitcoin - the first cryptocurrency',
    wallet.address
  );
  await btcToken.deployed();
  console.log('✅ BTC Token deployed at:', btcToken.address);
  
  // Deploy SimpleToken (ETH)
  console.log('\n🪙 Deploying ETH Token...');
  const ethToken = await tokenFactory.deploy(
    'Ethereum',
    'ETH',
    18,
    ethers.utils.parseEther('120000000'),
    ethers.utils.parseEther('120000000'),
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'Ethereum - smart contract platform',
    wallet.address
  );
  await ethToken.deployed();
  console.log('✅ ETH Token deployed at:', ethToken.address);
  
  // Deploy SimpleToken (USDT)
  console.log('\n🪙 Deploying USDT Token...');
  const usdtToken = await tokenFactory.deploy(
    'Tether USD',
    'USDT',
    6,
    ethers.utils.parseUnits('1000000000', 6),
    ethers.utils.parseUnits('0', 6),
    'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'Tether USD - stablecoin',
    wallet.address
  );
  await usdtToken.deployed();
  console.log('✅ USDT Token deployed at:', usdtToken.address);
  
  // Compile SimpleRegistry
  console.log('\n🔨 Compiling SimpleRegistry...');
  const registrySource = fs.readFileSync(path.join(__dirname, '..', 'contracts', 'SimpleRegistry.sol'), 'utf8');
  const registryInput = {
    language: 'Solidity',
    sources: { 'SimpleRegistry.sol': { content: registrySource } },
    settings: { outputSelection: { '*': { '*': ['*'] } } }
  };
  const registryOutput = JSON.parse(solc.compile(JSON.stringify(registryInput)));
  
  if (registryOutput.errors) {
    console.log('❌ Registry compilation errors:', registryOutput.errors);
    return;
  }
  
  const registryContract = registryOutput.contracts['SimpleRegistry.sol']['SimpleRegistry'];
  const registryFactory = new ethers.ContractFactory(
    registryContract.abi,
    registryContract.evm.bytecode.object,
    wallet
  );
  
  // Deploy SimpleRegistry
  console.log('\n📋 Deploying SimpleRegistry...');
  const registry = await registryFactory.deploy();
  await registry.deployed();
  console.log('✅ SimpleRegistry deployed at:', registry.address);
  
  // Register tokens
  console.log('\n📝 Registering tokens...');
  await registry.registerExistingToken(
    btcToken.address,
    'Bitcoin',
    'BTC',
    'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'Bitcoin - the first cryptocurrency',
    8
  );
  console.log('✅ BTC token registered');
  
  await registry.registerExistingToken(
    ethToken.address,
    'Ethereum',
    'ETH',
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'Ethereum - smart contract platform',
    18
  );
  console.log('✅ ETH token registered');
  
  await registry.registerExistingToken(
    usdtToken.address,
    'Tether USD',
    'USDT',
    'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'Tether USD - stablecoin',
    6
  );
  console.log('✅ USDT token registered');
  
  // Mint test USDT
  console.log('\n💰 Minting test USDT...');
  await usdtToken.mint(wallet.address, ethers.utils.parseUnits('1000000', 6));
  console.log('✅ 1M USDT minted for testing');
  
  console.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
  console.log('\n📋 Contract Addresses:');
  console.log('SimpleRegistry:', registry.address);
  console.log('BTC Token:', btcToken.address);
  console.log('ETH Token:', ethToken.address);
  console.log('USDT Token:', usdtToken.address);
  
  console.log('\n📝 Add these to your .env file:');
  console.log(`VITE_TOKEN_REGISTRY_ADDRESS=${registry.address}`);
  console.log(`VITE_UNIVERSAL_DEX_ADDRESS=0x0000000000000000000000000000000000000000`);
  console.log(`VITE_USER_WALLET_ADDRESS=0x0000000000000000000000000000000000000000`);
  console.log(`VITE_BTC_TOKEN_ADDRESS=${btcToken.address}`);
  console.log(`VITE_ETH_TOKEN_ADDRESS=${ethToken.address}`);
  console.log(`VITE_USDT_TOKEN_ADDRESS=${usdtToken.address}`);
}

deploySimpleContracts().catch(console.error);
