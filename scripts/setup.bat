@echo off
setlocal enabledelayedexpansion

cd /d %~dp0\..

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker not found. Please install Docker Desktop first.
  exit /b 1
)

REM Prefer docker compose; fallback to docker-compose.
docker compose version >nul 2>nul
if errorlevel 0 (
  set "COMPOSE=docker compose"
) else (
  where docker-compose >nul 2>nul
  if errorlevel 1 (
    echo Neither "docker compose" nor "docker-compose" is available.
    exit /b 1
  )
  set "COMPOSE=docker-compose"
)

echo Starting PostgreSQL via: %COMPOSE%
%COMPOSE% up -d

echo Waiting for PostgreSQL to be ready...
:waitpg
%COMPOSE% exec -T postgres pg_isready -U scooter -d scooter_db >nul 2>nul
if errorlevel 1 (
  timeout /t 1 /nobreak >nul
  goto waitpg
)
echo PostgreSQL is ready.

if not exist backend\.env (
  echo Creating backend\.env from .env.example
  copy /Y .env.example backend\.env >nul
) else (
  echo backend\.env already exists; not overwriting.
)

cd backend
if not exist node_modules (
  echo Installing backend dependencies (npm ci)...
  call npm ci
)

echo Generating Prisma Client...
call npx prisma generate

echo Applying migrations...
call npx prisma migrate deploy

echo Seeding database...
call npm run seed

echo.
echo Done.
echo Next:
echo   - Backend:  cd backend  ^&^& npm run start:dev
echo   - Frontend: cd frontend ^&^& npm run dev

