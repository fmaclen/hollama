import translation from '../locales/en/translation.json';

const resources = {
	fallback: { translation },
	en: { translation }
} as const;

export default resources;
