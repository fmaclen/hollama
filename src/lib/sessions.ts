import { get } from 'svelte/store';

import type { OllamaOptions } from '$lib/chat/ollama';
import type { ChatRequest, ChatStrategy } from '$lib/chat';
import { sessionsStore, settingsStore, sortStore } from '$lib/localStorage';

import { getLastUsedModels } from './chat';
import type { Knowledge } from './knowledge';
import type { Model } from './settings';
import { formatTimestampToNow } from './utils';

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
	knowledge?: Knowledge;
	context?: number[];
	reasoning?: string;
	images?: { data: string; filename: string }[]; // Store image data and filename
}

export interface Session {
	id: string;
	messages: Message[];
	systemPrompt: Message;
	options: Partial<OllamaOptions>;
	model?: Model;
	updatedAt?: string;
	title?: string;
}

export interface Editor {
	prompt: string;
	view: 'messages' | 'controls';
	messageIndexToEdit: number | null;
	isCodeEditor: boolean;
	isCompletionInProgress: boolean;
	isNewSession: boolean;
	shouldFocusTextarea: boolean;
	attachments?: { type: 'image'; id: string; name: string; dataUrl: string }[];
	completion?: string;
	reasoning?: string;
	promptTextarea?: HTMLTextAreaElement;
	abortController?: AbortController;
}

export const loadSession = (id: string): Session => {
	let session: Session | null = null;

	// Retrieve the current sessions
	const currentSessions = get(sessionsStore);

	const defaultSystemPrompt: Message = {
		role: 'system',
		content: ''
	};

	// Find the session with the given id
	if (currentSessions) {
		const existingSession = currentSessions.find((s) => s.id === id);
		if (existingSession) {
			session = {
				...existingSession,
				// NOTE: `options` and `systemPrompt` are required fields but `existingSessions`
				// created before this feature was implemented need to be set to the defaults.
				// Over time we can probably remove them.
				options: existingSession.options || {},
				systemPrompt: existingSession.systemPrompt || defaultSystemPrompt
			};
		}
	}

	if (!session) {
		// Use the last used model
		const model = getLastUsedModels()[0];

		// Create a new session
		session = {
			id,
			model,
			systemPrompt: defaultSystemPrompt,
			updatedAt: new Date().toISOString(),
			messages: [],
			options: {}
		};
	}

	return session;
};

export const saveSession = (session: Session): void => {
	// Retrieve the current sessions
	const currentSessions = get(sessionsStore) || [];

	// Find the index of the session with the same id, if it exists
	const existingIndex = currentSessions.findIndex((k) => k.id === session.id);

	if (existingIndex !== -1) {
		// Update the existing session
		currentSessions[existingIndex] = session;
	} else {
		// Add the new session if it doesn't exist
		currentSessions.push(session);
	}

	// Sort the sessions by updatedAt in descending order (most recent first)
	const sortedSessions = sortStore(currentSessions);

	// Update the store with the sorted sessions
	sessionsStore.set(sortedSessions);

	// Update the last used models
	const lastUsedModels = getLastUsedModels();
	settingsStore.update((settings) => ({ ...settings, lastUsedModels }));
};

export function formatSessionMetadata(session: Session) {
	const subtitles: string[] = [];
	if (session.updatedAt) subtitles.push(formatTimestampToNow(session.updatedAt));
	if (session.model) subtitles.push(session.model.name);
	return subtitles.join(' • ');
}

export function getSessionTitle(session: Session) {
	if (session.title) return session.title;

	const firstUserMessage = session.messages.find(
		(m) => m.role === 'user' && m.content && !m.knowledge
	);

	if (firstUserMessage?.content) {
		const MAX_TITLE_LENGTH = 56;
		return firstUserMessage.content.slice(0, MAX_TITLE_LENGTH);
	}

	return '';
}

export async function generateSessionTitle(
	session: Session,
	strategy: ChatStrategy
): Promise<string> {
	console.log('🔍 generateSessionTitle: Starting title generation', {
		sessionId: session.id,
		modelName: session.model?.name,
		messageCount: session.messages.length
	});

	if (!session.model?.name) {
		console.error('❌ generateSessionTitle: No model available');
		throw new Error('No model available for title generation');
	}

	// Only use the first user message and assistant response for context
	const contextMessages = session.messages.slice(0, 2);
	console.log('📝 generateSessionTitle: Context messages', {
		messageCount: contextMessages.length,
		messages: contextMessages.map(m => ({ role: m.role, contentLength: m.content.length }))
	});

	if (contextMessages.length < 2) {
		console.error('❌ generateSessionTitle: Not enough messages', { count: contextMessages.length });
		throw new Error('Not enough messages for title generation');
	}

	// Convert messages to chat format (images as string arrays)
	const chatMessages = contextMessages.map((msg) => ({
		role: msg.role,
		content: msg.content,
		images: msg.images?.map((img) => img.data) // Extract just the data part
	}));

	// Create a specialized prompt to generate a title
	const titlePrompt: ChatRequest = {
		model: session.model.name,
		messages: [
			{
				role: 'system',
				content: 'Generate a concise, descriptive title (max 56 characters) for this conversation. Respond with a JSON object in this exact format:\n{"title": "Your generated title here"}'
			},
			...chatMessages
		],
		format: 'json', // Use structured output
		options: {
			temperature: 0.3, // Lower temperature for consistent titles
			num_predict: 50  // Limit response length
		}
	};

	console.log('🚀 generateSessionTitle: Sending title request', {
		model: titlePrompt.model,
		format: titlePrompt.format,
		messageCount: titlePrompt.messages.length,
		systemPrompt: titlePrompt.messages[0].content
	});

	// Get the title from LLM
	let response = '';
	try {
		await strategy.chat(
			titlePrompt,
			new AbortController().signal,
			(chunk) => { 
				response += chunk;
				console.log('📥 generateSessionTitle: Received chunk', { chunk, totalLength: response.length });
			}
		);
	} catch (error) {
		console.error('❌ generateSessionTitle: Chat strategy failed', error);
		throw error;
	}

	console.log('📤 generateSessionTitle: Full response received', {
		response,
		responseLength: response.length
	});

	// Parse JSON response
	try {
		const parsed = JSON.parse(response.trim());
		console.log('✅ generateSessionTitle: JSON parsed successfully', parsed);
		
		// Extract title from the expected JSON structure
		const title = parsed.title || '';
		const finalTitle = title.slice(0, 56);
		
		console.log('🎯 generateSessionTitle: Extracted title', { 
			originalTitle: title, 
			finalTitle,
			titleLength: finalTitle.length 
		});
		
		return finalTitle;
	} catch (parseError) {
		console.warn('⚠️ generateSessionTitle: JSON parse failed, trying fallbacks', { parseError, response });
		
		// Fallback: try to extract JSON from markdown code blocks
		const jsonMatch = response.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
		if (jsonMatch) {
			console.log('🔧 generateSessionTitle: Found JSON in code block', jsonMatch[1]);
			try {
				const parsed = JSON.parse(jsonMatch[1]);
				const title = parsed.title || '';
				const finalTitle = title.slice(0, 56);
				
				console.log('✅ generateSessionTitle: Code block JSON parsed', { 
					originalTitle: title, 
					finalTitle 
				});
				
				return finalTitle;
			} catch (codeBlockError) {
				console.warn('⚠️ generateSessionTitle: Code block JSON parse failed', codeBlockError);
			}
		}
		
		// Final fallback: extract plain text
		const cleanedResponse = response
			.trim()
			.replace(/^```(?:json)?\s*|\s*```$/g, '') // Remove code blocks
			.replace(/^\{.*?"title":\s*"([^"]+)".*\}$/s, '$1') // Extract from JSON string
			.replace(/^["']|["']$/g, '') // Remove surrounding quotes
			.replace(/^(Title:|Subject:|Topic:)\s*/i, '') // Remove common prefixes
			.slice(0, 56);
			
		console.log('🔧 generateSessionTitle: Using text fallback', { 
			originalResponse: response,
			cleanedResponse 
		});
		
		return cleanedResponse;
	}
}
