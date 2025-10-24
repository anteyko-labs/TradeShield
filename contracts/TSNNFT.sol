// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TSNNFT - TradeShield Network NFTs
 * @dev Collectible NFTs for achievements and status
 */
contract TSNNFT is ERC721, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct Achievement {
        string name;
        string description;
        string imageURI;
        uint256 rarity; // 1-5 (1=common, 5=legendary)
        bool isActive;
    }
    
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(string => bool) public achievementExists;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.01 ether;
    
    // Events
    event AchievementMinted(address indexed user, uint256 tokenId, string achievement);
    event AchievementCreated(string name, uint256 rarity);
    event AchievementUpdated(uint256 tokenId, string newURI);
    
    constructor() ERC721("TradeShield Network", "TSN") {
        _createDefaultAchievements();
    }
    
    /**
     * @dev Create default achievements
     */
    function _createDefaultAchievements() internal {
        _createAchievement(
            "First Trade",
            "Completed your first trade on TradeShield",
            "https://api.tradeshield.com/nft/first-trade.json",
            1
        );
        
        _createAchievement(
            "MEV Protector",
            "Blocked 100 MEV attacks",
            "https://api.tradeshield.com/nft/mev-protector.json",
            3
        );
        
        _createAchievement(
            "Volume Master",
            "Traded $1M+ volume",
            "https://api.tradeshield.com/nft/volume-master.json",
            4
        );
        
        _createAchievement(
            "Staking Legend",
            "Staked 10K+ TSD tokens",
            "https://api.tradeshield.com/nft/staking-legend.json",
            5
        );
    }
    
    /**
     * @dev Create a new achievement
     */
    function _createAchievement(
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 rarity
    ) internal {
        require(rarity >= 1 && rarity <= 5, "Invalid rarity");
        require(!achievementExists[name], "Achievement already exists");
        
        uint256 achievementId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        achievements[achievementId] = Achievement({
            name: name,
            description: description,
            imageURI: imageURI,
            rarity: rarity,
            isActive: true
        });
        
        achievementExists[name] = true;
        emit AchievementCreated(name, rarity);
    }
    
    /**
     * @dev Mint achievement NFT
     */
    function mintAchievement(
        address to,
        string memory achievementName
    ) external onlyOwner {
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(achievementExists[achievementName], "Achievement does not exist");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        // Find achievement by name
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (keccak256(bytes(achievements[i].name)) == keccak256(bytes(achievementName))) {
                _setTokenURI(tokenId, achievements[i].imageURI);
                userAchievements[to].push(tokenId);
                break;
            }
        }
        
        emit AchievementMinted(to, tokenId, achievementName);
    }
    
    /**
     * @dev Mint multiple achievements
     */
    function mintMultipleAchievements(
        address to,
        string[] memory achievementNames
    ) external onlyOwner {
        for (uint256 i = 0; i < achievementNames.length; i++) {
            mintAchievement(to, achievementNames[i]);
        }
    }
    
    /**
     * @dev Get user's achievements
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userAchievements[user];
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 rarity,
        bool isActive
    ) {
        Achievement memory achievement = achievements[tokenId];
        return (
            achievement.name,
            achievement.description,
            achievement.imageURI,
            achievement.rarity,
            achievement.isActive
        );
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Get rarity distribution
     */
    function getRarityDistribution() external view returns (uint256[5] memory) {
        uint256[5] memory distribution;
        
        for (uint256 i = 0; i < totalSupply(); i++) {
            if (achievements[i].isActive) {
                distribution[achievements[i].rarity - 1]++;
            }
        }
        
        return distribution;
    }
    
    /**
     * @dev Update achievement URI
     */
    function updateAchievementURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newURI);
        emit AchievementUpdated(tokenId, newURI);
    }
    
    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override tokenURI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override _burn
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
