// Smart compiler that handles OpenZeppelin dependencies properly
const solc = require('solc');
const fs = require('fs');
const path = require('path');

function findOpenZeppelinContracts() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules', '@openzeppelin', 'contracts');
  const contracts = {};
  
  function scanDirectory(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, prefix + item + '/');
      } else if (item.endsWith('.sol')) {
        const contractPath = prefix + item;
        contracts[contractPath] = {
          content: fs.readFileSync(fullPath, 'utf8')
        };
      }
    });
  }
  
  scanDirectory(nodeModulesDir);
  return contracts;
}

function compileContracts() {
  console.log('🔨 Smart compilation with OpenZeppelin...');
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contracts = [
    'TokenRegistry.sol',
    'UniversalDEX.sol', 
    'UserWallet.sol',
    'UniversalToken.sol'
  ];
  
  const sources = {};
  
  // Read our contracts
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
  
  // Add all OpenZeppelin contracts
  console.log('📦 Scanning OpenZeppelin contracts...');
  const openzeppelinContracts = findOpenZeppelinContracts();
  Object.keys(openzeppelinContracts).forEach(contractPath => {
    sources[`@openzeppelin/contracts/${contractPath}`] = openzeppelinContracts[contractPath];
  });
  console.log(`✅ Found ${Object.keys(openzeppelinContracts).length} OpenZeppelin contracts`);
  
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
  
  console.log('⚙️ Compiling...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    console.log('❌ Compilation errors:');
    output.errors.forEach(error => {
      if (error.severity === 'error') {
        console.log(`❌ ${error.message}`);
      } else {
        console.log(`⚠️ ${error.message}`);
      }
    });
    
    // Check if we have any successful compilations
    const hasSuccessfulCompilations = Object.keys(output.contracts).some(contractName => 
      Object.keys(output.contracts[contractName]).length > 0
    );
    
    if (!hasSuccessfulCompilations) {
      console.log('❌ No contracts compiled successfully');
      return null;
    }
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
  console.log('\n🎉 Compilation completed!');
  console.log('Compiled contracts saved to ./compiled/ directory');
  
  // List successfully compiled contracts
  console.log('\n📋 Successfully compiled contracts:');
  Object.keys(compiled).forEach(contractName => {
    const contractKeys = Object.keys(compiled[contractName]);
    if (contractKeys.length > 0) {
      console.log(`✅ ${contractName}: ${contractKeys.join(', ')}`);
    }
  });
} else {
  console.log('\n❌ Compilation failed');
}
