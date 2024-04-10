import type { OllamaTagResponse } from "$lib/ollama";

export const MOCK_API_TAGS_RESPONSE: OllamaTagResponse = {
	models: [
		{
			name: 'gemma:7b',
			model: 'gemma:7b',
			modified_at: '2024-04-08T21:41:35.217983842-04:00"',
			size: 5011853225,
			digest: 'a72c7f4d0a15522df81486d13ce432c79e191bda2558d024fbad4362c4f7cbf8',
			details: {
				parent_model: '',
				format: 'gguf',
				family: 'gemma',
				families: ["gemma"],
				parameter_size: '9B',
				quantization_level: 'Q4_0'
			}
		},
		{
			name: "mistral:latest",
			model: "mistral:latest",
			modified_at: "2023-11-24T16:32:44.035655802-05:00",
			size: 4108916866,
			digest: "d364aa8d131ef7abfc1275db682d281a307d9451fc00f96abe154d0059b0be49",
			details: {
				parent_model: "",
				format: "gguf",
				family: "llama",
				families: null,
				parameter_size: "7B",
				quantization_level: "Q4_0"
			}
		}
	]
};
