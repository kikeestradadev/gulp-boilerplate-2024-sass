import {
	createId,
	loadCrudStore,
	persistStore,
	readStore,
} from '../db/crudDemoStore';

const setStatus = (statusEl, message, type) => {
	if (!statusEl) return;
	statusEl.hidden = !message;
	statusEl.textContent = message || '';
	statusEl.classList.toggle('tutor-grid__status--ok', type === 'ok');
	statusEl.classList.toggle('tutor-grid__status--error', type === 'error');
};

const buildTutorFromForm = (form) => {
	const formData = new FormData(form);
	const tutor = {};

	for (const [key, value] of formData.entries()) {
		if (key === 'id') continue;
		tutor[key] = value;
	}

	return tutor;
};

const fillForm = (form, tutor = {}) => {
	[...form.querySelectorAll('.tutor-grid__input, .tutor-grid__id')].forEach((input) => {
		const value = tutor[input.name];
		input.value = value == null ? '' : String(value);
		input.classList.remove('tutor-grid__input--invalid');
	});
};

const setFormMode = (root, mode) => {
	const formTitle = root.querySelector('.tutor-grid__form-title');
	const submitBtn = root.querySelector('.tutor-grid__submit');
	const cancelBtn = root.querySelector('.tutor-grid__cancel');
	const isEdit = mode === 'edit';

	if (formTitle) {
		formTitle.textContent = isEdit
			? root.dataset.formTitleEdit || 'Actualizar tutor'
			: root.dataset.formTitleCreate || 'Crear tutor';
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

const renderGrid = (root, tutores, labels) => {
	const grid = root.querySelector('.tutor-grid__grid');
	const countEl = root.querySelector('.tutor-grid__count');
	const preview = root.querySelector('.tutor-grid__preview');
	const previewCode = root.querySelector('.tutor-grid__preview-code code');
	const emptyMessage = root.dataset.emptyList || 'Sin registros.';
	const { countLabel, editLabel, deleteLabel, onEdit, onDelete } = labels;

	if (!grid) return;

	grid.innerHTML = '';

	if (!tutores.length) {
		const empty = document.createElement('p');
		empty.className = 'tutor-grid__meta';
		empty.textContent = emptyMessage;
		grid.append(empty);
		if (countEl) countEl.hidden = true;
		if (preview) preview.hidden = true;
		return;
	}

	if (countEl) {
		countEl.hidden = false;
		countEl.textContent = `${tutores.length} ${countLabel}`;
	}

	tutores.forEach((tutor) => {
		const card = document.createElement('article');
		card.className = 'tutor-grid__card';
		card.dataset.id = tutor.id;

		const body = document.createElement('div');
		body.className = 'tutor-grid__card-body';

		const name = document.createElement('h4');
		name.className = 'tutor-grid__name';
		name.textContent = tutor.nombre || 'Sin nombre';

		body.append(name);

		const actions = document.createElement('div');
		actions.className = 'tutor-grid__card-actions';

		const editBtn = document.createElement('button');
		editBtn.type = 'button';
		editBtn.className = 'btn btn--outline btn--small tutor-grid__edit';
		editBtn.textContent = editLabel;
		editBtn.addEventListener('click', () => onEdit(tutor.id));

		const deleteBtn = document.createElement('button');
		deleteBtn.type = 'button';
		deleteBtn.className = 'btn btn--secondary btn--small tutor-grid__delete';
		deleteBtn.textContent = deleteLabel;
		deleteBtn.addEventListener('click', () => onDelete(tutor.id));

		actions.append(editBtn, deleteBtn);
		card.append(body, actions);
		grid.append(card);
	});

	if (preview && previewCode) {
		preview.hidden = false;
		previewCode.textContent = JSON.stringify({ tutores }, null, '\t');
		if (typeof Prism !== 'undefined') {
			Prism.highlightElement(previewCode);
		}
	}
};

const tutorGrid = () => {
	document.querySelectorAll('.tutor-grid').forEach((root) => {
		if (root.dataset.tutorGridReady === 'true') return;

		const form = root.querySelector('.tutor-grid__form');
		const statusEl = root.querySelector('.tutor-grid__status');
		const cancelBtn = root.querySelector('.tutor-grid__cancel');
		const tutorUrl = root.dataset.url || './data/db/tutor.json';
		const personaUrl = root.dataset.personaUrl || './data/db/persona.json';
		const storageKey = root.dataset.storageKey || 'crud-demo-store-v3';
		const errorMessage =
			root.dataset.errorMessage || 'No se pudo cargar el JSON estático.';
		const loadingMessage = root.dataset.loadingMessage || 'Cargando…';
		const createdMessage = root.dataset.createdMessage || 'Tutor creado.';
		const updatedMessage = root.dataset.updatedMessage || 'Tutor actualizado.';
		const deletedMessage = root.dataset.deletedMessage || 'Tutor eliminado.';
		const deleteBlockedMessage =
			root.dataset.deleteBlockedMessage ||
			'No se puede eliminar: hay personas con este tutor asignado.';
		const countLabel = root.dataset.countLabel || 'registros';
		const editLabel = root.dataset.editLabel || 'Editar';
		const deleteLabel = root.dataset.deleteLabel || 'Eliminar';
		const deleteConfirm = root.dataset.deleteConfirm || '¿Eliminar este tutor?';

		let store = { personas: [], tutores: [] };
		let editingId = null;

		const persist = () => persistStore(storageKey, store);

		const paint = (message, type = 'ok') => {
			renderGrid(root, store.tutores, {
				countLabel,
				editLabel,
				deleteLabel,
				onEdit: startEdit,
				onDelete: removeTutor,
			});
			setStatus(statusEl, message, type);
		};

		const syncFromStorage = () => {
			const latest = readStore(storageKey);
			if (!latest) return;
			store = latest;
			paint(null, null);
		};

		const resetCreateMode = () => {
			editingId = null;
			if (form) {
				form.reset();
				const idInput = form.querySelector('.tutor-grid__id');
				if (idInput) idInput.value = '';
				[...form.querySelectorAll('.tutor-grid__input')].forEach((input) => {
					input.classList.remove('tutor-grid__input--invalid');
				});
			}
			setFormMode(root, 'create');
		};

		const startEdit = (id) => {
			const tutor = store.tutores.find((item) => item.id === id);
			if (!tutor || !form) return;

			editingId = id;
			fillForm(form, tutor);
			setFormMode(root, 'edit');
			setStatus(statusEl, `Editando: ${tutor.nombre || id}`, null);
			form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			const first = form.querySelector('.tutor-grid__input');
			if (first) first.focus();
		};

		const removeTutor = (id) => {
			const tutor = store.tutores.find((item) => item.id === id);
			if (!tutor) return;

			const assigned = store.personas.filter((persona) => persona.tutorId === id);
			if (assigned.length) {
				setStatus(statusEl, deleteBlockedMessage, 'error');
				return;
			}

			if (!window.confirm(`${deleteConfirm}\n${tutor.nombre || id}`)) return;

			store = {
				...store,
				tutores: store.tutores.filter((item) => item.id !== id),
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
				paint(
					loaded.source === 'localStorage'
						? `Cargado desde localStorage (${store.tutores.length} ${countLabel})`
						: `Seed desde ${loaded.source} (${store.tutores.length} ${countLabel})`,
					store.tutores.length ? 'ok' : null
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

				const inputs = [...form.querySelectorAll('.tutor-grid__input')];
				let isValid = true;

				inputs.forEach((input) => {
					const ok = input.checkValidity();
					input.classList.toggle('tutor-grid__input--invalid', !ok);
					if (!ok) isValid = false;
				});

				if (!isValid) {
					form.reportValidity();
					return;
				}

				const payload = buildTutorFromForm(form);

				if (editingId) {
					store = {
						...store,
						tutores: store.tutores.map((item) =>
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
					tutores: [...store.tutores, { ...payload, id: createId('tutor') }],
				};
				if (!persist()) return;
				resetCreateMode();
				paint(createdMessage, 'ok');
			});
		}

		root.dataset.tutorGridReady = 'true';
	});
};

export default tutorGrid;
