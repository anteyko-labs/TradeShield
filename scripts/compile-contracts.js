// Compile contracts using solc
const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileContracts() {
  console.log('🔨 Compiling contracts...');
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contracts = [
    'TokenRegistry.sol',
    'UniversalDEX.sol', 
    'UserWallet.sol',
    'UniversalToken.sol'
  ];
  
  const sources = {};
  
  // Read contract files
  contracts.forEach(contract => {
    const contractPath = path.join(contractsDir, contract);
    if (fs.existsSync(contractPath)) {
      sources[contract] = {
        content: fs.readFileSync(contractPath, 'utf8')
      };
      console.log(`✅ Read ${contract}`);
    } else {
      console.log(`❌ Contract not found: ${contract}`);
    }
  });
  
  // Compile contracts
  const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    console.log('❌ Compilation errors:');
    output.errors.forEach(error => {
      console.log(error.message);
    });
    return null;
  }
  
  console.log('✅ Contracts compiled successfully!');
  
  // Save compiled contracts
  const compiledDir = path.join(__dirname, '..', 'compiled');
  if (!fs.existsSync(compiledDir)) {
    fs.mkdirSync(compiledDir);
  }
  
  Object.keys(output.contracts).forEach(contractName => {
    const contract = output.contracts[contractName];
    Object.keys(contract).forEach(contractKey => {
      const contractData = contract[contractKey];
      const filename = `${contractKey}.json`;
      const filepath = path.join(compiledDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(contractData, null, 2));
      console.log(`✅ Saved ${filename}`);
    });
  });
  
  return output.contracts;
}

const compiled = compileContracts();
if (compiled) {
  console.log('\n🎉 All contracts compiled successfully!');
  console.log('Compiled contracts saved to ./compiled/ directory');
} else {
  console.log('\n❌ Compilation failed');
}
