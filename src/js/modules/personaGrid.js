import {
	createId,
	findTutorName,
	loadCrudStore,
	persistStore,
	readStore,
} from '../db/crudDemoStore';

const setStatus = (statusEl, message, type) => {
	if (!statusEl) return;
	statusEl.hidden = !message;
	statusEl.textContent = message || '';
	statusEl.classList.toggle('persona-grid__status--ok', type === 'ok');
	statusEl.classList.toggle('persona-grid__status--error', type === 'error');
};

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
	[...form.querySelectorAll('.persona-grid__input, .persona-grid__select, .persona-grid__id')].forEach(
		(input) => {
			const value = persona[input.name];
			input.value = value == null ? '' : String(value);
			input.classList.remove('persona-grid__input--invalid');
		}
	);
};

const populateTutorSelect = (root, tutores, selectedId = '') => {
	const select = root.querySelector('.persona-grid__select[name="tutorId"]');
	if (!select) return;

	const emptyOption = root.dataset.tutorEmptyOption || 'Sin tutor';
	select.innerHTML = '';

	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = emptyOption;
	select.append(placeholder);

	tutores.forEach((tutor) => {
		const option = document.createElement('option');
		option.value = tutor.id;
		option.textContent = tutor.nombre || tutor.id;
		if (tutor.id === selectedId) {
			option.selected = true;
		}
		select.append(option);
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

const renderGrid = (root, store, labels) => {
	const grid = root.querySelector('.persona-grid__grid');
	const countEl = root.querySelector('.persona-grid__count');
	const preview = root.querySelector('.persona-grid__preview');
	const previewCode = root.querySelector('.persona-grid__preview-code code');
	const emptyMessage = root.dataset.emptyList || 'Sin registros.';
	const tutorCardLabel = root.dataset.tutorCardLabel || 'Tutor';
	const { countLabel, editLabel, deleteLabel, onEdit, onDelete } = labels;
	const { personas, tutores } = store;

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

		body.append(name, role);

		const tutorName = findTutorName(tutores, persona.tutorId);
		if (tutorName) {
			const tutor = document.createElement('p');
			tutor.className = 'persona-grid__tutor';
			tutor.textContent = `${tutorCardLabel}: ${tutorName}`;
			body.append(tutor);
		}

		body.append(meta);

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
		previewCode.textContent = JSON.stringify(
			{ personas, tutores },
			null,
			'\t'
		);
		if (typeof Prism !== 'undefined') {
			Prism.highlightElement(previewCode);
		}
	}
};

const personaGrid = () => {
	document.querySelectorAll('.persona-grid').forEach((root) => {
		if (root.dataset.personaGridReady === 'true') return;

		const form = root.querySelector('.persona-grid__form');
		const statusEl = root.querySelector('.persona-grid__status');
		const cancelBtn = root.querySelector('.persona-grid__cancel');
		const personaUrl = root.dataset.url || './data/db/persona.json';
		const tutorUrl = root.dataset.tutorUrl || './data/db/tutor.json';
		const storageKey = root.dataset.storageKey || 'crud-demo-store-v3';
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

		let store = { personas: [], tutores: [] };
		let editingId = null;

		const persist = () => persistStore(storageKey, store);

		const paint = (message, type = 'ok') => {
			renderGrid(root, store, {
				countLabel,
				editLabel,
				deleteLabel,
				onEdit: startEdit,
				onDelete: removePersona,
			});
			setStatus(statusEl, message, type);
		};

		const syncFromStorage = () => {
			const latest = readStore(storageKey);
			if (!latest) return;
			store = latest;
			const currentPersona = editingId
				? store.personas.find((item) => item.id === editingId)
				: null;
			populateTutorSelect(
				root,
				store.tutores,
				currentPersona?.tutorId || form?.elements.namedItem('tutorId')?.value || ''
			);
			paint(null, null);
		};

		const resetCreateMode = () => {
			editingId = null;
			if (form) {
				form.reset();
				const idInput = form.querySelector('.persona-grid__id');
				if (idInput) idInput.value = '';
				[...form.querySelectorAll('.persona-grid__input, .persona-grid__select')].forEach(
					(input) => {
						input.classList.remove('persona-grid__input--invalid');
					}
				);
			}
			populateTutorSelect(root, store.tutores);
			setFormMode(root, 'create');
		};

		const startEdit = (id) => {
			const persona = store.personas.find((item) => item.id === id);
			if (!persona || !form) return;

			editingId = id;
			populateTutorSelect(root, store.tutores, persona.tutorId || '');
			fillForm(form, persona);
			setFormMode(root, 'edit');
			setStatus(statusEl, `Editando: ${persona.nombre || id}`, null);
			form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			const first = form.querySelector('.persona-grid__input');
			if (first) first.focus();
		};

		const removePersona = (id) => {
			const persona = store.personas.find((item) => item.id === id);
			if (!persona) return;
			if (!window.confirm(`${deleteConfirm}\n${persona.nombre || id}`)) return;

			store = {
				...store,
				personas: store.personas.filter((item) => item.id !== id),
			};
			if (!persist()) return;

			if (editingId === id) {
				resetCreateMode();
			}
			paint(deletedMessage, 'ok');
		};

		setStatus(statusEl, loadingMessage, null);
		setFormMode(root, 'create');

		loadCrudStore({
			storageKey,
			personaUrl,
			tutorUrl,
		})
			.then((loaded) => {
				store = loaded;
				populateTutorSelect(root, store.tutores);
				paint(
					loaded.source === 'localStorage'
						? `Cargado desde localStorage (${store.personas.length} ${countLabel})`
						: `Seed desde ${loaded.source} (${store.personas.length} ${countLabel})`,
					store.personas.length ? 'ok' : null
				);
			})
			.catch(() => {
				store = { personas: [], tutores: [] };
				paint(errorMessage, 'error');
			});

		document.addEventListener('crud-demo-store-updated', syncFromStorage);

		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				resetCreateMode();
				setStatus(statusEl, 'Edicion cancelada.', null);
			});
		}

		if (form) {
			form.addEventListener('submit', (event) => {
				event.preventDefault();

				const inputs = [
					...form.querySelectorAll('.persona-grid__input'),
					...form.querySelectorAll('.persona-grid__select'),
				];
				let isValid = true;

				inputs.forEach((input) => {
					if (input.type === 'select-one' && !input.required) return;
					const ok = input.checkValidity();
					input.classList.toggle('persona-grid__input--invalid', !ok);
					if (!ok) isValid = false;
				});

				if (!isValid) {
					form.reportValidity();
					return;
				}

				const payload = buildPersonaFromForm(form);
				if (!payload.tutorId) {
					delete payload.tutorId;
				}

				if (editingId) {
					store = {
						...store,
						personas: store.personas.map((item) =>
							item.id === editingId ? { ...payload, id: editingId } : item
						),
					};
					if (!persist()) return;
					resetCreateMode();
					paint(updatedMessage, 'ok');
					return;
				}

				store = {
					...store,
					personas: [
						...store.personas,
						{ ...payload, id: createId('persona') },
					],
				};
				if (!persist()) return;
				resetCreateMode();
				paint(createdMessage, 'ok');
			});
		}

		root.dataset.personaGridReady = 'true';
	});
};

export default personaGrid;
