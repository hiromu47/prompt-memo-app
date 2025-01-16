// Service Worker 登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('ServiceWorker registered'))
            .catch(error => console.error('ServiceWorker registration failed:', error));
    });
}

const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Element with id "${id}" not found`);
    return element;
};

const elements = {
    folderView: getElement('folderView'),
    showFolders: getElement('showFolders'),
    closeFolderView: getElement('closeFolderView'),
    newFolderName: getElement('newFolderName'),
    addFolder: getElement('addFolder'),
    folderList: getElement('folderList'),
    saveToFolder: getElement('saveToFolder'),
    currentFolderName: getElement('currentFolderName'),
    promptTitle: getElement('promptTitle'),
    promptContent: getElement('promptContent'),
    copyButton: getElement('copyButton'),
    saveButton: getElement('saveButton'),
    promptList: getElement('promptList')
};

class DataManager {
    constructor() {
        this.data = this.loadData();
        this.currentFolder = null;
    }

    loadData() {
        const saved = localStorage.getItem('promptDictionary');
        return saved ? JSON.parse(saved) : { folders: [], prompts: {} };
    }

    saveData() {
        localStorage.setItem('promptDictionary', JSON.stringify(this.data));
    }

    addFolder(name) {
        if (!name || this.data.folders.includes(name)) return false;
        this.data.folders.push(name);
        this.data.prompts[name] = [];
        this.saveData();
        return true;
    }
}

class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.init();
    }

    init() {
        elements.addFolder.addEventListener('click', () => {
            const folderName = elements.newFolderName.value.trim();
            if (folderName && this.dataManager.addFolder(folderName)) {
                elements.newFolderName.value = '';
                this.renderFolders();
            }
        });

        elements.showFolders.addEventListener('click', () => {
            elements.folderView.classList.remove('hidden');
        });

        elements.closeFolderView.addEventListener('click', () => {
            elements.folderView.classList.add('hidden');
        });
    }

    renderFolders() {
        elements.folderList.innerHTML = this.dataManager.data.folders.map(folder =>
            `<div>${folder}</div>`
        ).join('');
    }
}

const dataManager = new DataManager();
const uiManager = new UIManager(dataManager);
window.app = uiManager;
