import internalModule from './modules/internalModule';
import styleGuideContainer from './modules/styleGuideContainer';
import personaGrid from './modules/personaGrid';
import Prism from 'prismjs';

const initComponents = () => {
	internalModule();
	styleGuideContainer();
	personaGrid();
	Prism.highlightAll();
};

document.addEventListener('DOMContentLoaded', initComponents);
