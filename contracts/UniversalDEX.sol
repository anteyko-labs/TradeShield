// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenRegistry.sol";

contract UniversalDEX is Ownable, ReentrancyGuard {
    struct TradingPair {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        bool isActive;
    }
    
    struct Order {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 timestamp;
        bool isFilled;
    }
    
    TokenRegistry public tokenRegistry;
    mapping(bytes32 => TradingPair) public pairs;
    mapping(address => mapping(address => bytes32)) public pairHashes;
    Order[] public orders;
    mapping(address => uint256[]) public userOrders;
    
    uint256 public constant FEE_PERCENTAGE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event PairCreated(bytes32 indexed pairHash, address tokenA, address tokenB);
    event OrderPlaced(uint256 indexed orderId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn);
    event OrderFilled(uint256 indexed orderId, address indexed user, uint256 amountOut);
    event LiquidityAdded(bytes32 indexed pairHash, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    
    constructor(address _tokenRegistry) {
        tokenRegistry = TokenRegistry(_tokenRegistry);
    }
    
    function createPair(
        address tokenA,
        address tokenB,
        uint256 initialAmountA,
        uint256 initialAmountB
    ) public onlyOwner {
        require(tokenA != tokenB, "Cannot create pair with same token");
        require(tokenRegistry.tokens(tokenA).isActive, "Token A not active");
        require(tokenRegistry.tokens(tokenB).isActive, "Token B not active");
        
        bytes32 pairHash = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pairs[pairHash].tokenA == address(0), "Pair already exists");
        
        // Transfer initial liquidity
        IERC20(tokenA).transferFrom(msg.sender, address(this), initialAmountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), initialAmountB);
        
        pairs[pairHash] = TradingPair({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: initialAmountA,
            reserveB: initialAmountB,
            isActive: true
        });
        
        pairHashes[tokenA][tokenB] = pairHash;
        pairHashes[tokenB][tokenA] = pairHash;
        
        emit PairCreated(pairHash, tokenA, tokenB);
        emit LiquidityAdded(pairHash, tokenA, tokenB, initialAmountA, initialAmountB);
    }
    
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) public nonReentrant {
        bytes32 pairHash = pairHashes[tokenIn][tokenOut];
        require(pairHash != bytes32(0), "Pair does not exist");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        
        // Transfer tokens from user
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate output amount using constant product formula
        uint256 amountOut = getAmountOut(amountIn, pair.reserveA, pair.reserveB);
        require(amountOut >= minAmountOut, "Insufficient output amount");
        
        // Calculate fee
        uint256 fee = (amountOut * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 amountOutAfterFee = amountOut - fee;
        
        // Update reserves
        if (tokenIn == pair.tokenA) {
            pair.reserveA += amountIn;
            pair.reserveB -= amountOut;
        } else {
            pair.reserveB += amountIn;
            pair.reserveA -= amountOut;
        }
        
        // Transfer tokens to user
        IERC20(tokenOut).transfer(msg.sender, amountOutAfterFee);
        
        // Create order record
        uint256 orderId = orders.length;
        orders.push(Order({
            user: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            minAmountOut: minAmountOut,
            timestamp: block.timestamp,
            isFilled: true
        }));
        
        userOrders[msg.sender].push(orderId);
        
        emit OrderPlaced(orderId, msg.sender, tokenIn, tokenOut, amountIn);
        emit OrderFilled(orderId, msg.sender, amountOutAfterFee);
    }
    
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Amount in must be greater than 0");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENTAGE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }
    
    function getPairInfo(address tokenA, address tokenB) public view returns (TradingPair memory) {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        return pairs[pairHash];
    }
    
    function getUserOrders(address user) public view returns (uint256[] memory) {
        return userOrders[user];
    }
    
    function getOrder(uint256 orderId) public view returns (Order memory) {
        return orders[orderId];
    }
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) public onlyOwner {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        require(pairHash != bytes32(0), "Pair does not exist");
        
        TradingPair storage pair = pairs[pairHash];
        require(pair.isActive, "Pair not active");
        
        // Transfer tokens
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        
        // Update reserves
        pair.reserveA += amountA;
        pair.reserveB += amountB;
        
        emit LiquidityAdded(pairHash, tokenA, tokenB, amountA, amountB);
    }
    
    function deactivatePair(address tokenA, address tokenB) public onlyOwner {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        require(pairHash != bytes32(0), "Pair does not exist");
        pairs[pairHash].isActive = false;
    }
    
    function activatePair(address tokenA, address tokenB) public onlyOwner {
        bytes32 pairHash = pairHashes[tokenA][tokenB];
        require(pairHash != bytes32(0), "Pair does not exist");
        pairs[pairHash].isActive = true;
    }
}