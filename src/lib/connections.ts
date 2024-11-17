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
	name?: string;
	modelFilter?: string;
	apiKey?: string;
}

// const DEFAULT_SERVER: Server = {
// 	id: crypto.randomUUID(),
// 	name: '',
// 	baseUrl: 'http://localhost:11434',
// 	connectionType: ConnectionType.Ollama,
// 	isVerified: null,
// 	isEnabled: false
// };
