// Contract Service - Integration with Smart Contracts
import { ethers } from 'ethers';

// ABI для контрактов (упрощенные версии)
const TOKEN_REGISTRY_ABI = [
  "function getTokenBySymbol(string memory symbol) external view returns (address)",
  "function getTokenInfo(address tokenAddress) external view returns (tuple(string name, string symbol, string logoUrl, string description, uint8 decimals, uint256 totalSupply, uint256 maxSupply, bool isActive, uint256 createdAt))",
  "function getAllTokens() external view returns (address[])",
  "function getActiveTokens() external view returns (address[])",
  "function registerToken(string memory name, string memory symbol, uint8 decimals, uint256 initialSupply, uint256 maxSupply, string memory logoUrl, string memory description) external returns (address)"
];

const UNIVERSAL_DEX_ABI = [
  "function createPair(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external returns (bool)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external returns (bool)",
  "function createOrder(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, bool isBuy) external returns (uint256)",
  "function executeOrder(uint256 orderId) external returns (bool)",
  "function cancelOrder(uint256 orderId) external returns (bool)",
  "function getPairInfo(address tokenA, address tokenB) external view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalSupply, bool isActive, uint256 createdAt, address creator))",
  "function getAllPairs() external view returns (address[][])",
  "function getUserOrders(address user) external view returns (uint256[])",
  "function getOrderInfo(uint256 orderId) external view returns (tuple(uint256 id, address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 price, bool isBuy, bool isFilled, uint256 timestamp))",
  "function getPrice(address tokenA, address tokenB) external view returns (uint256)",
  "function calculateSwap(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256)"
];

const USER_WALLET_ABI = [
  "function depositToken(address token, uint256 amount) external returns (bool)",
  "function withdrawToken(address token, uint256 amount) external returns (bool)",
  "function getTokenBalance(address user, address token) external view returns (uint256)",
  "function getPosition(address user, address token) external view returns (tuple(address token, uint256 amount, uint256 averagePrice, uint256 totalCost, uint256 realizedPnl, uint256 unrealizedPnl, bool isLong, uint256 createdAt, uint256 lastUpdated))",
  "function getUserTokens(address user) external view returns (address[])",
  "function getActiveTokens(address user) external view returns (address[])",
  "function getTotalBalance(address user) external view returns (uint256)",
  "function getTotalPnl(address user) external view returns (uint256, uint256)",
  "function hasUserToken(address user, address token) external view returns (bool)"
];

const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

export interface TokenInfo {
  name: string;
  symbol: string;
  logoUrl: string;
  description: string;
  decimals: number;
  totalSupply: string;
  maxSupply: string;
  isActive: boolean;
  createdAt: string;
}

export interface TradingPair {
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalSupply: string;
  isActive: boolean;
  createdAt: string;
  creator: string;
}

export interface Order {
  id: string;
  user: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  price: string;
  isBuy: boolean;
  isFilled: boolean;
  timestamp: string;
}

export interface Position {
  token: string;
  amount: string;
  averagePrice: string;
  totalCost: string;
  realizedPnl: string;
  unrealizedPnl: string;
  isLong: boolean;
  createdAt: string;
  lastUpdated: string;
}

class ContractService {
  private provider: ethers.providers.Provider;
  private tokenRegistry: ethers.Contract;
  private dex: ethers.Contract;
  private userWallet: ethers.Contract;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    
    // Адреса контрактов (будут загружены из .env)
    const tokenRegistryAddress = process.env.VITE_TOKEN_REGISTRY_ADDRESS;
    const dexAddress = process.env.VITE_UNIVERSAL_DEX_ADDRESS;
    const userWalletAddress = process.env.VITE_USER_WALLET_ADDRESS;

    if (!tokenRegistryAddress || !dexAddress || !userWalletAddress) {
      throw new Error('Contract addresses not found in environment variables');
    }

    this.tokenRegistry = new ethers.Contract(tokenRegistryAddress, TOKEN_REGISTRY_ABI, provider);
    this.dex = new ethers.Contract(dexAddress, UNIVERSAL_DEX_ABI, provider);
    this.userWallet = new ethers.Contract(userWalletAddress, USER_WALLET_ABI, provider);
  }

  // Token Registry methods
  async getTokenBySymbol(symbol: string): Promise<string> {
    return await this.tokenRegistry.getTokenBySymbol(symbol);
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const info = await this.tokenRegistry.getTokenInfo(tokenAddress);
    return {
      name: info.name,
      symbol: info.symbol,
      logoUrl: info.logoUrl,
      description: info.description,
      decimals: info.decimals,
      totalSupply: info.totalSupply.toString(),
      maxSupply: info.maxSupply.toString(),
      isActive: info.isActive,
      createdAt: new Date(Number(info.createdAt) * 1000).toISOString()
    };
  }

  async getAllTokens(): Promise<string[]> {
    return await this.tokenRegistry.getAllTokens();
  }

  async getActiveTokens(): Promise<string[]> {
    return await this.tokenRegistry.getActiveTokens();
  }

  async registerToken(
    signer: ethers.Signer,
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: string,
    maxSupply: string,
    logoUrl: string,
    description: string
  ): Promise<string> {
    const contract = this.tokenRegistry.connect(signer);
    const tx = await contract.registerToken(
      name,
      symbol,
      decimals,
      ethers.utils.parseUnits(initialSupply, decimals),
      ethers.utils.parseUnits(maxSupply, decimals),
      logoUrl,
      description
    );
    await tx.wait();
    return tx.hash;
  }

  // DEX methods
  async createPair(
    signer: ethers.Signer,
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<string> {
    const contract = this.dex.connect(signer);
    const tx = await contract.createPair(tokenA, tokenB, amountA, amountB);
    await tx.wait();
    return tx.hash;
  }

  async addLiquidity(
    signer: ethers.Signer,
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<string> {
    const contract = this.dex.connect(signer);
    const tx = await contract.addLiquidity(tokenA, tokenB, amountA, amountB);
    await tx.wait();
    return tx.hash;
  }

  async createOrder(
    signer: ethers.Signer,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string,
    isBuy: boolean
  ): Promise<string> {
    const contract = this.dex.connect(signer);
    const tx = await contract.createOrder(tokenIn, tokenOut, amountIn, amountOut, isBuy);
    await tx.wait();
    return tx.hash;
  }

  async executeOrder(signer: ethers.Signer, orderId: string): Promise<string> {
    const contract = this.dex.connect(signer);
    const tx = await contract.executeOrder(orderId);
    await tx.wait();
    return tx.hash;
  }

  async cancelOrder(signer: ethers.Signer, orderId: string): Promise<string> {
    const contract = this.dex.connect(signer);
    const tx = await contract.cancelOrder(orderId);
    await tx.wait();
    return tx.hash;
  }

  async getPairInfo(tokenA: string, tokenB: string): Promise<TradingPair> {
    const pair = await this.dex.getPairInfo(tokenA, tokenB);
    return {
      tokenA: pair.tokenA,
      tokenB: pair.tokenB,
      reserveA: pair.reserveA.toString(),
      reserveB: pair.reserveB.toString(),
      totalSupply: pair.totalSupply.toString(),
      isActive: pair.isActive,
      createdAt: new Date(Number(pair.createdAt) * 1000).toISOString(),
      creator: pair.creator
    };
  }

  async getAllPairs(): Promise<string[][]> {
    return await this.dex.getAllPairs();
  }

  async getUserOrders(userAddress: string): Promise<string[]> {
    const orders = await this.dex.getUserOrders(userAddress);
    return orders.map((id: any) => id.toString());
  }

  async getOrderInfo(orderId: string): Promise<Order> {
    const order = await this.dex.getOrderInfo(orderId);
    return {
      id: order.id.toString(),
      user: order.user,
      tokenIn: order.tokenIn,
      tokenOut: order.tokenOut,
      amountIn: order.amountIn.toString(),
      amountOut: order.amountOut.toString(),
      price: order.price.toString(),
      isBuy: order.isBuy,
      isFilled: order.isFilled,
      timestamp: new Date(Number(order.timestamp) * 1000).toISOString()
    };
  }

  async getPrice(tokenA: string, tokenB: string): Promise<string> {
    const price = await this.dex.getPrice(tokenA, tokenB);
    return price.toString();
  }

  async calculateSwap(tokenIn: string, tokenOut: string, amountIn: string): Promise<string> {
    const amountOut = await this.dex.calculateSwap(tokenIn, tokenOut, amountIn);
    return amountOut.toString();
  }

  // User Wallet methods
  async depositToken(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<string> {
    const contract = this.userWallet.connect(signer);
    const tx = await contract.depositToken(token, amount);
    await tx.wait();
    return tx.hash;
  }

  async withdrawToken(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<string> {
    const contract = this.userWallet.connect(signer);
    const tx = await contract.withdrawToken(token, amount);
    await tx.wait();
    return tx.hash;
  }

  async getTokenBalance(userAddress: string, token: string): Promise<string> {
    const balance = await this.userWallet.getTokenBalance(userAddress, token);
    return balance.toString();
  }

  async getPosition(userAddress: string, token: string): Promise<Position> {
    const position = await this.userWallet.getPosition(userAddress, token);
    return {
      token: position.token,
      amount: position.amount.toString(),
      averagePrice: position.averagePrice.toString(),
      totalCost: position.totalCost.toString(),
      realizedPnl: position.realizedPnl.toString(),
      unrealizedPnl: position.unrealizedPnl.toString(),
      isLong: position.isLong,
      createdAt: new Date(Number(position.createdAt) * 1000).toISOString(),
      lastUpdated: new Date(Number(position.lastUpdated) * 1000).toISOString()
    };
  }

  async getUserTokens(userAddress: string): Promise<string[]> {
    return await this.userWallet.getUserTokens(userAddress);
  }

  async getActiveTokens(userAddress: string): Promise<string[]> {
    return await this.userWallet.getActiveTokens(userAddress);
  }

  async getTotalBalance(userAddress: string): Promise<string> {
    const balance = await this.userWallet.getTotalBalance(userAddress);
    return balance.toString();
  }

  async getTotalPnl(userAddress: string): Promise<{ realized: string; unrealized: string }> {
    const [realized, unrealized] = await this.userWallet.getTotalPnl(userAddress);
    return {
      realized: realized.toString(),
      unrealized: unrealized.toString()
    };
  }

  async hasUserToken(userAddress: string, token: string): Promise<boolean> {
    return await this.userWallet.hasUserToken(userAddress, token);
  }

  // ERC20 Token methods
  async getTokenContract(tokenAddress: string): Promise<ethers.Contract> {
    return new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    const contract = await this.getTokenContract(tokenAddress);
    const balance = await contract.balanceOf(userAddress);
    return balance.toString();
  }

  async approveToken(
    signer: ethers.Signer,
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<string> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const tx = await contract.approve(spender, amount);
    await tx.wait();
    return tx.hash;
  }

  async transferToken(
    signer: ethers.Signer,
    tokenAddress: string,
    to: string,
    amount: string
  ): Promise<string> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const tx = await contract.transfer(to, amount);
    await tx.wait();
    return tx.hash;
  }
}

export const contractService = new ContractService(
  new ethers.providers.JsonRpcProvider(process.env.VITE_SEPOLIA_RPC_URL)
);
