// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {TradeShieldDEX} from "../contracts/TradeShieldDEX.sol";
import {TSDToken} from "../contracts/TSDToken.sol";
import {TSPToken} from "../contracts/TSPToken.sol";
import {TSNNFT} from "../contracts/TSNNFT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy TSD Token
        TSDToken tsdToken = new TSDToken();
        console.log("TSD Token deployed at:", address(tsdToken));
        
        // Deploy TSP Token
        TSPToken tspToken = new TSPToken();
        console.log("TSP Token deployed at:", address(tspToken));
        
        // Deploy TSN NFT
        TSNNFT tsnNFT = new TSNNFT();
        console.log("TSN NFT deployed at:", address(tsnNFT));
        
        // Deploy DEX
        TradeShieldDEX dex = new TradeShieldDEX();
        console.log("DEX deployed at:", address(dex));
        
        // Set up token relationships
        tspToken.setTSDToken(address(tsdToken));
        tspToken.setDEXContract(address(dex));
        
        // Add supported tokens to DEX
        dex.addSupportedToken(address(tsdToken));
        dex.addSupportedToken(address(tspToken));
        
        // Create initial trading pairs
        dex.createPair(address(0), address(tsdToken)); // ETH/TSD
        dex.createPair(address(tsdToken), address(tspToken)); // TSD/TSP
        
        vm.stopBroadcast();
        
        console.log("Deployment completed successfully!");
        console.log("Contract addresses:");
        console.log("TSD Token:", address(tsdToken));
        console.log("TSP Token:", address(tspToken));
        console.log("TSN NFT:", address(tsnNFT));
        console.log("DEX:", address(dex));
    }
}
