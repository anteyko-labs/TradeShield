// Compile contracts with OpenZeppelin dependencies
const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileWithOpenZeppelin() {
  console.log('🔨 Compiling contracts with OpenZeppelin...');
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  
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
  
  // Add OpenZeppelin contracts to sources
  const openzeppelinContracts = [
    '@openzeppelin/contracts/access/Ownable.sol',
    '@openzeppelin/contracts/security/ReentrancyGuard.sol',
    '@openzeppelin/contracts/token/ERC20/IERC20.sol',
    '@openzeppelin/contracts/token/ERC20/ERC20.sol',
    '@openzeppelin/contracts/security/Pausable.sol'
  ];
  
  openzeppelinContracts.forEach(contractPath => {
    const fullPath = path.join(nodeModulesDir, contractPath);
    if (fs.existsSync(fullPath)) {
      sources[contractPath] = {
        content: fs.readFileSync(fullPath, 'utf8')
      };
      console.log(`✅ Read OpenZeppelin ${contractPath}`);
    } else {
      console.log(`❌ OpenZeppelin contract not found: ${contractPath}`);
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

const compiled = compileWithOpenZeppelin();
if (compiled) {
  console.log('\n🎉 All contracts compiled successfully!');
  console.log('Compiled contracts saved to ./compiled/ directory');
} else {
  console.log('\n❌ Compilation failed');
}
