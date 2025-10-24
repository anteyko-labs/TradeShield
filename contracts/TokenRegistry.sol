// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenRegistry is Ownable {
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        string logoUrl;
        string description;
        uint8 decimals;
        bool isActive;
    }
    
    mapping(address => TokenInfo) public tokens;
    mapping(string => address) public symbolToAddress;
    address[] public tokenAddresses;
    
    event TokenRegistered(address indexed tokenAddress, string name, string symbol);
    event TokenDeactivated(address indexed tokenAddress);
    event TokenReactivated(address indexed tokenAddress);
    
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
    
    function deactivateToken(address tokenAddress) public onlyOwner {
        require(tokens[tokenAddress].tokenAddress != address(0), "Token not registered");
        tokens[tokenAddress].isActive = false;
        emit TokenDeactivated(tokenAddress);
    }
    
    function reactivateToken(address tokenAddress) public onlyOwner {
        require(tokens[tokenAddress].tokenAddress != address(0), "Token not registered");
        tokens[tokenAddress].isActive = true;
        emit TokenReactivated(tokenAddress);
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
    
    function getActiveTokens() public view returns (address[] memory) {
        address[] memory activeTokens = new address[](tokenAddresses.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            if (tokens[tokenAddresses[i]].isActive) {
                activeTokens[activeCount] = tokenAddresses[i];
                activeCount++;
            }
        }
        
        // Resize array to actual active count
        address[] memory result = new address[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeTokens[i];
        }
        
        return result;
    }
}