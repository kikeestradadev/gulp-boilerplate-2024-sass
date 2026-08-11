import internalModule from './modules/internalModule';
import styleGuideContainer from './modules/styleGuideContainer';
import Prism from 'prismjs';

const initComponents = () => {
	internalModule();
	styleGuideContainer();
	Prism.highlightAll();
};

document.addEventListener('DOMContentLoaded', initComponents);
