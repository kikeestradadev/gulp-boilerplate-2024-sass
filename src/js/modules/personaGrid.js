const STORAGE_FALLBACK_KEY = 'persona-grid-store-v2';

const createId = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `persona-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const setStatus = (statusEl, message, type) => {
	if (!statusEl) return;
	statusEl.hidden = !message;
	statusEl.textContent = message || '';
	statusEl.classList.toggle('persona-grid__status--ok', type === 'ok');
	statusEl.classList.toggle('persona-grid__status--error', type === 'error');
};

const readStore = (storageKey) => {
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed?.personas) ? parsed.personas : null;
	} catch {
		return null;
	}
};

const writeStore = (storageKey, personas) => {
	try {
		localStorage.setItem(storageKey, JSON.stringify({ personas }));
		return true;
	} catch {
		return false;
	}
};

const ensureIds = (list) =>
	list.map((persona) =>
		persona?.id
			? persona
			: {
					...persona,
					id: createId(),
				}
	);

const buildPersonaFromForm = (form) => {
	const formData = new FormData(form);
	const persona = {};

	for (const [key, value] of formData.entries()) {
		if (key === 'id') continue;
		const input = form.elements.namedItem(key);
		if (input && input.type === 'number' && value !== '') {
			persona[key] = Number(value);
			continue;
		}
		persona[key] = value;
	}

	return persona;
};

const fillForm = (form, persona = {}) => {
	[...form.querySelectorAll('.persona-grid__input, .persona-grid__id')].forEach((input) => {
		const value = persona[input.name];
		input.value = value == null ? '' : String(value);
		input.classList.remove('persona-grid__input--invalid');
	});
};

const setFormMode = (root, mode) => {
	const formTitle = root.querySelector('.persona-grid__form-title');
	const submitBtn = root.querySelector('.persona-grid__submit');
	const cancelBtn = root.querySelector('.persona-grid__cancel');
	const isEdit = mode === 'edit';

	if (formTitle) {
		formTitle.textContent = isEdit
			? root.dataset.formTitleEdit || 'Actualizar persona'
			: root.dataset.formTitleCreate || 'Crear persona';
	}
	if (submitBtn) {
		submitBtn.textContent = isEdit
			? root.dataset.submitUpdate || 'Actualizar'
			: root.dataset.submitCreate || 'Crear';
	}
	if (cancelBtn) {
		cancelBtn.hidden = !isEdit;
	}
};

const renderGrid = (root, personas, labels) => {
	const grid = root.querySelector('.persona-grid__grid');
	const countEl = root.querySelector('.persona-grid__count');
	const preview = root.querySelector('.persona-grid__preview');
	const previewCode = root.querySelector('.persona-grid__preview-code code');
	const emptyMessage = root.dataset.emptyList || 'Sin registros.';
	const { countLabel, editLabel, deleteLabel, onEdit, onDelete } = labels;

	if (!grid) return;

	grid.innerHTML = '';

	if (!personas.length) {
		const empty = document.createElement('p');
		empty.className = 'persona-grid__meta';
		empty.textContent = emptyMessage;
		grid.append(empty);
		if (countEl) countEl.hidden = true;
		if (preview) preview.hidden = true;
		return;
	}

	if (countEl) {
		countEl.hidden = false;
		countEl.textContent = `${personas.length} ${countLabel}`;
	}

	personas.forEach((persona) => {
		const card = document.createElement('article');
		card.className = 'persona-grid__card';
		card.dataset.id = persona.id;

		const body = document.createElement('div');
		body.className = 'persona-grid__card-body';

		const name = document.createElement('h4');
		name.className = 'persona-grid__name';
		name.textContent = persona.nombre || 'Sin nombre';

		const role = document.createElement('p');
		role.className = 'persona-grid__role';
		role.textContent = persona.ocupacion || '';

		const meta = document.createElement('p');
		meta.className = 'persona-grid__meta';
		meta.textContent = [
			persona.edad != null ? `${persona.edad} años` : null,
			persona.estatura != null ? `${persona.estatura} m` : null,
			persona.ciudad,
			persona.telefono,
			persona.email,
		]
			.filter(Boolean)
			.join(' · ');

		body.append(name, role, meta);

		const actions = document.createElement('div');
		actions.className = 'persona-grid__card-actions';

		const editBtn = document.createElement('button');
		editBtn.type = 'button';
		editBtn.className = 'btn btn--outline btn--small persona-grid__edit';
		editBtn.textContent = editLabel;
		editBtn.addEventListener('click', () => onEdit(persona.id));

		const deleteBtn = document.createElement('button');
		deleteBtn.type = 'button';
		deleteBtn.className = 'btn btn--secondary btn--small persona-grid__delete';
		deleteBtn.textContent = deleteLabel;
		deleteBtn.addEventListener('click', () => onDelete(persona.id));

		actions.append(editBtn, deleteBtn);
		card.append(body, actions);
		grid.append(card);
	});

	if (preview && previewCode) {
		preview.hidden = false;
		previewCode.textContent = JSON.stringify({ personas }, null, '\t');
		if (typeof Prism !== 'undefined') {
			Prism.highlightElement(previewCode);
		}
	}
};

const loadPersonas = async (dataUrl, storageKey) => {
	const stored = readStore(storageKey);
	if (stored) {
		const personas = ensureIds(stored);
		writeStore(storageKey, personas);
		return { personas, source: 'localStorage' };
	}

	const response = await fetch(dataUrl);
	if (!response.ok) {
		throw new Error(`GET ${dataUrl} failed`);
	}

	const data = await response.json();
	const personas = ensureIds(Array.isArray(data.personas) ? data.personas : []);
	writeStore(storageKey, personas);
	return { personas, source: dataUrl };
};

const personaGrid = () => {
	document.querySelectorAll('.persona-grid').forEach((root) => {
		if (root.dataset.personaGridReady === 'true') return;

		const form = root.querySelector('.persona-grid__form');
		const statusEl = root.querySelector('.persona-grid__status');
		const cancelBtn = root.querySelector('.persona-grid__cancel');
		const dataUrl = root.dataset.url || './data/persona.json';
		const storageKey = root.dataset.storageKey || STORAGE_FALLBACK_KEY;
		const errorMessage =
			root.dataset.errorMessage || 'No se pudo cargar el JSON estático.';
		const loadingMessage = root.dataset.loadingMessage || 'Cargando…';
		const createdMessage = root.dataset.createdMessage || 'Persona creada.';
		const updatedMessage = root.dataset.updatedMessage || 'Persona actualizada.';
		const deletedMessage = root.dataset.deletedMessage || 'Persona eliminada.';
		const countLabel = root.dataset.countLabel || 'registros';
		const editLabel = root.dataset.editLabel || 'Editar';
		const deleteLabel = root.dataset.deleteLabel || 'Eliminar';
		const deleteConfirm =
			root.dataset.deleteConfirm || '¿Eliminar esta persona?';

		let personas = [];
		let editingId = null;

		const persist = () => {
			if (!writeStore(storageKey, personas)) {
				setStatus(
					statusEl,
					'No se pudo guardar en localStorage (¿modo privado o almacenamiento lleno?).',
					'error'
				);
				return false;
			}
			return true;
		};

		const paint = (message, type = 'ok') => {
			renderGrid(root, personas, {
				countLabel,
				editLabel,
				deleteLabel,
				onEdit: startEdit,
				onDelete: removePersona,
			});
			setStatus(statusEl, message, type);
		};

		const resetCreateMode = () => {
			editingId = null;
			if (form) {
				form.reset();
				const idInput = form.querySelector('.persona-grid__id');
				if (idInput) idInput.value = '';
				[...form.querySelectorAll('.persona-grid__input')].forEach((input) => {
					input.classList.remove('persona-grid__input--invalid');
				});
			}
			setFormMode(root, 'create');
		};

		const startEdit = (id) => {
			const persona = personas.find((item) => item.id === id);
			if (!persona || !form) return;

			editingId = id;
			fillForm(form, persona);
			setFormMode(root, 'edit');
			setStatus(statusEl, `Editando: ${persona.nombre || id}`, null);
			form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			const first = form.querySelector('.persona-grid__input');
			if (first) first.focus();
		};

		const removePersona = (id) => {
			const persona = personas.find((item) => item.id === id);
			if (!persona) return;
			if (!window.confirm(`${deleteConfirm}\n${persona.nombre || id}`)) return;

			personas = personas.filter((item) => item.id !== id);
			if (!persist()) return;

			if (editingId === id) {
				resetCreateMode();
			}
			paint(deletedMessage, 'ok');
		};

		setStatus(statusEl, loadingMessage, null);
		setFormMode(root, 'create');

		loadPersonas(dataUrl, storageKey)
			.then(({ personas: loaded, source }) => {
				personas = loaded;
				paint(
					source === 'localStorage'
						? `Cargado desde localStorage (${personas.length} ${countLabel})`
						: `Seed desde ${source} (${personas.length} ${countLabel})`,
					personas.length ? 'ok' : null
				);
			})
			.catch(() => {
				personas = [];
				paint(errorMessage, 'error');
			});

		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				resetCreateMode();
				setStatus(statusEl, 'Edicion cancelada.', null);
			});
		}

		if (form) {
			form.addEventListener('submit', (event) => {
				event.preventDefault();

				const inputs = [...form.querySelectorAll('.persona-grid__input')];
				let isValid = true;

				inputs.forEach((input) => {
					const ok = input.checkValidity();
					input.classList.toggle('persona-grid__input--invalid', !ok);
					if (!ok) isValid = false;
				});

				if (!isValid) {
					form.reportValidity();
					return;
				}

				const payload = buildPersonaFromForm(form);

				if (editingId) {
					personas = personas.map((item) =>
						item.id === editingId ? { ...payload, id: editingId } : item
					);
					if (!persist()) return;
					resetCreateMode();
					paint(updatedMessage, 'ok');
					return;
				}

				personas = [...personas, { ...payload, id: createId() }];
				if (!persist()) return;
				resetCreateMode();
				paint(createdMessage, 'ok');
			});
		}

		root.dataset.personaGridReady = 'true';
	});
};

export default personaGrid;
