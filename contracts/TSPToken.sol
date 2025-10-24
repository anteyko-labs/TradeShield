// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TSPToken - TradeShield Protocol Points
 * @dev Reward token for platform activity
 */
contract TSPToken is ERC20, Ownable, Pausable {
    
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B TSP
    uint256 public constant TRADING_REWARD_RATE = 1; // 1 TSP per $1000 volume
    uint256 public constant STAKING_REWARD_RATE = 10; // 10 TSP per staked TSD
    uint256 public constant REFERRAL_REWARD = 100; // 100 TSP per referral
    
    mapping(address => uint256) public tradingVolume;
    mapping(address => uint256) public lastTradingReward;
    mapping(address => address) public referrer;
    mapping(address => uint256) public referralCount;
    
    address public dexContract;
    address public tsdToken;
    
    // Events
    event TradingReward(address indexed user, uint256 amount, uint256 volume);
    event StakingReward(address indexed user, uint256 amount);
    event ReferralReward(address indexed user, address indexed referrer, uint256 amount);
    event PointsBurned(address indexed user, uint256 amount);
    
    constructor() ERC20("TradeShield Protocol", "TSP") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Set DEX contract address
     */
    function setDEXContract(address _dexContract) external onlyOwner {
        dexContract = _dexContract;
    }
    
    /**
     * @dev Set TSD token address
     */
    function setTSDToken(address _tsdToken) external onlyOwner {
        tsdToken = _tsdToken;
    }
    
    /**
     * @dev Award trading points based on volume
     */
    function awardTradingPoints(address user, uint256 volumeUSD) external {
        require(msg.sender == dexContract, "Only DEX can award trading points");
        require(volumeUSD > 0, "Volume must be greater than 0");
        
        tradingVolume[user] += volumeUSD;
        
        // Calculate points based on volume
        uint256 points = (volumeUSD * TRADING_REWARD_RATE) / 1000; // 1 point per $1000
        
        if (points > 0) {
            _mint(user, points);
            emit TradingReward(user, points, volumeUSD);
        }
        
        lastTradingReward[user] = block.timestamp;
    }
    
    /**
     * @dev Award staking points
     */
    function awardStakingPoints(address user, uint256 stakedAmount) external {
        require(msg.sender == tsdToken, "Only TSD token can award staking points");
        require(stakedAmount > 0, "Staked amount must be greater than 0");
        
        uint256 points = (stakedAmount * STAKING_REWARD_RATE) / 10**18; // 10 points per TSD
        
        if (points > 0) {
            _mint(user, points);
            emit StakingReward(user, points);
        }
    }
    
    /**
     * @dev Set referrer
     */
    function setReferrer(address _referrer) external {
        require(_referrer != msg.sender, "Cannot refer yourself");
        require(_referrer != address(0), "Invalid referrer");
        require(referrer[msg.sender] == address(0), "Referrer already set");
        
        referrer[msg.sender] = _referrer;
        referralCount[_referrer]++;
        
        // Award referral points
        _mint(_referrer, REFERRAL_REWARD);
        _mint(msg.sender, REFERRAL_REWARD);
        
        emit ReferralReward(msg.sender, _referrer, REFERRAL_REWARD);
    }
    
    /**
     * @dev Burn points for benefits
     */
    function burnPoints(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient TSP balance");
        
        _burn(msg.sender, amount);
        emit PointsBurned(msg.sender, amount);
    }
    
    /**
     * @dev Get user's trading stats
     */
    function getTradingStats(address user) external view returns (
        uint256 volume,
        uint256 points,
        uint256 lastReward,
        address userReferrer,
        uint256 referrals
    ) {
        return (
            tradingVolume[user],
            balanceOf(user),
            lastTradingReward[user],
            referrer[user],
            referralCount[user]
        );
    }
    
    /**
     * @dev Calculate trading points for volume
     */
    function calculateTradingPoints(uint256 volumeUSD) external pure returns (uint256) {
        return (volumeUSD * TRADING_REWARD_RATE) / 1000;
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
     * @dev Mint new points (only for special rewards)
     */
    function mintPoints(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
