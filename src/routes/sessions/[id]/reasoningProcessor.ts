// Types for reasoning tag handling
export type TagPair = {
	openTag: string;
	closeTag: string;
};

export type TagState = {
	tagPair: TagPair;
	content: string;
};

// Reasoning tag constants
export const THOUGHT_TAG = '<thought>';
export const END_THOUGHT_TAG = '</thought>';
export const THINK_TAG = '<think>';
export const END_THINK_TAG = '</think>';

// Tags to consider as reasoning content markers
export const REASONING_TAGS: TagPair[] = [
	{ openTag: THOUGHT_TAG, closeTag: END_THOUGHT_TAG },
	{ openTag: THINK_TAG, closeTag: END_THINK_TAG }
];

// FSM states
enum ParserState {
	DEFAULT, // Processing normal text
	TAG_START, // Found '<'
	OPENING_TAG, // Building a possible opening tag
	INSIDE_REASONING, // Inside a reasoning tag
	CLOSING_TAG_START, // Found '<' inside reasoning
	CLOSING_TAG // Building a possible closing tag
}

/**
 * FSM-based processor for handling reasoning tags in streamed content
 */
export class ReasoningProcessor {
	private state = ParserState.DEFAULT;
	private completionBuffer = '';
	private reasoningBuffer = '';
	private tagBuffer = '';
	private currentTagPair: TagPair | null = null;
	private updateCompletion: (text: string) => void;
	private updateReasoning: (text: string) => void;

	constructor(updateCompletion: (text: string) => void, updateReasoning: (text: string) => void) {
		this.updateCompletion = updateCompletion;
		this.updateReasoning = updateReasoning;
	}

	/**
	 * Process a chunk of text character by character
	 */
	processChunk(chunk: string): void {
		// Process each character individually
		for (let i = 0; i < chunk.length; i++) {
			this.processChar(chunk[i]);
		}

		// Flush any accumulated content
		this.flushBuffers();
	}

	/**
	 * Process a single character based on current state
	 */
	private processChar(char: string): void {
		// Define a maximum buffer size before flushing
		const MAX_BUFFER_SIZE = 100;

		switch (this.state) {
			case ParserState.DEFAULT:
				if (char === '<') {
					this.state = ParserState.TAG_START;
					this.tagBuffer = '<';
				} else {
					this.completionBuffer += char;
					// Flush completion buffer if it gets too large
					if (this.completionBuffer.length >= MAX_BUFFER_SIZE) {
						this.updateCompletion(this.completionBuffer);
						this.completionBuffer = '';
					}
				}
				break;

			case ParserState.TAG_START:
				this.tagBuffer += char;

				if (char === '/') {
					// This could be a closing tag, but we're not in reasoning mode
					// So treat it as regular text
					this.completionBuffer += this.tagBuffer;
					this.tagBuffer = '';
					this.state = ParserState.DEFAULT;
				} else {
					// Could be the start of an opening tag
					this.state = ParserState.OPENING_TAG;
				}
				break;

			case ParserState.OPENING_TAG:
				this.tagBuffer += char;

				// Check if we have a complete opening tag
				for (const tagPair of REASONING_TAGS) {
					if (this.tagBuffer === tagPair.openTag) {
						// Found a complete opening tag
						this.currentTagPair = tagPair;
						this.state = ParserState.INSIDE_REASONING;
						this.tagBuffer = '';

						// Flush any accumulated completion content
						if (this.completionBuffer.length > 0) {
							this.updateCompletion(this.completionBuffer);
							this.completionBuffer = '';
						}
						return;
					}
				}

				// If the tag is too long, it's not a valid tag
				if (this.tagBuffer.length > 10) {
					// Longer than our longest tag
					this.completionBuffer += this.tagBuffer;
					this.tagBuffer = '';
					this.state = ParserState.DEFAULT;
				}
				break;

			case ParserState.INSIDE_REASONING:
				if (char === '<') {
					this.state = ParserState.CLOSING_TAG_START;
					this.tagBuffer = '<';
				} else {
					this.reasoningBuffer += char;
					// Flush reasoning buffer if it gets too large
					if (this.reasoningBuffer.length >= MAX_BUFFER_SIZE) {
						this.updateReasoning(this.reasoningBuffer);
						this.reasoningBuffer = '';
					}
				}
				break;

			case ParserState.CLOSING_TAG_START:
				this.tagBuffer += char;

				if (char === '/') {
					this.state = ParserState.CLOSING_TAG;
				} else {
					// Not a closing tag, just part of the reasoning content
					this.reasoningBuffer += this.tagBuffer;
					this.tagBuffer = '';
					this.state = ParserState.INSIDE_REASONING;
				}
				break;

			case ParserState.CLOSING_TAG:
				this.tagBuffer += char;

				// Check if we have a matching closing tag
				if (this.currentTagPair && this.tagBuffer === this.currentTagPair.closeTag) {
					// Found a matching closing tag
					if (this.reasoningBuffer.length > 0) {
						this.updateReasoning(this.reasoningBuffer);
						this.reasoningBuffer = '';
					}

					this.tagBuffer = '';
					this.currentTagPair = null;
					this.state = ParserState.DEFAULT;
				} else if (this.tagBuffer.length > 10) {
					// Longer than our longest tag
					// Not a valid closing tag, treat as regular reasoning content
					this.reasoningBuffer += this.tagBuffer;
					this.tagBuffer = '';
					this.state = ParserState.INSIDE_REASONING;
				}
				break;
		}
	}

	/**
	 * Flush any remaining content from buffers
	 */
	private flushBuffers(): void {
		// Flush completion buffer
		if (this.completionBuffer.length > 0) {
			this.updateCompletion(this.completionBuffer);
			this.completionBuffer = '';
		}

		// Also flush reasoning buffer for incremental updates
		if (this.reasoningBuffer.length > 0) {
			this.updateReasoning(this.reasoningBuffer);
			this.reasoningBuffer = '';
		}
	}

	/**
	 * Process any remaining content at the end of streaming
	 */
	finalize(): void {
		// Handle any remaining buffers
		if (this.completionBuffer.length > 0) {
			this.updateCompletion(this.completionBuffer);
			this.completionBuffer = '';
		}

		// Handle any remaining reasoning content
		if (this.reasoningBuffer.length > 0) {
			this.updateReasoning(this.reasoningBuffer);
			this.reasoningBuffer = '';
		}

		// If we have tag buffer content, treat it as regular text
		// based on current state
		if (this.tagBuffer.length > 0) {
			if (
				this.state === ParserState.INSIDE_REASONING ||
				this.state === ParserState.CLOSING_TAG_START ||
				this.state === ParserState.CLOSING_TAG
			) {
				this.updateReasoning(this.tagBuffer);
			} else {
				this.updateCompletion(this.tagBuffer);
			}
			this.tagBuffer = '';
		}
	}
}

/**
 * Create a processor for handling reasoning tags in streamed content
 */
export function createReasoningProcessor(
	updateCompletion: (text: string) => void,
	updateReasoning: (text: string) => void
): {
	processChunk: (chunk: string) => void;
	finalize: () => void;
} {
	const processor = new ReasoningProcessor(updateCompletion, updateReasoning);

	return {
		processChunk: (chunk: string) => processor.processChunk(chunk),
		finalize: () => processor.finalize()
	};
}
