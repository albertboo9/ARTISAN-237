#!/bin/bash
set -e

# Navigate to the monorepo root
cd "$(dirname "$0")/../.."

# Enable pnpm via corepack
corepack enable

# Install dependencies from root (resolves workspace deps)
pnpm install --frozen-lockfile

# Generate Prisma client
cd apps/api
npx prisma generate

# Build the API
npx nest build

echo "✅ API build completed successfully"