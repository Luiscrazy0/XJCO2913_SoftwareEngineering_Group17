import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from multiple locations to support monorepo dev setups:
// 1) backend/.env (preferred for backend-only secrets)
// 2) repo-root .env (shared dev defaults; only VITE_* should be exposed to frontend)
//
// Notes:
// - We load repo root first, then allow backend/.env to override.
// - dotenv won't throw if files are missing.
const repoRootEnvPath = resolve(__dirname, '..', '..', '..', '.env');
const backendEnvPath = resolve(__dirname, '..', '..', '.env');

dotenvConfig({ path: repoRootEnvPath });
dotenvConfig({ path: backendEnvPath, override: true });
