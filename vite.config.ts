import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],base:'/besit-academy/',test:{environment:'jsdom',globals:true,include:['src/**/*.test.ts','src/**/*.test.tsx']}});
