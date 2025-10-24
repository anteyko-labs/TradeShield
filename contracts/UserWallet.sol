// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenRegistry.sol";
import "./UniversalDEX.sol";

contract UserWallet is Ownable, ReentrancyGuard {
    struct Position {
        address token;
        uint256 balance;
        uint256 averagePrice;
        uint256 totalInvested;
    }
    
    TokenRegistry public tokenRegistry;
    UniversalDEX public dexContract;
    
    mapping(address => mapping(address => uint256)) public balances; // user => token => balance
    mapping(address => Position[]) public positions; // user => positions
    mapping(address => uint256) public totalDeposits; // user => total deposited
    mapping(address => uint256) public totalWithdrawals; // user => total withdrawn
    
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(address indexed user, address indexed token, uint256 amount);
    event TradeExecuted(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    
    constructor(address _tokenRegistry) {
        tokenRegistry = TokenRegistry(_tokenRegistry);
    }
    
    function setDEXContract(address _dexContract) public onlyOwner {
        dexContract = UniversalDEX(_dexContract);
    }
    
    function deposit(address token, uint256 amount) public nonReentrant {
        require(tokenRegistry.tokens(token).isActive, "Token not active");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Update user balance
        balances[msg.sender][token] += amount;
        totalDeposits[msg.sender] += amount;
        
        // Update or create position
        _updatePosition(msg.sender, token, amount, true);
        
        emit Deposit(msg.sender, token, amount);
    }
    
    function withdraw(address token, uint256 amount) public nonReentrant {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        // Update user balance
        balances[msg.sender][token] -= amount;
        totalWithdrawals[msg.sender] += amount;
        
        // Update position
        _updatePosition(msg.sender, token, amount, false);
        
        // Transfer tokens to user
        IERC20(token).transfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, token, amount);
    }
    
    function executeTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) public nonReentrant {
        require(balances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");
        require(tokenRegistry.tokens(tokenIn).isActive, "Input token not active");
        require(tokenRegistry.tokens(tokenOut).isActive, "Output token not active");
        
        // Approve DEX to spend tokens
        IERC20(tokenIn).approve(address(dexContract), amountIn);
        
        // Execute trade through DEX
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        dexContract.swap(tokenIn, tokenOut, amountIn, minAmountOut);
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        uint256 amountOut = balanceAfter - balanceBefore;
        
        // Update balances
        balances[msg.sender][tokenIn] -= amountIn;
        balances[msg.sender][tokenOut] += amountOut;
        
        // Update positions
        _updatePosition(msg.sender, tokenIn, amountIn, false);
        _updatePosition(msg.sender, tokenOut, amountOut, true);
        
        emit TradeExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function _updatePosition(
        address user,
        address token,
        uint256 amount,
        bool isDeposit
    ) internal {
        Position[] storage userPositions = positions[user];
        
        // Find existing position for this token
        for (uint256 i = 0; i < userPositions.length; i++) {
            if (userPositions[i].token == token) {
                if (isDeposit) {
                    // Update average price calculation
                    uint256 currentValue = userPositions[i].balance * userPositions[i].averagePrice;
                    uint256 newValue = amount * _getCurrentPrice(token);
                    uint256 totalValue = currentValue + newValue;
                    uint256 totalAmount = userPositions[i].balance + amount;
                    
                    userPositions[i].averagePrice = totalValue / totalAmount;
                    userPositions[i].balance = totalAmount;
                    userPositions[i].totalInvested += amount * _getCurrentPrice(token);
                } else {
                    userPositions[i].balance -= amount;
                    if (userPositions[i].balance == 0) {
                        // Remove position if balance is zero
                        for (uint256 j = i; j < userPositions.length - 1; j++) {
                            userPositions[j] = userPositions[j + 1];
                        }
                        userPositions.pop();
                    }
                }
                return;
            }
        }
        
        // Create new position if it doesn't exist and it's a deposit
        if (isDeposit) {
            userPositions.push(Position({
                token: token,
                balance: amount,
                averagePrice: _getCurrentPrice(token),
                totalInvested: amount * _getCurrentPrice(token)
            }));
        }
    }
    
    function _getCurrentPrice(address token) internal view returns (uint256) {
        // This is a simplified price function
        // In a real implementation, you would get prices from an oracle
        if (token == tokenRegistry.getTokenBySymbol("BTC")) {
            return 110203 * 1e8; // $110,203 per BTC
        } else if (token == tokenRegistry.getTokenBySymbol("ETH")) {
            return 3907 * 1e18; // $3,907 per ETH
        } else if (token == tokenRegistry.getTokenBySymbol("USDT")) {
            return 1 * 1e6; // $1 per USDT
        }
        return 1e18; // Default price
    }
    
    function getBalance(address user, address token) public view returns (uint256) {
        return balances[user][token];
    }
    
    function getPositions(address user) public view returns (Position[] memory) {
        return positions[user];
    }
    
    function getTotalValue(address user) public view returns (uint256) {
        Position[] memory userPositions = positions[user];
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < userPositions.length; i++) {
            totalValue += userPositions[i].balance * _getCurrentPrice(userPositions[i].token);
        }
        
        return totalValue;
    }
    
    function getPortfolioSummary(address user) public view returns (
        uint256 totalValue,
        uint256 totalInvested,
        uint256 totalPnl,
        uint256 totalPnlPercent
    ) {
        Position[] memory userPositions = positions[user];
        totalValue = getTotalValue(user);
        totalInvested = totalDeposits[user];
        
        if (totalInvested > 0) {
            totalPnl = totalValue > totalInvested ? totalValue - totalInvested : 0;
            totalPnlPercent = (totalPnl * 10000) / totalInvested; // Basis points
        }
    }
}