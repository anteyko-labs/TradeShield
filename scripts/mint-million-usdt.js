const { ethers } = require('ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC = 'https://rpc.sepolia.org';

// Добавляем сеть вручную
const network = {
  name: 'sepolia',
  chainId: 11155111,
  ensAddress: null
};
const USDT_TOKEN_ADDRESS = '0x434897c0Be49cd3f8d9bed1e9C56F8016afd2Ee6';

const FullTokenABI = [
    "function mint(address to, uint256 amount) public onlyOwner",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function owner() view returns (address)"
];

async function mintMillionUSDT() {
    if (!PRIVATE_KEY || !USDT_TOKEN_ADDRESS) {
        console.error('❌ PRIVATE_KEY or USDT_TOKEN_ADDRESS not found in .env file');
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC, network);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const usdtContract = new ethers.Contract(USDT_TOKEN_ADDRESS, FullTokenABI, wallet);

    try {
        console.log('🚀 Minting 1,000,000 USDT to owner wallet...');

        // Проверяем, что мы владелец контракта
        const owner = await usdtContract.owner();
        const walletAddress = await wallet.getAddress();
        
        if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
            console.error('❌ Wallet is not the owner of the USDT contract');
            console.error(`Owner: ${owner}`);
            console.error(`Wallet: ${walletAddress}`);
            process.exit(1);
        }

        const usdtDecimals = await usdtContract.decimals();
        const amountToMint = ethers.utils.parseUnits('1000000', usdtDecimals); // 1,000,000 USDT

        const currentBalance = await usdtContract.balanceOf(walletAddress);
        console.log(`Current balance: ${ethers.utils.formatUnits(currentBalance, usdtDecimals)} USDT`);

        if (currentBalance.gte(amountToMint)) {
            console.log(`✅ Owner already has sufficient USDT balance (${ethers.utils.formatUnits(currentBalance, usdtDecimals)}).`);
            return;
        }

        const tx = await usdtContract.mint(walletAddress, amountToMint);
        console.log(`⏳ Transaction hash: ${tx.hash}`);
        console.log('Waiting for transaction to be confirmed...');
        
        await tx.wait();
        console.log(`✅ Successfully minted 1,000,000 USDT to owner wallet!`);

        const newBalance = await usdtContract.balanceOf(walletAddress);
        console.log(`New balance: ${ethers.utils.formatUnits(newBalance, usdtDecimals)} USDT`);

    } catch (error) {
        console.error('❌ Error minting USDT:', error);
        if (error.message.includes('Ownable: caller is not the owner')) {
            console.error('💡 Make sure the PRIVATE_KEY in your .env file belongs to the owner of the USDT contract.');
        }
    }
}

mintMillionUSDT();
