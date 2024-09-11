import type { BaseTranslation } from '../i18n-types';

const en = {
	allowConnections: 'Change your server settings to allow connections from',
	allowMixedContent: 'Allow mixed content',
	areYouSureYouWantToDeleteAllKnowledge: 'Are you sure you want to delete all knowledge?',
	areYouSureYouWantToDeleteAllSessions: 'Are you sure you want to delete all sessions?',
	areYouSureYouWantToDeleteAllSettings: 'Are you sure you want to delete all settings?',
	areYouSureYouWantToLeave: 'Are you sure you want to leave?\nThe completion in progress will stop',
	assistant: 'Assistant',
	automaticallyCheckForUpdates: 'Automatically check for updates',
	availableModels: 'Available models',
	browseModels: 'Browse the list of available models',
	cancel: 'Cancel',
	cantConnectToOllamaServer: "Can't connect to Ollama server",
	checkBrowserExtensions: 'Also check no browser extensions are blocking the connection',
	checkNow: 'Check now',
	checkingForUpdates: 'Checking for updates...',
	clear: 'Clear',
	currentVersion: 'Current version',
	confirmDeletion: 'Confirm deletion',
	connected: 'Connected',
	content: 'Content',
	copy: 'Copy',
	couldntCheckForUpdates: "Couldn't check for updates automatically",
	couldntConnectToOllamaServer: "Couldn't connect to Ollama server",
	creatingTunnel: 'Creating a tunnel',
	dangerZone: 'Danger zone',
	dark: 'Dark',
	deleteAllKnowledge: 'Delete all knowledge',
	deleteAllSessions: 'Delete all sessions',
	deleteAllSettings: 'Delete all settings',
	deleteKnowledge: 'Delete knowledge',
	deleteSession: 'Delete session',
	disconnected: 'Disconnected',
	dismiss: 'Dismiss',
	downloadModel: 'Download model',
	edit: 'Edit',
	emptyKnowledge: 'No knowledge',
	emptySessions: 'No sessions',
	error: 'Error',
	genericError: 'Sorry, something went wrong.\n```\n{error:string}\n```',
	goToDownloads: 'Go to downloads',
	goToKnowledge: 'Go to knowledge',
	goToReleases: 'Go to releases',
	howToUpdateDocker: 'How to update Docker container?',
	interface: 'Interface',
	internalServerError: 'There was an internal server error, please try again later',
	isCurrentVersionLatest: 'You are on the latest version',
	isLatestVersion: 'A newer version is available',
	knowledgeSaved: 'Knowledge saved',
	knowledge: 'Knowledge',
	language: 'Language',
	light: 'Light',
	messageOfTheDay: 'Message of the day',
	modelWasDownloaded: '{model:string} was downloaded',
	motd: 'Motd',
	name: 'Name',
	newKnowledge: 'New knowledge',
	newSession: 'New session',
	noKnowledgeChosen: 'Create new knowledge or choose one from the list',
	noSessionChosen: 'Create a new session or choose an existing one from the list',
	notFound: 'The page you are looking for does not exist',
	ollamaConnectionError: "Couldn't connect to Ollama. Is the [server running](/settings)?",
	ollamaLibrary: "Ollama's library",
	prompt: 'Prompt',
	promptPlaceholder: 'Write literally anything',
	pullModel: 'Pull model',
	pullModelPlaceholder: 'Model tag (e.g. llama3.1)',
	pullingModel: 'Pulling model',
	refreshToUpdate: 'Refresh to update',
	releaseHistory: 'Release history',
	retry: 'Retry',
	run: 'Run',
	save: 'Save',
	saveAndRun: 'Save & run',
	search: 'Search',
	searchEmpty: 'No results found',
	seeDocs: 'See docs',
	server: 'Server',
	session: 'Session',
	sessions: 'Sessions',
	settings: 'Settings',
	somethingWentWrong: 'Sorry, something went wrong',
	stopResponse: 'Stop response',
	success: 'Success',
	system: 'System',
	systemPrompt: 'System prompt',
	tryingToConnectNotLocalhost:
		'If you want to connect to an Ollama server that is not available on {hostname:string} or {ip:string} try',
	version: 'Version',
	writePromptToStart: 'Write a prompt to start a new session',
	you: 'You'
} satisfies BaseTranslation;

export default en;
