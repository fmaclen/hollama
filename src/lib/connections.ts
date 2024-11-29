import { generateRandomId } from './utils';

export enum ConnectionType {
	Ollama = 'ollama',
	OpenAI = 'openai',
	OpenAICompatible = 'openai-compatible'
}

export interface Server {
	id: string;
	baseUrl: string;
	connectionType: ConnectionType;
	isVerified: Date | null;
	isEnabled: boolean;
	label?: string;
	modelFilter?: string;
	apiKey?: string;
}

export function getDefaultServer(connectionType: ConnectionType): Server {
	let baseUrl: string = '';
	let modelFilter: string | undefined = undefined;

	switch (connectionType) {
		case ConnectionType.Ollama:
			baseUrl = 'http://localhost:11434';
			break;
		case ConnectionType.OpenAI:
			baseUrl = 'https://api.openai.com/v1';
			modelFilter = 'gpt';
			break;
		case ConnectionType.OpenAICompatible:
			baseUrl = 'http://localhost:8080/v1';
			break;
	}

	return {
		id: generateRandomId(),
		baseUrl,
		connectionType,
		modelFilter,
		isVerified: null,
		isEnabled: false
	};
}
