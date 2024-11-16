export interface Server {
	id: string;
	baseUrl: string;
	connectionType: 'ollama' | 'openai' | 'openai-compatible';
	isVerified: Date | null;
	isEnabled: boolean;
	name?: string;
	modelFilter?: string;
	apiKey?: string;
}

const DEFAULT_SERVER: Server = {
	id: crypto.randomUUID(),
	name: '',
	baseUrl: 'http://localhost:11434',
	connectionType: 'ollama',
	isVerified: null,
	isEnabled: false
};
