// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProxyRegistry
 * @dev Прокси-контракт для неизменяемых адресов контрактов
 * Это основной контракт, который никогда не меняется
 */
contract ProxyRegistry {
    address public owner;
    
    // Адреса основных контрактов
    address public tokenRegistry;
    address public dex;
    address public wallet;
    address public usdtToken;
    address public btcToken;
    address public ethToken;
    
    // Версии контрактов
    mapping(address => uint256) public contractVersions;
    
    // События
    event ContractUpdated(string indexed contractName, address indexed oldAddress, address indexed newAddress);
    event VersionUpdated(address indexed contractAddress, uint256 indexed newVersion);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Установить адрес TokenRegistry
     */
    function setTokenRegistry(address _tokenRegistry) external onlyOwner {
        address oldAddress = tokenRegistry;
        tokenRegistry = _tokenRegistry;
        contractVersions[_tokenRegistry] = block.timestamp;
        emit ContractUpdated("TokenRegistry", oldAddress, _tokenRegistry);
    }
    
    /**
     * @dev Установить адрес DEX
     */
    function setDEX(address _dex) external onlyOwner {
        address oldAddress = dex;
        dex = _dex;
        contractVersions[_dex] = block.timestamp;
        emit ContractUpdated("DEX", oldAddress, _dex);
    }
    
    /**
     * @dev Установить адрес Wallet
     */
    function setWallet(address _wallet) external onlyOwner {
        address oldAddress = wallet;
        wallet = _wallet;
        contractVersions[_wallet] = block.timestamp;
        emit ContractUpdated("Wallet", oldAddress, _wallet);
    }
    
    /**
     * @dev Установить адрес USDT токена
     */
    function setUSDTToken(address _usdtToken) external onlyOwner {
        address oldAddress = usdtToken;
        usdtToken = _usdtToken;
        contractVersions[_usdtToken] = block.timestamp;
        emit ContractUpdated("USDT", oldAddress, _usdtToken);
    }
    
    /**
     * @dev Установить адрес BTC токена
     */
    function setBTCToken(address _btcToken) external onlyOwner {
        address oldAddress = btcToken;
        btcToken = _btcToken;
        contractVersions[_btcToken] = block.timestamp;
        emit ContractUpdated("BTC", oldAddress, _btcToken);
    }
    
    /**
     * @dev Установить адрес ETH токена
     */
    function setETHToken(address _ethToken) external onlyOwner {
        address oldAddress = ethToken;
        ethToken = _ethToken;
        contractVersions[_ethToken] = block.timestamp;
        emit ContractUpdated("ETH", oldAddress, _ethToken);
    }
    
    /**
     * @dev Получить все адреса контрактов
     */
    function getAllAddresses() external view returns (
        address _tokenRegistry,
        address _dex,
        address _wallet,
        address _usdtToken,
        address _btcToken,
        address _ethToken
    ) {
        return (tokenRegistry, dex, wallet, usdtToken, btcToken, ethToken);
    }
    
    /**
     * @dev Получить версию контракта
     */
    function getContractVersion(address contractAddress) external view returns (uint256) {
        return contractVersions[contractAddress];
    }
}
