import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 5000,
	use: {
		trace: 'on-first-retry',
		contextOptions: {
			permissions: ['clipboard-write', 'clipboard-read']
		}
	}
};

export default config;
