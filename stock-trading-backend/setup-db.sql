-- Create enums
CREATE TYPE order_side AS ENUM ('BUY', 'SELL');
CREATE TYPE order_type AS ENUM ('MARKET', 'LIMIT');
CREATE TYPE order_status AS ENUM ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED');

-- Create User table
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Balance table
CREATE TABLE "Balance" (
  user_id UUID PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
  lkr_balance FLOAT DEFAULT 10000,
  available_balance FLOAT DEFAULT 10000,
  locked_balance FLOAT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Stock table
CREATE TABLE "Stock" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  current_price FLOAT NOT NULL,
  last_price_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order table
CREATE TABLE "Order" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id),
  stock_id UUID NOT NULL REFERENCES "Stock"(id),
  side order_side NOT NULL,
  type order_type NOT NULL,
  price FLOAT,
  quantity FLOAT NOT NULL,
  remaining_quantity FLOAT NOT NULL,
  status order_status DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Portfolio table
CREATE TABLE "Portfolio" (
  user_id UUID NOT NULL REFERENCES "User"(id),
  stock_id UUID NOT NULL REFERENCES "Stock"(id),
  quantity FLOAT NOT NULL,
  PRIMARY KEY (user_id, stock_id)
);

-- Create Trade table
CREATE TABLE "Trade" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id UUID NOT NULL REFERENCES "Order"(id),
  sell_order_id UUID NOT NULL REFERENCES "Order"(id),
  stock_id UUID NOT NULL REFERENCES "Stock"(id),
  quantity FLOAT NOT NULL,
  price FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_order_user_id ON "Order"(user_id);
CREATE INDEX idx_order_stock_id ON "Order"(stock_id);
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_portfolio_user_id ON "Portfolio"(user_id);
CREATE INDEX idx_portfolio_stock_id ON "Portfolio"(stock_id);
CREATE INDEX idx_trade_stock_id ON "Trade"(stock_id);
