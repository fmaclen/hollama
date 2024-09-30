export interface ChatStrategy {
	chat(payload: any, abortSignal: AbortSignal, onChunk: (content: string) => void): Promise<void>;

	getTags(): Promise<any>;

	pull?(payload: any, onChunk: (progress: any) => void): Promise<void>;
}
