// backend/config/env.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.GROQ_API_KEY) {
  console.error('❌ FATAL: GROQ_API_KEY is missing in backend/.env');
  process.exit(1);
}

if (process.env.GROQ_API_KEY === 'your_groq_api_key') {
  console.error('❌ FATAL: Replace the placeholder GROQ_API_KEY with your actual key');
  process.exit(1);
}

console.log('✅ Environment loaded successfully');