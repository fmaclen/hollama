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
		trace: 'retain-on-failure',
		contextOptions: {
			permissions: ['clipboard-write', 'clipboard-read']
		}
	},
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
	expect: {
		toMatchSnapshot: {
			threshold: 0.2
		}
	}
};

export default config;
