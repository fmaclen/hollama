import i18next from 'i18next';
import { createI18nStore } from 'svelte-i18next';

i18next.init({
	lng: 'en',
	resources: {
		en: {
			translation: {
				nav: {
					sessions: 'Sessions',
					knowledge: 'Knowledge',
					settings: 'Settings',
					motd: 'Motd',
					theme: {
						dark: 'Dark',
						light: 'Light'
					}
				},
				sessions: {
					new: 'New session',
					empty: 'No sessions'
				},
				knowledge: {
					new: 'New knowledge',
					empty: 'No knowledge'
				},
				settings: {
					server: 'Server',
					model: 'Model',
					save: 'Save'
				},
				motd: {
					pageTitle: 'Message of the day'
				}
			}
		}
	},
	interpolation: {
		// not needed for svelte as it escapes by default
		escapeValue: false
	}
});

const i18n = createI18nStore(i18next);
export default i18n;
