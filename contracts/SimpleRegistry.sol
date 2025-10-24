// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleRegistry {
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        string logoUrl;
        string description;
        uint8 decimals;
        bool isActive;
    }
    
    address public owner;
    mapping(address => TokenInfo) public tokens;
    mapping(string => address) public symbolToAddress;
    address[] public tokenAddresses;
    
    event TokenRegistered(address indexed tokenAddress, string name, string symbol);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerExistingToken(
        address tokenAddress,
        string memory name,
        string memory symbol,
        string memory logoUrl,
        string memory description,
        uint8 decimals
    ) public onlyOwner {
        require(tokens[tokenAddress].tokenAddress == address(0), "Token already registered");
        require(symbolToAddress[symbol] == address(0), "Symbol already exists");
        
        tokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            logoUrl: logoUrl,
            description: description,
            decimals: decimals,
            isActive: true
        });
        
        symbolToAddress[symbol] = tokenAddress;
        tokenAddresses.push(tokenAddress);
        
        emit TokenRegistered(tokenAddress, name, symbol);
    }
    
    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        return tokens[tokenAddress];
    }
    
    function getTokenBySymbol(string memory symbol) public view returns (address) {
        return symbolToAddress[symbol];
    }
    
    function getAllTokens() public view returns (address[] memory) {
        return tokenAddresses;
    }
}
