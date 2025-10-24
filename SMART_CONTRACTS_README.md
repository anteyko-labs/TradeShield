# Smart Contracts Trading System

Полноценная система смарт-контрактов для торговли любыми токенами с сохранением в блокчейне.

## 🏗️ Архитектура системы

### 1. UniversalToken.sol
- **Универсальный ERC20 токен** для любых криптовалют
- **Метаданные**: название, символ, лого, описание
- **Гибкие настройки**: decimals, max supply, initial supply
- **Функции**: mint, burn, update metadata

### 2. TokenRegistry.sol
- **Реестр всех токенов** в системе
- **Регистрация токенов**: создание новых или добавление существующих
- **Верификация**: проверка и активация токенов
- **Поиск**: по символу, адресу, статусу

### 3. UniversalDEX.sol
- **Децентрализованная биржа** для торговли токенами
- **Торговые пары**: создание и управление парами
- **Ликвидность**: добавление/удаление ликвидности
- **Ордера**: создание, исполнение, отмена
- **Комиссии**: настраиваемая комиссия DEX

### 4. UserWallet.sol
- **Кошелек пользователя** для хранения токенов
- **Балансы**: депозит/вывод токенов
- **Позиции**: отслеживание торговых позиций
- **P&L**: реализованная и нереализованная прибыль

## 🚀 Деплой контрактов

### 1. Подготовка
```bash
# Установка зависимостей
npm install

# Настройка Foundry
foundryup

# Настройка переменных окружения
cp env.example .env
# Заполните .env файл
```

### 2. Компиляция
```bash
# Компиляция контрактов
forge build
```

### 3. Деплой
```bash
# Деплой всей системы
forge script scripts/DeployTradingSystem.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Или пошагово:
# 1. Деплой TokenRegistry
# 2. Деплой UniversalDEX
# 3. Деплой UserWallet
# 4. Создание базовых токенов (BTC, ETH, USDT)
# 5. Регистрация токенов
# 6. Создание торговых пар
```

### 4. Настройка адресов
После деплоя обновите `.env` файл с адресами контрактов:
```env
VITE_TOKEN_REGISTRY_ADDRESS=0x...
VITE_UNIVERSAL_DEX_ADDRESS=0x...
VITE_USER_WALLET_ADDRESS=0x...
VITE_BTC_TOKEN_ADDRESS=0x...
VITE_ETH_TOKEN_ADDRESS=0x...
VITE_USDT_TOKEN_ADDRESS=0x...
```

## 💼 Функциональность

### Создание токенов
```solidity
// Создание нового токена
UniversalToken newToken = new UniversalToken(
    "Bitcoin",           // название
    "BTC",              // символ
    8,                  // decimals
    21000000 * 10**8,   // initial supply
    21000000 * 10**8,   // max supply
    "https://...",      // logo URL
    "Bitcoin description", // описание
    owner               // владелец
);

// Регистрация в реестре
tokenRegistry.registerExistingToken(
    address(newToken),
    "Bitcoin",
    "BTC",
    "https://...",
    "Bitcoin description",
    8
);
```

### Торговля токенами
```solidity
// Создание торговой пары
dex.createPair(
    btcToken,           // токен A
    usdtToken,          // токен B
    100 * 10**8,        // количество A
    11000000 * 10**6    // количество B
);

// Создание ордера
uint256 orderId = dex.createOrder(
    btcToken,           // токен входа
    usdtToken,          // токен выхода
    1 * 10**8,          // количество входа
    110000 * 10**6,     // количество выхода
    true                // покупка
);

// Исполнение ордера
dex.executeOrder(orderId);
```

### Управление кошельком
```solidity
// Депозит токенов
userWallet.depositToken(btcToken, 1 * 10**8);

// Вывод токенов
userWallet.withdrawToken(btcToken, 0.5 * 10**8);

// Проверка баланса
uint256 balance = userWallet.getTokenBalance(user, btcToken);

// Получение позиций
Position memory position = userWallet.getPosition(user, btcToken);
```

## 🔧 Интеграция с фронтендом

### ContractService
```typescript
import { contractService } from './services/contractService';

// Получение информации о токене
const tokenInfo = await contractService.getTokenInfo(tokenAddress);

// Создание ордера
const txHash = await contractService.createOrder(
    signer,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    isBuy
);

// Проверка баланса
const balance = await contractService.getTokenBalance(userAddress, tokenAddress);
```

### Хук для трейдинга
```typescript
import { useTrading } from './hooks/useTrading';

const { 
    portfolio, 
    createOrder, 
    getPositions,
    getTokenBalance 
} = useTrading(userAddress);
```

## 📊 Структура данных

### TokenInfo
```typescript
interface TokenInfo {
  name: string;           // Название токена
  symbol: string;         // Символ токена
  logoUrl: string;        // URL логотипа
  description: string;    // Описание
  decimals: number;      // Количество десятичных знаков
  totalSupply: string;    // Общий supply
  maxSupply: string;      // Максимальный supply
  isActive: boolean;      // Активен ли токен
  createdAt: string;      // Дата создания
}
```

### Position
```typescript
interface Position {
  token: string;          // Адрес токена
  amount: string;         // Количество
  averagePrice: string;   // Средняя цена входа
  totalCost: string;      // Общая стоимость
  realizedPnl: string;    // Реализованная прибыль/убыток
  unrealizedPnl: string; // Нереализованная прибыль/убыток
  isLong: boolean;        // Длинная/короткая позиция
  createdAt: string;      // Дата создания
  lastUpdated: string;    // Последнее обновление
}
```

## 🔒 Безопасность

### ReentrancyGuard
- Защита от реентрантности во всех контрактах
- Использование `nonReentrant` модификатора

### Access Control
- `Ownable` для административных функций
- Проверка прав доступа для критических операций

### Input Validation
- Проверка всех входных параметров
- Валидация адресов и сумм
- Проверка существования токенов и пар

## 🎯 Преимущества системы

### 1. Полная децентрализация
- Все данные хранятся в блокчейне
- Нет централизованных серверов
- Прозрачность всех операций

### 2. Гибкость
- Поддержка любых ERC20 токенов
- Настраиваемые параметры токенов
- Гибкая система комиссий

### 3. Безопасность
- Проверенные паттерны безопасности
- Защита от известных уязвимостей
- Аудит кода

### 4. Масштабируемость
- Модульная архитектура
- Легкое добавление новых функций
- Оптимизированный газ

## 📈 Использование

### Для пользователей:
1. **Подключение кошелька** - MetaMask, WalletConnect
2. **Депозит токенов** - пополнение кошелька
3. **Торговля** - создание и исполнение ордеров
4. **Управление позициями** - отслеживание P&L
5. **Вывод средств** - возврат токенов

### Для разработчиков:
1. **Создание токенов** - регистрация новых токенов
2. **Добавление ликвидности** - создание торговых пар
3. **Интеграция** - подключение к фронтенду
4. **Мониторинг** - отслеживание событий

## 🚨 Важные замечания

### Тестнет
- Система работает на Sepolia testnet
- Используйте тестовые токены
- Получите тестовый ETH с faucet

### Газ
- Операции требуют газа
- Убедитесь в достаточном балансе ETH
- Оптимизируйте газ для пользователей

### Безопасность
- Всегда проверяйте адреса контрактов
- Используйте только проверенные токены
- Не доверяйте неизвестным контрактам

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи транзакций
2. Убедитесь в правильности адресов
3. Проверьте баланс газа
4. Обратитесь к документации

---

**Система готова к использованию! Все токены и позиции сохраняются в блокчейне и доступны между сессиями.** 🎯
