#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

compose_cmd=""
if docker compose version >/dev/null 2>&1; then
  compose_cmd="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  compose_cmd="docker-compose"
else
  echo "❌ Neither 'docker compose' nor 'docker-compose' is available."
  exit 1
fi

echo "🐳 Starting PostgreSQL via: $compose_cmd"
$compose_cmd up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
until $compose_cmd exec -T postgres pg_isready -U scooter -d scooter_db >/dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL is ready."

if [[ ! -f ".env.example" ]]; then
  echo "❌ Missing .env.example at repo root."
  exit 1
fi

if [[ ! -f "backend/.env" ]]; then
  echo "📝 Creating backend/.env from .env.example"
  cp ".env.example" "backend/.env"
else
  echo "ℹ️  backend/.env already exists; not overwriting."
  if ! grep -q "localhost:5433" backend/.env >/dev/null 2>&1; then
    echo "⚠️  backend/.env does not contain localhost:5433; make sure DATABASE_URL points to Docker DB."
  fi
fi

cd backend

if [[ ! -d "node_modules" ]]; then
  echo "📦 Installing backend dependencies (npm ci)..."
  npm ci
fi

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "📊 Applying migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Done."
echo "Next:"
echo "  - Backend:  cd backend  && npm run start:dev"
echo "  - Frontend: cd frontend && npm run dev"
