import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 5000,
	retries: 2,
	use: {
		trace: 'on-first-retry',
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
