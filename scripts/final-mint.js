const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USDT_TOKEN_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';

// ABI для USDT токена
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
        // Используем Alchemy RPC с явным указанием сети
        const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo');
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const usdtContract = new ethers.Contract(USDT_TOKEN_ADDRESS, TOKEN_ABI, wallet);

        console.log('🚀 Minting 1,000,000 USDT...');
        console.log(`Owner address: ${await wallet.getAddress()}`);
        
        const amount = ethers.utils.parseUnits('1000000', 6); // 1,000,000 USDT
        
        const tx = await usdtContract.mint(await wallet.getAddress(), amount);
        console.log(`⏳ Transaction hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log('✅ Successfully minted 1,000,000 USDT!');
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        
        const balance = await usdtContract.balanceOf(await wallet.getAddress());
        console.log(`New balance: ${ethers.utils.formatUnits(balance, 6)} USDT`);

    } catch (error) {
        console.error('❌ Error minting USDT:', error);
        
        // Если не получилось с Alchemy, попробуем с другим RPC
        try {
            console.log('🔄 Trying alternative RPC...');
            const provider2 = new ethers.providers.JsonRpcProvider('https://sepolia.drpc.org');
            const wallet2 = new ethers.Wallet(PRIVATE_KEY, provider2);
            const usdtContract2 = new ethers.Contract(USDT_TOKEN_ADDRESS, TOKEN_ABI, wallet2);

            const amount = ethers.utils.parseUnits('1000000', 6);
            const tx = await usdtContract2.mint(await wallet2.getAddress(), amount);
            console.log(`⏳ Transaction hash: ${tx.hash}`);
            
            await tx.wait();
            console.log('✅ Successfully minted 1,000,000 USDT with alternative RPC!');
            
        } catch (error2) {
            console.error('❌ Alternative RPC also failed:', error2);
        }
    }
}

mintUSDT();
