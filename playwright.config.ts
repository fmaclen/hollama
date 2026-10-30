import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: Number(process.env.PREVIEW_PORT) || 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 5000,
	workers: process.env.CI ? 1 : undefined,
	retries: process.env.CI ? 2 : 0,
	use: {
		trace: 'retain-on-failure',
		contextOptions: {
			permissions: ['clipboard-write', 'clipboard-read']
		},
		viewport: { width: 1280, height: 1024 }
	},
	snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
	expect: {
		toMatchSnapshot: {
			maxDiffPixels: 900
		}
	}
};

export default config;
