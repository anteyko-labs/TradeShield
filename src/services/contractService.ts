import { ethers } from 'ethers';

// ABI для контрактов (упрощенные версии)
const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const DEX_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut)",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) view returns (uint256)",
  "function getPairInfo(address tokenA, address tokenB) view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, bool isActive))",
  "function createPair(address tokenA, address tokenB, uint256 initialAmountA, uint256 initialAmountB)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB)",
  "event PairCreated(bytes32 indexed pairHash, address tokenA, address tokenB)",
  "event OrderPlaced(uint256 indexed orderId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn)",
  "event OrderFilled(uint256 indexed orderId, address indexed user, uint256 amountOut)"
];

const REGISTRY_ABI = [
  "function getTokenBySymbol(string memory symbol) view returns (address)",
  "function getTokenInfo(address tokenAddress) view returns (tuple(address tokenAddress, string name, string symbol, string logoUrl, string description, uint8 decimals, bool isActive))",
  "function getAllTokens() view returns (address[])",
  "function getActiveTokens() view returns (address[])"
];

export interface ContractConfig {
  tokenRegistryAddress: string;
  dexAddress: string;
  rpcUrl: string;
  chainId: number;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  logoUrl?: string;
  description?: string;
}

export interface TradingPair {
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  isActive: boolean;
}

class ContractService {
  private signer: ethers.Signer | null = null;
  private config: ContractConfig | null = null;

  async initialize(config: ContractConfig, signer: ethers.Signer) {
    this.config = config;
    this.signer = signer;
  }

  private getTokenContract(address: string): ethers.Contract {
    if (!this.signer) throw new Error('Contract service not initialized');
    return new ethers.Contract(address, TOKEN_ABI, this.signer);
  }

  private getDEXContract(): ethers.Contract {
    if (!this.signer || !this.config) throw new Error('Contract service not initialized');
    return new ethers.Contract(this.config.dexAddress, DEX_ABI, this.signer);
  }

  private getRegistryContract(): ethers.Contract {
    if (!this.signer || !this.config) throw new Error('Contract service not initialized');
    return new ethers.Contract(this.config.tokenRegistryAddress, REGISTRY_ABI, this.signer);
  }

  // Получить информацию о токене
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const contract = this.getTokenContract(tokenAddress);
    const [name, symbol, decimals, balance] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(await this.signer!.getAddress())
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      balance: balance.toString()
    };
  }

  // Получить баланс токена
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    const contract = this.getTokenContract(tokenAddress);
    const balance = await contract.balanceOf(userAddress);
    return balance.toString();
  }

  // Получить все токены из реестра
  async getAllTokens(): Promise<string[]> {
    const registry = this.getRegistryContract();
    return await registry.getAllTokens();
  }

  // Получить активные токены
  async getActiveTokens(): Promise<string[]> {
    const registry = this.getRegistryContract();
    return await registry.getActiveTokens();
  }

  // Получить токен по символу
  async getTokenBySymbol(symbol: string): Promise<string> {
    const registry = this.getRegistryContract();
    return await registry.getTokenBySymbol(symbol);
  }

  // Получить информацию о торговой паре
  async getPairInfo(tokenA: string, tokenB: string): Promise<TradingPair> {
    const dex = this.getDEXContract();
    const pair = await dex.getPairInfo(tokenA, tokenB);
    return {
      tokenA: pair.tokenA,
      tokenB: pair.tokenB,
      reserveA: pair.reserveA.toString(),
      reserveB: pair.reserveB.toString(),
      isActive: pair.isActive
    };
  }

  // Рассчитать количество токенов на выходе
  async getAmountOut(amountIn: string, reserveIn: string, reserveOut: string): Promise<string> {
    const dex = this.getDEXContract();
    const amountOut = await dex.getAmountOut(amountIn, reserveIn, reserveOut);
    return amountOut.toString();
  }

  // Выполнить свап
  async swap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string
  ): Promise<ethers.providers.TransactionResponse> {
    const dex = this.getDEXContract();
    
    // Сначала нужно дать разрешение DEX на трату токенов
    const tokenContract = this.getTokenContract(tokenIn);
    const allowance = await tokenContract.allowance(await this.signer!.getAddress(), this.config!.dexAddress);
    
    if (allowance < amountIn) {
      const approveTx = await tokenContract.approve(this.config!.dexAddress, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    // Выполняем свап
    const tx = await dex.swap(tokenIn, tokenOut, amountIn, minAmountOut);
    return tx;
  }

  // Создать торговую пару (только для владельца)
  async createPair(
    tokenA: string,
    tokenB: string,
    initialAmountA: string,
    initialAmountB: string
  ): Promise<ethers.providers.TransactionResponse> {
    const dex = this.getDEXContract();
    const tx = await dex.createPair(tokenA, tokenB, initialAmountA, initialAmountB);
    return tx;
  }

  // Добавить ликвидность
  async addLiquidity(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<ethers.providers.TransactionResponse> {
    const dex = this.getDEXContract();
    
    // Даем разрешение на трату токенов
    const tokenAContract = this.getTokenContract(tokenA);
    const tokenBContract = this.getTokenContract(tokenB);
    
    const allowanceA = await tokenAContract.allowance(await this.signer!.getAddress(), this.config!.dexAddress);
    const allowanceB = await tokenBContract.allowance(await this.signer!.getAddress(), this.config!.dexAddress);
    
    if (allowanceA < amountA) {
      const approveTxA = await tokenAContract.approve(this.config!.dexAddress, ethers.constants.MaxUint256);
      await approveTxA.wait();
    }
    
    if (allowanceB < amountB) {
      const approveTxB = await tokenBContract.approve(this.config!.dexAddress, ethers.constants.MaxUint256);
      await approveTxB.wait();
    }

    const tx = await dex.addLiquidity(tokenA, tokenB, amountA, amountB);
    return tx;
  }

  // Получить все токены пользователя с балансами
  async getUserTokens(): Promise<TokenInfo[]> {
    const activeTokens = await this.getActiveTokens();
    const userAddress = await this.signer!.getAddress();
    
    const tokenInfos = await Promise.all(
      activeTokens.map(async (tokenAddress) => {
        try {
          const contract = this.getTokenContract(tokenAddress);
          const [name, symbol, decimals, balance] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.balanceOf(userAddress)
          ]);

          return {
            address: tokenAddress,
            name,
            symbol,
            decimals: Number(decimals),
            balance: balance.toString()
          };
        } catch (error) {
          console.error(`Error fetching token ${tokenAddress}:`, error);
          return null;
        }
      })
    );

    return tokenInfos.filter((info): info is TokenInfo => info !== null);
  }

  // Получить ETH баланс
  async getETHBalance(): Promise<string> {
    if (!this.signer) throw new Error('Contract service not initialized');
    const balance = await this.signer.provider!.getBalance(await this.signer.getAddress());
    return ethers.utils.formatEther(balance);
  }
}

export const contractService = new ContractService();