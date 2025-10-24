// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract UniversalToken is ERC20, Ownable, Pausable {
    uint8 private _decimals;
    uint256 private _maxSupply;
    string private _logoUrl;
    string private _description;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 maxSupply_,
        string memory logoUrl,
        string memory description,
        address owner
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _maxSupply = maxSupply_;
        _logoUrl = logoUrl;
        _description = description;
        _transferOwnership(owner);
        
        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }
    
    function logoUrl() public view returns (string memory) {
        return _logoUrl;
    }
    
    function description() public view returns (string memory) {
        return _description;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(_maxSupply == 0 || totalSupply() + amount <= _maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers are paused");
    }
}