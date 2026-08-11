const buildPersonaFromForm = (form) => {
	const formData = new FormData(form);
	const persona = {};

	for (const [key, value] of formData.entries()) {
		const input = form.elements.namedItem(key);
		if (input && input.type === 'number' && value !== '') {
			persona[key] = Number(value);
			continue;
		}
		persona[key] = value;
	}

	return persona;
};

const setStatus = (statusEl, message, type) => {
	if (!statusEl) return;
	statusEl.hidden = !message;
	statusEl.textContent = message || '';
	statusEl.classList.toggle('persona-form__status--ok', type === 'ok');
	statusEl.classList.toggle('persona-form__status--error', type === 'error');
};

const renderPersonas = (root, personas) => {
	const list = root.querySelector('.persona-form__list');
	const empty = root.querySelector('.persona-form__list-empty');
	const preview = root.querySelector('.persona-form__preview');
	const previewCode = root.querySelector('.persona-form__preview-code code');

	if (!list) return;

	list.innerHTML = '';

	if (!personas.length) {
		if (empty) empty.hidden = false;
		if (preview) preview.hidden = true;
		return;
	}

	if (empty) empty.hidden = true;

	personas.forEach((persona, index) => {
		const item = document.createElement('li');
		item.className = 'persona-form__list-item';

		const name = document.createElement('p');
		name.className = 'persona-form__list-name';
		name.textContent = `${index + 1}. ${persona.nombre || 'Sin nombre'}`;

		const meta = document.createElement('p');
		meta.className = 'persona-form__list-meta';
		meta.textContent = [
			persona.edad != null ? `${persona.edad} años` : null,
			persona.telefono,
			persona.email,
			persona.ciudad,
			persona.ocupacion,
			persona.estatura != null ? `${persona.estatura} m` : null,
		]
			.filter(Boolean)
			.join(' · ');

		item.append(name, meta);
		list.append(item);
	});

	if (preview && previewCode) {
		preview.hidden = false;
		previewCode.textContent = JSON.stringify({ personas }, null, '\t');
		if (typeof Prism !== 'undefined') {
			Prism.highlightElement(previewCode);
		}
	}
};

const personaForm = () => {
	document.querySelectorAll('.persona-form').forEach((root) => {
		if (root.dataset.personaFormReady === 'true') return;

		const form = root.querySelector('.persona-form__form');
		const statusEl = root.querySelector('.persona-form__status');
		if (!form) return;

		const apiUrl = root.dataset.apiUrl || '/api/personas';
		const successMessage = root.dataset.successMessage || 'Persona guardada';
		const errorMessage =
			root.dataset.errorMessage || 'No se pudo guardar. Usa npm run dev.';

		const loadPersonas = async () => {
			const response = await fetch(apiUrl);
			if (!response.ok) {
				throw new Error(`GET ${apiUrl} failed`);
			}
			const data = await response.json();
			const personas = Array.isArray(data.personas) ? data.personas : [];
			renderPersonas(root, personas);
			return personas;
		};

		loadPersonas().catch(() => {
			setStatus(statusEl, errorMessage, 'error');
			renderPersonas(root, []);
		});

		form.addEventListener('submit', async (event) => {
			event.preventDefault();

			const inputs = [...form.querySelectorAll('.persona-form__input')];
			let isValid = true;

			inputs.forEach((input) => {
				const ok = input.checkValidity();
				input.classList.toggle('persona-form__input--invalid', !ok);
				if (!ok) isValid = false;
			});

			if (!isValid) {
				form.reportValidity();
				return;
			}

			const persona = buildPersonaFromForm(form);
			const submitBtn = form.querySelector('button[type="submit"]');
			if (submitBtn) submitBtn.disabled = true;

			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(persona),
				});

				if (!response.ok) {
					throw new Error(`POST ${apiUrl} failed`);
				}

				const data = await response.json();
				const personas = Array.isArray(data.personas) ? data.personas : [];
				renderPersonas(root, personas);
				setStatus(statusEl, successMessage, 'ok');
				form.reset();
				inputs.forEach((input) => {
					input.classList.remove('persona-form__input--invalid');
				});
			} catch {
				setStatus(statusEl, errorMessage, 'error');
			} finally {
				if (submitBtn) submitBtn.disabled = false;
			}
		});

		root.dataset.personaFormReady = 'true';
	});
};

export default personaForm;
