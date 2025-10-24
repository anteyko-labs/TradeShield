// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FullWallet {
    struct Position {
        address token;
        uint256 balance;
        uint256 averagePrice;
        uint256 totalInvested;
    }
    
    address public owner;
    address public tokenRegistry;
    address public dexContract;
    bool public paused;
    
    mapping(address => mapping(address => uint256)) public balances; // user => token => balance
    mapping(address => Position[]) public positions; // user => positions
    mapping(address => uint256) public totalDeposits; // user => total deposited
    mapping(address => uint256) public totalWithdrawals; // user => total withdrawn
    
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(address indexed user, address indexed token, uint256 amount);
    event TradeExecuted(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event Paused(address account);
    event Unpaused(address account);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }
    
    modifier nonReentrant() {
        require(!paused, "ReentrancyGuard: reentrant call");
        _;
    }
    
    constructor(address _tokenRegistry) {
        owner = msg.sender;
        tokenRegistry = _tokenRegistry;
    }
    
    function setDEXContract(address _dexContract) public onlyOwner {
        dexContract = _dexContract;
    }
    
    function deposit(address token, uint256 amount) public whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user
        require(transferToken(token, msg.sender, address(this), amount), "Transfer failed");
        
        // Update user balance
        balances[msg.sender][token] += amount;
        totalDeposits[msg.sender] += amount;
        
        // Update or create position
        _updatePosition(msg.sender, token, amount, true);
        
        emit Deposit(msg.sender, token, amount);
    }
    
    function withdraw(address token, uint256 amount) public whenNotPaused nonReentrant {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        // Update user balance
        balances[msg.sender][token] -= amount;
        totalWithdrawals[msg.sender] += amount;
        
        // Update position
        _updatePosition(msg.sender, token, amount, false);
        
        // Transfer tokens to user
        require(transferToken(token, address(this), msg.sender, amount), "Transfer failed");
        
        emit Withdrawal(msg.sender, token, amount);
    }
    
    function executeTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) public whenNotPaused nonReentrant {
        require(balances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");
        
        // Approve DEX to spend tokens
        require(approveToken(tokenIn, dexContract, amountIn), "Approve failed");
        
        // Execute trade through DEX
        uint256 balanceBefore = getTokenBalance(tokenOut);
        (bool success, ) = dexContract.call(
            abi.encodeWithSignature("swap(address,address,uint256,uint256)", tokenIn, tokenOut, amountIn, minAmountOut)
        );
        require(success, "Trade failed");
        uint256 balanceAfter = getTokenBalance(tokenOut);
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
    
    function _getCurrentPrice(address token) internal pure returns (uint256) {
        // This is a simplified price function
        // In a real implementation, you would get prices from an oracle
        if (token == getTokenBySymbol("BTC")) {
            return 110203 * 1e8; // $110,203 per BTC
        } else if (token == getTokenBySymbol("ETH")) {
            return 3907 * 1e18; // $3,907 per ETH
        } else if (token == getTokenBySymbol("USDT")) {
            return 1 * 1e6; // $1 per USDT
        }
        return 1e18; // Default price
    }
    
    function getTokenBySymbol(string memory symbol) internal pure returns (address) {
        // This would call the token registry
        // For now, return hardcoded addresses
        if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("BTC"))) {
            return 0x2cC90e5d109c4eFcaD6c5a765EaBc16DAE90ebF0; // BTC token address
        } else if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("ETH"))) {
            return 0x327a97e6FA9dc759Ff108154267060818436542e; // ETH token address
        } else if (keccak256(abi.encodePacked(symbol)) == keccak256(abi.encodePacked("USDT"))) {
            return 0xDD03985e724f657581b10c2790f0726446a7a8D6; // USDT token address
        }
        return address(0);
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
        totalValue = getTotalValue(user);
        totalInvested = totalDeposits[user];
        
        if (totalInvested > 0) {
            totalPnl = totalValue > totalInvested ? totalValue - totalInvested : 0;
            totalPnlPercent = (totalPnl * 10000) / totalInvested; // Basis points
        }
    }
    
    function pause() public onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function transferToken(address token, address from, address to, uint256 amount) internal returns (bool) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
    
    function approveToken(address token, address spender, uint256 amount) internal returns (bool) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("approve(address,uint256)", spender, amount)
        );
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
    
    function getTokenBalance(address token) internal view returns (uint256) {
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 0;
    }
}
