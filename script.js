// PWAのService Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/prompt-memo-app/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// DOM要素の取得
const elements = {
    folderView: document.getElementById('folderView'),
    showFolders: document.getElementById('showFolders'),
    closeFolderView: document.getElementById('closeFolderView'),
    newFolderName: document.getElementById('newFolderName'),
    addFolder: document.getElementById('addFolder'),
    folderList: document.getElementById('folderList'),
    currentFolder: document.getElementById('folderName'),
    promptTitle: document.getElementById('promptTitle'),
    promptContent: document.getElementById('promptContent'),
    copyButton: document.getElementById('copyButton'),
    saveButton: document.getElementById('saveButton'),
    promptList: document.getElementById('promptList'),
    folderEditModal: document.getElementById('folderEditModal'),
    editFolderName: document.getElementById('editFolderName'),
    saveFolderEdit: document.getElementById('saveFolderEdit'),
    cancelFolderEdit: document.getElementById('cancelFolderEdit'),
    promptTitleEditModal: document.getElementById('promptTitleEditModal'),
    editPromptTitle: document.getElementById('editPromptTitle'),
    savePromptTitleEdit: document.getElementById('savePromptTitleEdit'),
    cancelPromptTitleEdit: document.getElementById('cancelPromptTitleEdit')
};

// データ管理
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.currentFolder = null;
        this.editingFolder = null;
        this.editingPromptId = null;
    }

    loadData() {
        const saved = localStorage.getItem('promptDictionary');
        return saved ? JSON.parse(saved) : { folders: [], prompts: {} };
    }

    saveData() {
        localStorage.setItem('promptDictionary', JSON.stringify(this.data));
    }

    reorderFolders(newOrder) {
        this.data.folders = newOrder;
        this.saveData();
    }

    addFolder(name) {
        if (!this.data.folders.includes(name)) {
            this.data.folders.push(name);
            this.data.prompts[name] = [];
            this.saveData();
            return true;
        }
        return false;
    }

    editFolder(oldName, newName) {
        if (oldName === newName) return true;
        if (this.data.folders.includes(newName)) return false;

        const index = this.data.folders.indexOf(oldName);
        if (index !== -1) {
            this.data.folders[index] = newName;
            this.data.prompts[newName] = this.data.prompts[oldName];
            delete this.data.prompts[oldName];
            if (this.currentFolder === oldName) {
                this.currentFolder = newName;
            }
            this.saveData();
            return true;
        }
        return false;
    }

    deleteFolder(name) {
        const index = this.data.folders.indexOf(name);
        if (index !== -1) {
            this.data.folders.splice(index, 1);
            delete this.data.prompts[name];
            if (this.currentFolder === name) {
                this.currentFolder = null;
            }
            this.saveData();
            return true;
        }
        return false;
    }

    savePrompt(title, content) {
        if (!this.currentFolder) return false;

        const prompt = {
            id: Date.now().toString(),
            title: title,
            content: content,
            created: new Date().toISOString()
        };

        this.data.prompts[this.currentFolder].unshift(prompt);
        this.saveData();
        return true;
    }

    editPromptTitle(promptId, newTitle) {
        if (!this.currentFolder) return false;

        const prompt = this.data.prompts[this.currentFolder]
            .find(p => p.id === promptId);
        
        if (prompt) {
            prompt.title = newTitle;
            this.saveData();
            return true;
        }
        return false;
    }

    deletePrompt(id) {
        if (!this.currentFolder) return false;

        this.data.prompts[this.currentFolder] = 
            this.data.prompts[this.currentFolder].filter(p => p.id !== id);
        this.saveData();
        return true;
    }

    selectFolder(name) {
        if (this.data.folders.includes(name)) {
            this.currentFolder = name;
            return this.data.prompts[name] || [];
        }
        return [];
    }
}

// UI管理
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.setupEventListeners();
        this.setupSortable();
        this.renderFolders();
    }

    setupSortable() {
        new Sortable(elements.folderList, {
            animation: 150,
            handle: '.folder-handle',
            onEnd: (evt) => {
                const folders = Array.from(elements.folderList.children)
                    .map(el => el.getAttribute('data-folder'));
                this.dataManager.reorderFolders(folders);
            }
        });
    }

    setupEventListeners() {
        elements.showFolders.addEventListener('click', () => {
            elements.folderView.classList.remove('hidden');
        });

        elements.closeFolderView.addEventListener('click', () => {
            elements.folderView.classList.add('hidden');
        });

        elements.addFolder.addEventListener('click', () => {
            const name = elements.newFolderName.value.trim();
            if (name) {
                if (this.dataManager.addFolder(name)) {
                    this.renderFolders();
                    elements.newFolderName.value = '';
                    this.showToast('フォルダを作成しました');
                } else {
                    this.showToast('同名のフォルダが既に存在します');
                }
            }
        });

        elements.saveButton.addEventListener('click', () => {
            if (!this.dataManager.currentFolder) {
                this.showToast('フォルダを選択してください');
                return;
            }

            const title = elements.promptTitle.value.trim();
            const content = elements.promptContent.value.trim();

            if (!title || !content) {
                this.showToast('タイトルとプロンプト内容を入力してください');
                return;
            }

            if (this.dataManager.savePrompt(title, content)) {
                this.renderPrompts();
                elements.promptTitle.value = '';
                elements.promptContent.value = '';
                this.showToast('保存しました');
            }
        });

        elements.saveFolderEdit.addEventListener('click', () => {
            const newName = elements.editFolderName.value.trim();
            if (newName) {
                if (this.dataManager.editFolder(this.dataManager.editingFolder, newName)) {
                    this.renderFolders();
                    this.updateCurrentFolderDisplay();
                    elements.folderEditModal.classList.add('hidden');
                    this.showToast('フォルダ名を変更しました');
                } else {
                    this.showToast('同名のフォルダが既に存在します');
                }
            }
        });

        elements.cancelFolderEdit.addEventListener('click', () => {
            elements.folderEditModal.classList.add('hidden');
        });

        elements.savePromptTitleEdit.addEventListener('click', () => {
            const newTitle = elements.editPromptTitle.value.trim();
            if (newTitle) {
                if (this.dataManager.editPromptTitle(this.dataManager.editingPromptId, newTitle)) {
                    this.renderPrompts();
                    elements.promptTitleEditModal.classList.add('hidden');
                    this.showToast('タイトルを変更しました');
                }
            }
        });

        elements.cancelPromptTitleEdit.addEventListener('click', () => {
            elements.promptTitleEditModal.classList.add('hidden');
        });

        elements.copyButton.addEventListener('click', () => {
            const content = elements.promptContent.value.trim();
            if (content) {
                navigator.clipboard.writeText(content)
                    .then(() => this.showToast('コピーしました'))
                    .catch(() => this.showToast('コピーに失敗しました'));
            }
        });
    }

    renderFolders() {
        elements.folderList.innerHTML = this.dataManager.data.folders
            .map(folder => `
                <div class="folder-item flex items-center justify-between p-4 border-b bg-white" 
                     data-folder="${folder}">
                    <div class="flex items-center flex-grow">
                        <span class="folder-handle mr-2 text-gray-400">⋮⋮</span>
                        <button class="text-left flex-grow" onclick="app.selectFolder('${folder.replace(/'/g, "\\'")}'">
                            ${folder}
                        </button>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="app.showFolderEditModal('${folder.replace(/'/g, "\\'")}')"
                                class="text-blue-500">
                            編集
                        </button>
                        <button onclick="app.deleteFolder('${folder.replace(/'/g, "\\'")}')"
                                class="text-red-500">
                            削除
                        </button>
                    </div>
                </div>
            `).join('');
    }

    renderPrompts() {
        if (!this.dataManager.currentFolder) {
            elements.promptList.innerHTML = '';
            return;
        }

        const prompts = this.dataManager.data.prompts[this.dataManager.currentFolder];
        elements.promptList.innerHTML = prompts
            .map(prompt => `
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold cursor-pointer hover:text-blue-500"
                            onclick="app.showPromptTitleEditModal('${prompt.id}', '${prompt.title}')">
                            ${prompt.title}
                        </h3>
                        <button onclick="app.deletePrompt('${prompt.id}')" 
                                class="text-red-500">削除</button>
                    </div>
                    <p class="mt-2 text-gray-600 whitespace-pre-wrap">${prompt.content}</p>
                    <button onclick="app.copyPromptToClipboard('${prompt.id}')" 
                            class="mt-2 text-blue-500">
                        コピー
                    </button>
                </div>
            `).join('');
    }

    showFolderEditModal(folderName) {
        this.dataManager.editingFolder = folderName;
        elements.editFolderName.value = folderName;
        elements.folderEditModal.classList.remove('hidden');
    }

    showPromptTitleEditModal(promptId, currentTitle) {
        this.dataManager.editingPromptId = promptId;
        elements.editPromptTitle.value = currentTitle;
        elements.promptTitleEditModal.classList.remove('hidden');
    }

    deleteFolder(name) {
        if (confirm(`フォルダ「${name}」を削除してもよろしいですか？\n中のプロンプトも全て削除されます。`)) {
            if (this.dataManager.deleteFolder(name)) {
                this.renderFolders();
                this.updateCurrentFolderDisplay();
                this.renderPrompts();
                this.showToast('フォルダを削除しました');
            }
        }
    }

    selectFolder(name) {
        this.dataManager.selectFolder(name);
        this.updateCurrentFolderDisplay();
        elements.folderView.classList.add('hidden');
        this.renderPrompts();
    }

    updateCurrentFolderDisplay() {
        elements.currentFolder.textContent = 
            this.dataManager.currentFolder || '未選択';
    }

    deletePrompt(id) {
        if (confirm('このプロンプトを削除しますか？')) {
            if (this.dataManager.deletePrompt(id)) {
                this.renderPrompts();
                this.showToast('削除しました');
            }
        }
    }

    copyPromptToClipboard(id) {
        const prompts = this.dataManager.data.prompts[this.dataManager.currentFolder];
        const prompt = prompts.find(p => p.id === id);
        if (prompt) {
            navigator.clipboard.writeText(prompt.content)
                .then(() => this.showToast('コピーしました'))
                .catch(() => this.showToast('コピーに失敗しました'));
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 
            'fixed bottom-4 left-1/2 transform -translate-x-1/2 ' +
            'bg-gray-800 text-white px-4 py-2 rounded-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// アプリケーションの初期化
const app = new UIManager(new DataManager());
