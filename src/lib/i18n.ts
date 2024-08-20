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
					theme: { dark: 'Dark', light: 'Light' }
				},
				sessions: {
					pageTitle: 'Sessions',
					new: 'New session',
					empty: 'No sessions',
					session: 'Session',
					name: 'Name',
					content: 'Content',
					prompt: 'Prompt',
					run: 'Run',
					delete: 'Delete session',
					noSessionChosen: 'Create a new session or choose an existing one from the list',
					promptPlaceholder: 'Write literally anything',
					cantConnectToOllama: "Can't connect to Ollama server",
					stopResponse: 'Stop response',
					systemPrompt: 'System prompt',
					writePromptToStart: 'Write a prompt to start a new session',
					ollamaConnectionError: "Couldn't connect to Ollama. Is the [server running](/settings)?",
					genericError: 'Sorry, something went wrong.\n```\n${{error}}\n```',
					somethingWentWrong: 'Sorry, something went wrong.'
				},
				knowledge: {
					pageTitle: 'Knowledge',
					new: 'New knowledge',
					empty: 'No knowledge',
					knowledge: 'Knowledge',
					name: 'Name',
					content: 'Content',
					save: 'Save',
					delete: 'Delete knowledge',
					knowledgeSaved: 'Knowledge saved',
					noKnowledgeChosen: 'Create new knowledge or choose one from the list'
				},
				settings: {
					pageTitle: 'Settings',
					server: 'Server',
					model: 'Model',
					disconnected: 'disconnected',
					connected: 'connected',
					dangerZone: 'Danger zone',
					deleteAllSessions: 'Delete all sessions',
					deleteAllKnowledge: 'Delete all knowledge',
					deleteServerSettings: 'Delete server settings',
					version: 'Version'
				},
				motd: {
					pageTitle: 'Message of the day'
				},
				error: {
					notFound: 'The page you are looking for does not exist.',
					internalServerError: 'There was an internal server error. Please try again later.'
				},
				common: {
					copy: 'Copy',
					retry: 'Retry',
					confirmDeletion: 'Confirm deletion',
					dismiss: 'Dismiss',
					you: 'You',
					assistant: 'Assistant',
					system: 'System'
				}
			}
		}
	},
	interpolation: {
		escapeValue: false // not needed for svelte as it escapes by default
	}
});

const i18n = createI18nStore(i18next);
export default i18n;
