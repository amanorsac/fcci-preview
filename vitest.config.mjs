import { defineConfig } from 'vitest/config';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.js', 'tests/fidelity/**/*.test.js'],
          passWithNoTests: true,
        },
      },
      {
        plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
        test: { name: 'worker', include: ['tests/worker/**/*.test.js'] },
      },
    ],
  },
});
