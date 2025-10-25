const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USDT_TOKEN_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';

// Простой ABI без модификаторов
const TOKEN_ABI = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

async function mintUSDT() {
    if (!PRIVATE_KEY) {
        console.error('❌ PRIVATE_KEY not found in .env file');
        process.exit(1);
    }

    try {
        // Используем простой RPC без сетевых настроек
        const provider = new ethers.providers.JsonRpcProvider('https://rpc.sepolia.org');
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const usdtContract = new ethers.Contract(USDT_TOKEN_ADDRESS, TOKEN_ABI, wallet);

        console.log('🚀 Minting 1,000,000 USDT...');
        
        const amount = ethers.utils.parseUnits('1000000', 6); // 1,000,000 USDT
        const ownerAddress = await wallet.getAddress();
        
        console.log(`Owner address: ${ownerAddress}`);
        
        const tx = await usdtContract.mint(ownerAddress, amount);
        console.log(`⏳ Transaction hash: ${tx.hash}`);
        
        await tx.wait();
        console.log('✅ Successfully minted 1,000,000 USDT!');
        
        const balance = await usdtContract.balanceOf(ownerAddress);
        console.log(`New balance: ${ethers.utils.formatUnits(balance, 6)} USDT`);

    } catch (error) {
        console.error('❌ Error minting USDT:', error);
    }
}

mintUSDT();
