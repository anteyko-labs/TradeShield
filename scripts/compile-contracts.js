const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Список контрактов для компиляции
const contracts = [
  'ProxyRegistry.sol',
  'RealUSDT.sol', 
  'RealUserWallet.sol',
  'RealDEX.sol'
];

async function compileContracts() {
  console.log('🔨 Compiling contracts...');
  
  const sources = {};
  const contractsDir = path.join(__dirname, '../contracts');
  
  // Читаем все контракты
  for (const contractName of contracts) {
    const contractPath = path.join(contractsDir, contractName);
    if (fs.existsSync(contractPath)) {
      sources[contractName] = {
        content: fs.readFileSync(contractPath, 'utf8')
      };
      console.log(`✅ Loaded ${contractName}`);
    } else {
      console.log(`❌ Contract not found: ${contractName}`);
    }
  }
  
  // Настройки компилятора
  const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };
  
  try {
    // Компилируем
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
      console.log('❌ Compilation errors:');
      output.errors.forEach(error => {
        console.log(`  ${error.message}`);
      });
      return false;
    }
    
    // Создаем папку artifacts если не существует
    const artifactsDir = path.join(__dirname, '../artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    // Сохраняем артефакты
    for (const contractName of contracts) {
      const contractPath = contractName.replace('.sol', '');
      const contractDir = path.join(artifactsDir, `contracts/${contractPath}.sol`);
      
      if (!fs.existsSync(contractDir)) {
        fs.mkdirSync(contractDir, { recursive: true });
      }
      
      const contractOutput = output.contracts[contractName];
      if (contractOutput) {
        for (const contract in contractOutput) {
          const artifact = {
            abi: contractOutput[contract].abi,
            bytecode: contractOutput[contract].evm.bytecode.object
          };
          
          const artifactPath = path.join(contractDir, `${contract}.json`);
          fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
          console.log(`✅ Compiled ${contractName}:${contract}`);
        }
      }
    }
    
    console.log('🎉 All contracts compiled successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Compilation failed:', error);
    return false;
  }
}

compileContracts();