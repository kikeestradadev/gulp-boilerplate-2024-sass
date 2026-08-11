import internalModule from './modules/internalModule';
import styleGuideContainer from './modules/styleGuideContainer';
import personaForm from './modules/personaForm';
import Prism from 'prismjs';

const initComponents = () => {
	internalModule();
	styleGuideContainer();
	personaForm();
	Prism.highlightAll();
};

document.addEventListener('DOMContentLoaded', initComponents);
