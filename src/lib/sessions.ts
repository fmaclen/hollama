export interface Message {
	role: 'user' | 'ai' | 'system';
	content: string;
}

export interface Session {
	id: string;
	messages: Message[];
	context: number[];
}

export const loadSession = async (id: string): Promise<Session> => {
	const response = await fetch(`/api/session`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-session-id': id
		}
	});

	if (response.ok) {
		return response.json();
	} else {
		throw new Error("Couldn't find session");
	}
};

export const saveSession = async (session: Session): Promise<Session> => {
	const response = await fetch(`/api/session`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ session })
	});

	if (response.ok) {
		return response.json();
	} else {
		throw new Error("Couldn't save session");
	}
};
