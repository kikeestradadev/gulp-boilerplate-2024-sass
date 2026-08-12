import internalModule from './modules/internalModule';
import styleGuideContainer from './modules/styleGuideContainer';
import personaGrid from './modules/personaGrid';
import tutorGrid from './modules/tutorGrid';
import Prism from 'prismjs';

const initComponents = () => {
	internalModule();
	styleGuideContainer();
	tutorGrid();
	personaGrid();
	Prism.highlightAll();
};

document.addEventListener('DOMContentLoaded', initComponents);
