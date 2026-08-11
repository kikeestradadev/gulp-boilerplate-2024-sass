const styleGuideContainer = () => {
	document.querySelectorAll('.style-guide-container').forEach((root) => {
		if (root.dataset.styleGuideContainerReady === 'true') return;

		const links = [...root.querySelectorAll('.style-guide-container__nav-link')];
		const fab = root.querySelector('.style-guide-container__fab');
		const panel = root.querySelector('.style-guide-container__panel');

		if (!links.length) return;

		const sections = links
			.map((link) => {
				const id = link.getAttribute('href')?.slice(1);
				const section = id ? document.getElementById(id) : null;
				return section ? { link, section } : null;
			})
			.filter(Boolean);

		const setActive = (activeHref) => {
			links.forEach((link) => {
				link.classList.toggle('is-active', link.getAttribute('href') === activeHref);
			});
		};

		const closeNav = () => {
			root.classList.remove('is-nav-open');
			if (panel) panel.hidden = true;
			if (fab) {
				fab.setAttribute('aria-expanded', 'false');
				fab.setAttribute('aria-label', 'Abrir navegacion del style guide');
			}
		};

		const openNav = () => {
			root.classList.add('is-nav-open');
			if (panel) panel.hidden = false;
			if (fab) {
				fab.setAttribute('aria-expanded', 'true');
				fab.setAttribute('aria-label', 'Cerrar navegacion del style guide');
			}
		};

		const toggleNav = () => {
			if (root.classList.contains('is-nav-open')) closeNav();
			else openNav();
		};

		if (fab) {
			fab.addEventListener('click', toggleNav);
		}

		links.forEach((link) => {
			link.addEventListener('click', () => {
				setActive(link.getAttribute('href'));
				closeNav();
			});
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') closeNav();
		});

		if (sections.length && 'IntersectionObserver' in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					const visible = entries
						.filter((entry) => entry.isIntersecting)
						.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

					if (!visible) return;

					const match = sections.find(({ section }) => section === visible.target);
					if (match) setActive(match.link.getAttribute('href'));
				},
				{
					rootMargin: '-20% 0px -55% 0px',
					threshold: [0.1, 0.25, 0.5],
				}
			);

			const uniqueSections = [
				...new Map(sections.map(({ section }) => [section.id, section])).values(),
			];
			uniqueSections.forEach((section) => observer.observe(section));
		}

		const hash = window.location.hash;
		const initialHref = links.some((link) => link.getAttribute('href') === hash)
			? hash
			: links[0].getAttribute('href');
		setActive(initialHref);

		root.dataset.styleGuideContainerReady = 'true';
	});
};

export default styleGuideContainer;
