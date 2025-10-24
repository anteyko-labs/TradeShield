// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/TokenRegistry.sol";
import "../contracts/UniversalDEX.sol";
import "../contracts/UserWallet.sol";
import "../contracts/UniversalToken.sol";

/**
 * @title DeployTradingSystem
 * @dev Скрипт для деплоя всей торговой системы
 */
contract DeployTradingSystem is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Деплой TokenRegistry
        console.log("Deploying TokenRegistry...");
        TokenRegistry tokenRegistry = new TokenRegistry();
        console.log("TokenRegistry deployed at:", address(tokenRegistry));
        
        // 2. Деплой UniversalDEX
        console.log("Deploying UniversalDEX...");
        UniversalDEX dex = new UniversalDEX(address(tokenRegistry));
        console.log("UniversalDEX deployed at:", address(dex));
        
        // 3. Деплой UserWallet
        console.log("Deploying UserWallet...");
        UserWallet userWallet = new UserWallet(address(tokenRegistry));
        console.log("UserWallet deployed at:", address(userWallet));
        
        // 4. Настройка UserWallet
        console.log("Setting DEX contract in UserWallet...");
        userWallet.setDEXContract(address(dex));
        
        // 5. Создание базовых токенов
        console.log("Creating base tokens...");
        
        // BTC токен
        UniversalToken btcToken = new UniversalToken(
            "Bitcoin",
            "BTC",
            8,
            21000000 * 10**8, // 21M BTC
            21000000 * 10**8, // Max supply 21M BTC
            "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
            "Bitcoin - the first cryptocurrency",
            deployer
        );
        console.log("BTC token deployed at:", address(btcToken));
        
        // ETH токен
        UniversalToken ethToken = new UniversalToken(
            "Ethereum",
            "ETH",
            18,
            120000000 * 10**18, // 120M ETH
            120000000 * 10**18, // Max supply 120M ETH
            "https://cryptologos.cc/logos/ethereum-eth-logo.png",
            "Ethereum - smart contract platform",
            deployer
        );
        console.log("ETH token deployed at:", address(ethToken));
        
        // USDT токен
        UniversalToken usdtToken = new UniversalToken(
            "Tether USD",
            "USDT",
            6,
            1000000000 * 10**6, // 1B USDT
            0, // Unlimited supply
            "https://cryptologos.cc/logos/tether-usdt-logo.png",
            "Tether USD - stablecoin",
            deployer
        );
        console.log("USDT token deployed at:", address(usdtToken));
        
        // 6. Регистрация токенов в TokenRegistry
        console.log("Registering tokens in TokenRegistry...");
        
        // Регистрируем существующие токены
        tokenRegistry.registerExistingToken(
            address(btcToken),
            "Bitcoin",
            "BTC",
            "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
            "Bitcoin - the first cryptocurrency",
            8
        );
        
        tokenRegistry.registerExistingToken(
            address(ethToken),
            "Ethereum",
            "ETH",
            "https://cryptologos.cc/logos/ethereum-eth-logo.png",
            "Ethereum - smart contract platform",
            18
        );
        
        tokenRegistry.registerExistingToken(
            address(usdtToken),
            "Tether USD",
            "USDT",
            "https://cryptologos.cc/logos/tether-usdt-logo.png",
            "Tether USD - stablecoin",
            6
        );
        
        // 7. Создание торговых пар
        console.log("Creating trading pairs...");
        
        // BTC/USDT пара
        btcToken.approve(address(dex), 100 * 10**8); // 100 BTC
        usdtToken.approve(address(dex), 11000000 * 10**6); // 11M USDT (100 BTC * 110,000)
        dex.createPair(address(btcToken), address(usdtToken), 100 * 10**8, 11000000 * 10**6);
        console.log("BTC/USDT pair created");
        
        // ETH/USDT пара
        ethToken.approve(address(dex), 1000 * 10**18); // 1000 ETH
        usdtToken.approve(address(dex), 3900000 * 10**6); // 3.9M USDT (1000 ETH * 3,900)
        dex.createPair(address(ethToken), address(usdtToken), 1000 * 10**18, 3900000 * 10**6);
        console.log("ETH/USDT pair created");
        
        // 8. Минт токенов для тестирования
        console.log("Minting test tokens...");
        
        // Минтим USDT для тестирования
        usdtToken.mint(deployer, 1000000 * 10**6); // 1M USDT
        console.log("Minted 1M USDT for testing");
        
        vm.stopBroadcast();
        
        // Выводим адреса контрактов
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("TokenRegistry:", address(tokenRegistry));
        console.log("UniversalDEX:", address(dex));
        console.log("UserWallet:", address(userWallet));
        console.log("BTC Token:", address(btcToken));
        console.log("ETH Token:", address(ethToken));
        console.log("USDT Token:", address(usdtToken));
        console.log("\n=== TRADING PAIRS ===");
        console.log("BTC/USDT pair created");
        console.log("ETH/USDT pair created");
        console.log("\n=== TEST TOKENS ===");
        console.log("1M USDT minted for testing");
        
        // Сохраняем адреса в файл
        string memory addresses = string(abi.encodePacked(
            "TOKEN_REGISTRY=", vm.toString(address(tokenRegistry)), "\n",
            "UNIVERSAL_DEX=", vm.toString(address(dex)), "\n",
            "USER_WALLET=", vm.toString(address(userWallet)), "\n",
            "BTC_TOKEN=", vm.toString(address(btcToken)), "\n",
            "ETH_TOKEN=", vm.toString(address(ethToken)), "\n",
            "USDT_TOKEN=", vm.toString(address(usdtToken)), "\n"
        ));
        
        vm.writeFile("deployed_addresses.env", addresses);
        console.log("\nContract addresses saved to deployed_addresses.env");
    }
}
