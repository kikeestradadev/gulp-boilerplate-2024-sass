export const STORAGE_KEY = 'crud-demo-store-v3';
export const LEGACY_PERSONA_KEY = 'persona-grid-store-v2';

export const createId = (prefix = 'id') => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const readStore = (storageKey) => {
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed?.personas) && !Array.isArray(parsed?.tutores)) {
			return null;
		}
		return {
			personas: Array.isArray(parsed.personas) ? parsed.personas : [],
			tutores: Array.isArray(parsed.tutores) ? parsed.tutores : [],
		};
	} catch {
		return null;
	}
};

export const writeStore = (storageKey, store) => {
	try {
		localStorage.setItem(storageKey, JSON.stringify(store));
		return true;
	} catch {
		return false;
	}
};

export const ensureIds = (list, prefix) =>
	list.map((item) =>
		item?.id
			? item
			: {
					...item,
					id: createId(prefix),
				}
	);

const readLegacyPersonaStore = (legacyKey) => {
	try {
		const raw = localStorage.getItem(legacyKey);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed?.personas) ? parsed.personas : null;
	} catch {
		return null;
	}
};

export const dispatchStoreUpdate = () => {
	document.dispatchEvent(new CustomEvent('crud-demo-store-updated'));
};

export const persistStore = (storageKey, store) => {
	if (!writeStore(storageKey, store)) return false;
	dispatchStoreUpdate();
	return true;
};

export const loadCrudStore = async ({
	storageKey,
	personaUrl,
	tutorUrl,
}) => {
	const stored = readStore(storageKey);
	if (stored) {
		const store = {
			personas: ensureIds(stored.personas, 'persona'),
			tutores: ensureIds(stored.tutores, 'tutor'),
		};
		writeStore(storageKey, store);
		return { ...store, source: 'localStorage' };
	}

	const legacyPersonas = readLegacyPersonaStore(LEGACY_PERSONA_KEY);
	const [personaResponse, tutorResponse] = await Promise.all([
		fetch(personaUrl),
		fetch(tutorUrl),
	]);

	if (!personaResponse.ok) {
		throw new Error(`GET ${personaUrl} failed`);
	}
	if (!tutorResponse.ok) {
		throw new Error(`GET ${tutorUrl} failed`);
	}

	const [personaData, tutorData] = await Promise.all([
		personaResponse.json(),
		tutorResponse.json(),
	]);

	const store = {
		personas: ensureIds(
			legacyPersonas ||
				(Array.isArray(personaData.personas) ? personaData.personas : []),
			'persona'
		),
		tutores: ensureIds(
			Array.isArray(tutorData.tutores) ? tutorData.tutores : [],
			'tutor'
		),
	};

	writeStore(storageKey, store);
	return {
		...store,
		source: legacyPersonas ? 'legacy-localStorage' : personaUrl,
	};
};

export const findTutorName = (tutores, tutorId) => {
	if (!tutorId) return '';
	const tutor = tutores.find((item) => item.id === tutorId);
	return tutor?.nombre || '';
};
