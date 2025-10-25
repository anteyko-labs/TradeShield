// ПРОВЕРКА ЗАМОРОЖЕННЫХ ТОКЕНОВ
const { ethers } = require('ethers');

async function checkFrozenTokens() {
  console.log('🔧 ПРОВЕРКА ЗАМОРОЖЕННЫХ ТОКЕНОВ');
  console.log('='.repeat(60));

  try {
    // Подключение к сети
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4c8f4a87f45c4e9d9a655e66dfacfcd9');
    
    // Адреса
    const BTC_ADDRESS = '0xC941593909348e941420D5404Ab00b5363b1dDB4';
    const DEX_ADDRESS = '0x72bfaa294E6443E944ECBdad428224cC050C658E';
    
    // ABI для токена
    const TOKEN_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    // Адрес пользователя
    const userAddress = '0x513756b7ed711c472537cb497833c5d5eb02a3df';
    
    console.log(`👤 Проверяем замороженные токены для: ${userAddress}`);
    
    const btcContract = new ethers.Contract(BTC_ADDRESS, TOKEN_ABI, provider);
    
    // Проверяем баланс
    const btcBalance = await btcContract.balanceOf(userAddress);
    const btcDecimals = await btcContract.decimals();
    const btcFormatted = ethers.utils.formatUnits(btcBalance, btcDecimals);
    
    console.log(`\n📊 BTC БАЛАНС:`);
    console.log(`💰 Общий баланс: ${btcFormatted} BTC`);
    
    // Проверяем allowance (сколько разрешено тратить DEX контракту)
    const allowance = await btcContract.allowance(userAddress, DEX_ADDRESS);
    const allowanceFormatted = ethers.utils.formatUnits(allowance, btcDecimals);
    
    console.log(`🔒 Разрешено DEX: ${allowanceFormatted} BTC`);
    
    // Проверяем доступный баланс
    const availableBalance = btcBalance.sub(allowance);
    const availableFormatted = ethers.utils.formatUnits(availableBalance, btcDecimals);
    
    console.log(`✅ Доступно для торговли: ${availableFormatted} BTC`);
    
    if (allowance.gt(0)) {
      console.log(`⚠️ ВНИМАНИЕ: ${allowanceFormatted} BTC заморожено для DEX!`);
      console.log(`💡 Это может быть причиной проблем с продажей`);
    } else {
      console.log(`✅ Нет замороженных токенов для DEX`);
    }
    
    // Проверяем, достаточно ли для минимальной продажи
    const minAmount = ethers.utils.parseUnits('0.001', btcDecimals);
    if (btcBalance.gte(minAmount)) {
      console.log(`✅ Достаточно BTC для продажи (>= 0.001)`);
    } else {
      console.log(`❌ Недостаточно BTC для продажи (< 0.001)`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки замороженных токенов:', error.message);
  }
  
  console.log('\n✅ ПРОВЕРКА ЗАВЕРШЕНА');
  console.log('='.repeat(60));
}

checkFrozenTokens();
