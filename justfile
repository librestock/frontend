# Install dependencies
bootstrap:
  pnpm install

# Decrypt environment variables
decrypt:
  op inject -i env.template -o .env

# Run development server
dev:
  pnpm dev

# Lint and check code
lint:
  pnpm check

# Run tests
test:
  pnpm test
