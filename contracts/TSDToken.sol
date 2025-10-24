// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TSDToken - TradeShield Dollar
 * @dev Main utility token for TradeShield platform
 */
contract TSDToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18; // 100M TSD
    uint256 public constant BURN_RATE = 100; // 1% burn on transfer (100/10000)
    uint256 public constant STAKING_REWARD_RATE = 1000; // 10% APY (1000/10000)
    
    struct StakingInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 rewards;
        bool isStaked;
    }
    
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => uint256) public tradingDiscounts;
    
    uint256 public totalStaked;
    uint256 public totalBurned;
    
    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 timestamp);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TradingDiscountUpdated(address indexed user, uint256 discount);
    
    constructor() ERC20("TradeShield Dollar", "TSD") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Stake TSD tokens for rewards and trading discounts
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Calculate pending rewards if already staked
        if (stakingInfo[msg.sender].isStaked) {
            _calculateRewards(msg.sender);
        }
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking info
        stakingInfo[msg.sender].amount += amount;
        stakingInfo[msg.sender].timestamp = block.timestamp;
        stakingInfo[msg.sender].isStaked = true;
        
        totalStaked += amount;
        
        // Update trading discount based on staked amount
        _updateTradingDiscount(msg.sender);
        
        emit TokensStaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Unstake TSD tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakingInfo[msg.sender].isStaked, "Not staked");
        require(stakingInfo[msg.sender].amount >= amount, "Insufficient staked amount");
        
        // Calculate and claim rewards
        _calculateRewards(msg.sender);
        _claimRewards(msg.sender);
        
        // Update staking info
        stakingInfo[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        // Update trading discount
        _updateTradingDiscount(msg.sender);
        
        // If fully unstaked, mark as not staked
        if (stakingInfo[msg.sender].amount == 0) {
            stakingInfo[msg.sender].isStaked = false;
        }
        
        emit TokensUnstaked(msg.sender, amount, stakingInfo[msg.sender].rewards);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        require(stakingInfo[msg.sender].isStaked, "Not staked");
        
        _calculateRewards(msg.sender);
        _claimRewards(msg.sender);
    }
    
    /**
     * @dev Calculate staking rewards
     */
    function _calculateRewards(address user) internal {
        if (!stakingInfo[user].isStaked || stakingInfo[user].amount == 0) {
            return;
        }
        
        uint256 stakingDuration = block.timestamp - stakingInfo[user].timestamp;
        uint256 annualReward = (stakingInfo[user].amount * STAKING_REWARD_RATE) / 10000;
        uint256 timeBasedReward = (annualReward * stakingDuration) / 365 days;
        
        stakingInfo[user].rewards += timeBasedReward;
        stakingInfo[user].timestamp = block.timestamp;
    }
    
    /**
     * @dev Claim rewards internally
     */
    function _claimRewards(address user) internal {
        uint256 rewards = stakingInfo[user].rewards;
        if (rewards > 0) {
            stakingInfo[user].rewards = 0;
            _mint(user, rewards);
            emit RewardsClaimed(user, rewards);
        }
    }
    
    /**
     * @dev Update trading discount based on staked amount
     */
    function _updateTradingDiscount(address user) internal {
        uint256 stakedAmount = stakingInfo[user].amount;
        uint256 discount = 0;
        
        if (stakedAmount >= 10000 * 10**18) { // 10K TSD
            discount = 5000; // 50% discount
        } else if (stakedAmount >= 5000 * 10**18) { // 5K TSD
            discount = 3000; // 30% discount
        } else if (stakedAmount >= 1000 * 10**18) { // 1K TSD
            discount = 1000; // 10% discount
        }
        
        tradingDiscounts[user] = discount;
        emit TradingDiscountUpdated(user, discount);
    }
    
    /**
     * @dev Override transfer to include burn mechanism
     */
    function _transfer(address from, address to, uint256 amount) internal override {
        // Don't burn on mint/burn operations
        if (from != address(0) && to != address(0) && from != address(this)) {
            uint256 burnAmount = (amount * BURN_RATE) / 10000;
            if (burnAmount > 0) {
                super._transfer(from, address(0), burnAmount);
                totalBurned += burnAmount;
                emit TokensBurned(from, burnAmount);
                amount -= burnAmount;
            }
        }
        
        super._transfer(from, to, amount);
    }
    
    /**
     * @dev Get user's staking info
     */
    function getStakingInfo(address user) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 rewards,
        bool isStaked,
        uint256 discount
    ) {
        StakingInfo memory info = stakingInfo[user];
        return (
            info.amount,
            info.timestamp,
            info.rewards,
            info.isStaked,
            tradingDiscounts[user]
        );
    }
    
    /**
     * @dev Get pending rewards for a user
     */
    function getPendingRewards(address user) external view returns (uint256) {
        if (!stakingInfo[user].isStaked || stakingInfo[user].amount == 0) {
            return stakingInfo[user].rewards;
        }
        
        uint256 stakingDuration = block.timestamp - stakingInfo[user].timestamp;
        uint256 annualReward = (stakingInfo[user].amount * STAKING_REWARD_RATE) / 10000;
        uint256 timeBasedReward = (annualReward * stakingDuration) / 365 days;
        
        return stakingInfo[user].rewards + timeBasedReward;
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
     * @dev Mint new tokens (only for rewards)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Get total supply including burned tokens
     */
    function getTotalSupply() external view returns (uint256) {
        return totalSupply() + totalBurned;
    }
}
