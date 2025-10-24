const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  
  // Check if we have enough ETH
  const balance = await deployer.getBalance();
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.error("❌ Insufficient ETH balance. Please get testnet ETH from a faucet.");
    return;
  }
  
  try {
    // Deploy TokenRegistry
    console.log("\n📋 Deploying TokenRegistry...");
    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    const tokenRegistry = await TokenRegistry.deploy();
    await tokenRegistry.deployed();
    console.log("✅ TokenRegistry deployed at:", tokenRegistry.address);
    
    // Deploy UniversalDEX
    console.log("\n🔄 Deploying UniversalDEX...");
    const UniversalDEX = await ethers.getContractFactory("UniversalDEX");
    const dex = await UniversalDEX.deploy(tokenRegistry.address);
    await dex.deployed();
    console.log("✅ UniversalDEX deployed at:", dex.address);
    
    // Deploy UserWallet
    console.log("\n👛 Deploying UserWallet...");
    const UserWallet = await ethers.getContractFactory("UserWallet");
    const userWallet = await UserWallet.deploy(tokenRegistry.address);
    await userWallet.deployed();
    console.log("✅ UserWallet deployed at:", userWallet.address);
    
    // Setup UserWallet
    console.log("\n🔧 Setting up UserWallet...");
    await userWallet.setDEXContract(dex.address);
    console.log("✅ UserWallet configured with DEX address");
    
    // Deploy base tokens
    console.log("\n🪙 Deploying base tokens...");
    
    // BTC Token
    const UniversalToken = await ethers.getContractFactory("UniversalToken");
    const btcToken = await UniversalToken.deploy(
      'Bitcoin',
      'BTC',
      8,
      ethers.utils.parseUnits('21000000', 8), // 21M BTC
      ethers.utils.parseUnits('21000000', 8), // Max supply 21M BTC
      'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      'Bitcoin - the first cryptocurrency',
      deployer.address
    );
    await btcToken.deployed();
    console.log("✅ BTC token deployed at:", btcToken.address);
    
    // ETH Token
    const ethToken = await UniversalToken.deploy(
      'Ethereum',
      'ETH',
      18,
      ethers.utils.parseEther('120000000'), // 120M ETH
      ethers.utils.parseEther('120000000'), // Max supply 120M ETH
      'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      'Ethereum - smart contract platform',
      deployer.address
    );
    await ethToken.deployed();
    console.log("✅ ETH token deployed at:", ethToken.address);
    
    // USDT Token
    const usdtToken = await UniversalToken.deploy(
      'Tether USD',
      'USDT',
      6,
      ethers.utils.parseUnits('1000000000', 6), // 1B USDT
      ethers.utils.parseUnits('0', 6), // Unlimited supply
      'https://cryptologos.cc/logos/tether-usdt-logo.png',
      'Tether USD - stablecoin',
      deployer.address
    );
    await usdtToken.deployed();
    console.log("✅ USDT token deployed at:", usdtToken.address);
    
    // Register tokens in TokenRegistry
    console.log("\n📝 Registering tokens in TokenRegistry...");
    
    await tokenRegistry.registerExistingToken(
      btcToken.address,
      'Bitcoin',
      'BTC',
      'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      'Bitcoin - the first cryptocurrency',
      8
    );
    console.log("✅ BTC token registered");
    
    await tokenRegistry.registerExistingToken(
      ethToken.address,
      'Ethereum',
      'ETH',
      'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      'Ethereum - smart contract platform',
      18
    );
    console.log("✅ ETH token registered");
    
    await tokenRegistry.registerExistingToken(
      usdtToken.address,
      'Tether USD',
      'USDT',
      'https://cryptologos.cc/logos/tether-usdt-logo.png',
      'Tether USD - stablecoin',
      6
    );
    console.log("✅ USDT token registered");
    
    // Create trading pairs
    console.log("\n💱 Creating trading pairs...");
    
    // Approve tokens for DEX
    await btcToken.approve(dex.address, ethers.utils.parseUnits('100', 8));
    await usdtToken.approve(dex.address, ethers.utils.parseUnits('11000000', 6));
    
    // Create BTC/USDT pair
    await dex.createPair(
      btcToken.address,
      usdtToken.address,
      ethers.utils.parseUnits('100', 8), // 100 BTC
      ethers.utils.parseUnits('11000000', 6) // 11M USDT
    );
    console.log("✅ BTC/USDT pair created");
    
    // Approve ETH for DEX
    await ethToken.approve(dex.address, ethers.utils.parseEther('1000'));
    await usdtToken.approve(dex.address, ethers.utils.parseUnits('3900000', 6));
    
    // Create ETH/USDT pair
    await dex.createPair(
      ethToken.address,
      usdtToken.address,
      ethers.utils.parseEther('1000'), // 1000 ETH
      ethers.utils.parseUnits('3900000', 6) // 3.9M USDT
    );
    console.log("✅ ETH/USDT pair created");
    
    // Mint test USDT
    console.log("\n💰 Minting test USDT...");
    await usdtToken.mint(deployer.address, ethers.utils.parseUnits('1000000', 6)); // 1M USDT
    console.log("✅ 1M USDT minted for testing");
    
    // Save addresses to file
    const addresses = {
      TOKEN_REGISTRY: tokenRegistry.address,
      UNIVERSAL_DEX: dex.address,
      USER_WALLET: userWallet.address,
      BTC_TOKEN: btcToken.address,
      ETH_TOKEN: ethToken.address,
      USDT_TOKEN: usdtToken.address
    };
    
    const fs = require('fs');
    fs.writeFileSync('deployed_addresses.json', JSON.stringify(addresses, null, 2));
    
    console.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Contract Addresses:');
    console.log('TokenRegistry:', tokenRegistry.address);
    console.log('UniversalDEX:', dex.address);
    console.log('UserWallet:', userWallet.address);
    console.log('BTC Token:', btcToken.address);
    console.log('ETH Token:', ethToken.address);
    console.log('USDT Token:', usdtToken.address);
    
    console.log('\n📝 Add these to your .env file:');
    console.log(`VITE_TOKEN_REGISTRY_ADDRESS=${tokenRegistry.address}`);
    console.log(`VITE_UNIVERSAL_DEX_ADDRESS=${dex.address}`);
    console.log(`VITE_USER_WALLET_ADDRESS=${userWallet.address}`);
    console.log(`VITE_BTC_TOKEN_ADDRESS=${btcToken.address}`);
    console.log(`VITE_ETH_TOKEN_ADDRESS=${ethToken.address}`);
    console.log(`VITE_USDT_TOKEN_ADDRESS=${usdtToken.address}`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
