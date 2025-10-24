// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TradeShieldDEX
 * @dev MEV-Protected Decentralized Exchange
 */
contract TradeShieldDEX is ReentrancyGuard, Ownable, Pausable {
    
    struct ProtectedOrder {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        bytes32 salt;
        uint256 maxSlippage;
    }
    
    struct TradingPair {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalSupply;
        bool exists;
    }
    
    // State variables
    mapping(bytes32 => bool) public executedOrders;
    mapping(address => mapping(address => TradingPair)) public pairs;
    mapping(address => bool) public isTokenSupported;
    
    uint256 public constant FEE_RATE = 10; // 0.1% (10/10000)
    uint256 public constant MEV_PROTECTION_DELAY = 12 seconds;
    
    // Events
    event OrderExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );
    
    event MEVAttackBlocked(
        address indexed attacker,
        string attackType,
        uint256 savedAmount,
        uint256 timestamp
    );
    
    event PairCreated(
        address indexed token0,
        address indexed token1,
        address indexed pair
    );
    
    constructor() {
        // Initialize with supported tokens
        isTokenSupported[address(0)] = true; // ETH
    }
    
    /**
     * @dev Execute a protected order with MEV protection
     */
    function executeProtectedOrder(ProtectedOrder calldata order) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(block.timestamp <= order.deadline, "Order expired");
        require(order.amountIn > 0, "Invalid amount");
        
        bytes32 orderHash = keccak256(abi.encode(order));
        require(!executedOrders[orderHash], "Order already executed");
        
        // MEV Protection checks
        require(_isNotMEVAttack(order), "MEV attack detected");
        require(_checkSlippageProtection(order), "Slippage protection failed");
        
        // Execute the trade
        uint256 amountOut = _executeTrade(order);
        
        // Mark order as executed
        executedOrders[orderHash] = true;
        
        emit OrderExecuted(
            order.user,
            order.tokenIn,
            order.tokenOut,
            order.amountIn,
            amountOut,
            block.timestamp
        );
    }
    
    /**
     * @dev Create a new trading pair
     */
    function createPair(address tokenA, address tokenB) external onlyOwner {
        require(tokenA != tokenB, "Identical tokens");
        require(isTokenSupported[tokenA], "Token A not supported");
        require(isTokenSupported[tokenB], "Token B not supported");
        
        address pair = _getPairAddress(tokenA, tokenB);
        require(!pairs[tokenA][tokenB].exists, "Pair already exists");
        
        pairs[tokenA][tokenB] = TradingPair({
            token0: tokenA,
            token1: tokenB,
            reserve0: 0,
            reserve1: 0,
            totalSupply: 0,
            exists: true
        });
        
        emit PairCreated(tokenA, tokenB, pair);
    }
    
    /**
     * @dev Add liquidity to a pair
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        require(pairs[tokenA][tokenB].exists, "Pair does not exist");
        
        // Transfer tokens from user
        if (tokenA != address(0)) {
            IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        }
        if (tokenB != address(0)) {
            IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        }
        
        // Update reserves
        pairs[tokenA][tokenB].reserve0 += amountA;
        pairs[tokenA][tokenB].reserve1 += amountB;
    }
    
    /**
     * @dev Check if order is not a MEV attack
     */
    function _isNotMEVAttack(ProtectedOrder calldata order) internal view returns (bool) {
        // Check for front-running patterns
        if (order.salt == bytes32(0)) {
            return false; // Suspicious order
        }
        
        // Check for sandwich attack patterns
        if (order.maxSlippage > 500) { // 5% max slippage
            return false;
        }
        
        // Check for back-running patterns
        if (order.deadline < block.timestamp + MEV_PROTECTION_DELAY) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Check slippage protection
     */
    function _checkSlippageProtection(ProtectedOrder calldata order) internal view returns (bool) {
        // Calculate expected output
        uint256 expectedOut = _getAmountOut(order.amountIn, order.tokenIn, order.tokenOut);
        
        // Check if slippage is within limits
        uint256 minExpectedOut = (expectedOut * (10000 - order.maxSlippage)) / 10000;
        
        return order.minAmountOut >= minExpectedOut;
    }
    
    /**
     * @dev Execute the actual trade
     */
    function _executeTrade(ProtectedOrder calldata order) internal returns (uint256) {
        uint256 amountOut = _getAmountOut(order.amountIn, order.tokenIn, order.tokenOut);
        
        // Transfer tokens
        if (order.tokenIn != address(0)) {
            IERC20(order.tokenIn).transferFrom(order.user, address(this), order.amountIn);
        }
        
        if (order.tokenOut != address(0)) {
            IERC20(order.tokenOut).transfer(order.user, amountOut);
        }
        
        // Update reserves
        _updateReserves(order.tokenIn, order.tokenOut, order.amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev Calculate output amount using constant product formula
     */
    function _getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) internal view returns (uint256) {
        TradingPair memory pair = pairs[tokenIn][tokenOut];
        require(pair.exists, "Pair does not exist");
        
        uint256 reserveIn = tokenIn == pair.token0 ? pair.reserve0 : pair.reserve1;
        uint256 reserveOut = tokenOut == pair.token0 ? pair.reserve0 : pair.reserve1;
        
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (10000 - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10000) + amountInWithFee;
        
        return numerator / denominator;
    }
    
    /**
     * @dev Update reserves after trade
     */
    function _updateReserves(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    ) internal {
        TradingPair storage pair = pairs[tokenIn][tokenOut];
        
        if (tokenIn == pair.token0) {
            pair.reserve0 += amountIn;
            pair.reserve1 -= amountOut;
        } else {
            pair.reserve0 -= amountOut;
            pair.reserve1 += amountIn;
        }
    }
    
    /**
     * @dev Get pair address
     */
    function _getPairAddress(address tokenA, address tokenB) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(tokenA, tokenB)))));
    }
    
    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        isTokenSupported[token] = true;
    }
    
    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        isTokenSupported[token] = false;
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
     * @dev Withdraw fees
     */
    function withdrawFees(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
