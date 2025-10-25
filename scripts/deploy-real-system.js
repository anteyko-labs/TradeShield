const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Загружаем приватный ключ из .env
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY not found in .env file');
  process.exit(1);
}

async function deployRealSystem() {
  console.log('🚀 Deploying REAL system with proxy contracts...');
  
  // Подключаемся к Sepolia
  const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`Account: ${wallet.address}`);
  
  // Проверяем баланс
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther('0.01'))) {
    console.error('❌ Insufficient ETH balance. Need at least 0.01 ETH for deployment');
    process.exit(1);
  }
  
  try {
    // 1. Деплоим ProxyRegistry (главный контракт)
    console.log('\n📋 Deploying ProxyRegistry...');
    const ProxyRegistryFactory = new ethers.ContractFactory(
      require('../artifacts/contracts/ProxyRegistry.sol/ProxyRegistry.json').abi,
      require('../artifacts/contracts/ProxyRegistry.sol/ProxyRegistry.json').bytecode,
      wallet
    );
    const proxyRegistry = await ProxyRegistryFactory.deploy();
    await proxyRegistry.deployed();
    console.log(`✅ ProxyRegistry deployed at: ${proxyRegistry.address}`);
    
    // 2. Деплоим RealUSDT
    console.log('\n💰 Deploying RealUSDT...');
    const RealUSDTFactory = new ethers.ContractFactory(
      require('../artifacts/contracts/RealUSDT.sol/RealUSDT.json').abi,
      require('../artifacts/contracts/RealUSDT.sol/RealUSDT.json').bytecode,
      wallet
    );
    const realUSDT = await RealUSDTFactory.deploy();
    await realUSDT.deployed();
    console.log(`✅ RealUSDT deployed at: ${realUSDT.address}`);
    
    // 3. Деплоим RealUserWallet
    console.log('\n👛 Deploying RealUserWallet...');
    const RealUserWalletFactory = new ethers.ContractFactory(
      require('../artifacts/contracts/RealUserWallet.sol/RealUserWallet.json').abi,
      require('../artifacts/contracts/RealUserWallet.sol/RealUserWallet.json').bytecode,
      wallet
    );
    const realWallet = await RealUserWalletFactory.deploy(proxyRegistry.address);
    await realWallet.deployed();
    console.log(`✅ RealUserWallet deployed at: ${realWallet.address}`);
    
    // 4. Деплоим RealDEX
    console.log('\n🔄 Deploying RealDEX...');
    const RealDEXFactory = new ethers.ContractFactory(
      require('../artifacts/contracts/RealDEX.sol/RealDEX.json').abi,
      require('../artifacts/contracts/RealDEX.sol/RealDEX.json').bytecode,
      wallet
    );
    const realDEX = await RealDEXFactory.deploy(proxyRegistry.address, realWallet.address);
    await realDEX.deployed();
    console.log(`✅ RealDEX deployed at: ${realDEX.address}`);
    
    // 5. Настраиваем прокси
    console.log('\n🔧 Configuring proxy contracts...');
    
    // Устанавливаем адреса в прокси
    await proxyRegistry.setUSDTToken(realUSDT.address);
    await proxyRegistry.setWallet(realWallet.address);
    await proxyRegistry.setDEX(realDEX.address);
    
    // Настраиваем связи между контрактами
    await realUSDT.setWallet(realWallet.address);
    await realUSDT.setDEX(realDEX.address);
    await realWallet.setDEX(realDEX.address);
    
    console.log('✅ Proxy configuration complete');
    
    // 6. Создаем торговые пары
    console.log('\n📈 Creating trading pairs...');
    
    // Создаем пару USDT/BTC (моковая)
    const mockBTC = '0x0000000000000000000000000000000000000001'; // Моковый BTC
    await realDEX.createPair(realUSDT.address, mockBTC, ethers.utils.parseUnits('100000', 6), ethers.utils.parseUnits('1', 8));
    console.log('✅ USDT/BTC pair created');
    
    // 7. Минтим начальные USDT для тестирования
    console.log('\n💸 Minting initial USDT...');
    await realUSDT.mint(wallet.address, ethers.utils.parseUnits('1000000', 6)); // 1M USDT
    console.log('✅ 1M USDT minted for testing');
    
    // Сохраняем адреса
    const contractAddresses = {
      proxyRegistry: proxyRegistry.address,
      realUSDT: realUSDT.address,
      realWallet: realWallet.address,
      realDEX: realDEX.address,
      network: 'sepolia',
      chainId: 11155111
    };
    
    // Сохраняем в файл
    const addressesPath = path.join(__dirname, '../contract-addresses.json');
    fs.writeFileSync(addressesPath, JSON.stringify(contractAddresses, null, 2));
    
    console.log('\n🎉 REAL SYSTEM DEPLOYMENT SUCCESSFUL!');
    console.log('\n📋 Contract Addresses:');
    console.log(`ProxyRegistry: ${proxyRegistry.address}`);
    console.log(`RealUSDT: ${realUSDT.address}`);
    console.log(`RealWallet: ${realWallet.address}`);
    console.log(`RealDEX: ${realDEX.address}`);
    
    console.log('\n📝 Add these to your .env file:');
    console.log(`VITE_PROXY_REGISTRY_ADDRESS=${proxyRegistry.address}`);
    console.log(`VITE_REAL_USDT_ADDRESS=${realUSDT.address}`);
    console.log(`VITE_REAL_WALLET_ADDRESS=${realWallet.address}`);
    console.log(`VITE_REAL_DEX_ADDRESS=${realDEX.address}`);
    
    console.log('\n✅ All contracts deployed successfully!');
    console.log('✅ Proxy system configured');
    console.log('✅ Real USDT with initial balance ready');
    console.log('✅ Trading pairs created');
    console.log('✅ Ready for REAL trading!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployRealSystem();
