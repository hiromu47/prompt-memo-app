// PWAのService Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/prompt-memo-app/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(error => console.error('ServiceWorker registration failed:', error));
    });
}

// DOM要素の取得と存在確認
const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Element with id "${id}" not found`);
    return element;
};

// DOM要素
const elements = {
    folderView: getElement('folderView'),
    showFolders: getElement('showFolders'),
    closeFolderView: getElement('closeFolderView'),
    newFolderName: getElement('newFolderName'),
    addFolder: getElement('addFolder'),
    folderList: getElement('folderList'),
    currentFolder: getElement('folderName'),
    promptTitle: getElement('promptTitle'),
    promptContent: getElement('promptContent'),
    copyButton: getElement('copyButton'),
    saveButton: getElement('saveButton'),
    promptList: getElement('promptList')
};

// データ管理クラス
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.currentFolder = null;
    }

    loadData() {
        try {
            const saved = localStorage.getItem('promptDictionary');
            return saved ? JSON.parse(saved) : { folders: [], prompts: {} };
        } catch (error) {
            console.error('Error loading data:', error);
            return { folders: [], prompts: {} };
        }
    }

    saveData() {
        try {
            localStorage.setItem('promptDictionary', JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    addFolder(name) {
        if (!name || this.data.folders.includes(name)) return false;
        
        this.data.folders.push(name);
        this.data.prompts[name] = [];
        return this.saveData();
    }

    deleteFolder(name) {
        const index = this.data.folders.indexOf(name);
        if (index === -1) return false;

        this.data.folders.splice(index, 1);
        delete this.data.prompts[name];
        
        if (this.currentFolder === name) {
            this.currentFolder = null;
        }
        
        return this.saveData();
    }

    selectFolder(name) {
        if (!this.data.folders.includes(name)) return false;
        this.currentFolder = name;
        return true;
    }

    savePrompt(title, content) {
        if (!this.currentFolder || !title || !content) return false;

        const prompt = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            created: new Date().toISOString()
        };

        this.data.prompts[this.currentFolder].unshift(prompt);
        return this.saveData();
    }

    deletePrompt(id) {
        if (!this.currentFolder) return false;

        const prompts = this.data.prompts[this.currentFolder];
        const index = prompts.findIndex(p => p.id === id);
        if (index === -1) return false;

        prompts.splice(index, 1);
        return this.saveData();
    }

    getCurrentFolderPrompts() {
        return this.currentFolder ? this.data.prompts[this.currentFolder] : [];
    }
}

// UI管理クラス
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.setupEventListeners();
        this.renderAll();
    }

    setupEventListeners() {
        // フォルダビューの表示/非表示
        elements.showFolders.addEventListener('click', () => {
            elements.folderView.classList.remove('hidden');
        });

        elements.closeFolderView.addEventListener('click', () => {
            elements.folderView.classList.add('hidden');
        });

        // フォルダの追加
        elements.addFolder.addEventListener('click', () => {
            const name = elements.newFolderName.value.trim();
            if (!name) {
                this.showToast('フォルダ名を入力してください');
                return;
            }

            if (this.dataManager.addFolder(name)) {
                elements.newFolderName.value = '';
                this.renderFolders();
                this.showToast('フォルダを作成しました');
            } else {
                this.showToast('同名のフォルダが既に存在します');
            }
        });

        // プロンプトの保存
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
                elements.promptTitle.value = '';
                elements.promptContent.value = '';
                this.renderPrompts();
                this.showToast('保存しました');
            } else {
                this.showToast('保存に失敗しました');
            }
        });

        // コピーボタン
        elements.copyButton.addEventListener('click', () => {
            const content = elements.promptContent.value.trim();
            if (!content) return;

            navigator.clipboard.writeText(content)
                .then(() => this.showToast('コピーしました'))
                .catch(() => this.showToast('コピーに失敗しました'));
        });
    }

    renderAll() {
        this.renderFolders();
        this.updateCurrentFolderDisplay();
        this.renderPrompts();
    }

    renderFolders() {
        const folders = this.dataManager.data.folders;
        elements.folderList.innerHTML = folders.length ? folders
            .map(folder => `
                <div class="folder-item p-4 border-b bg-white" data-folder="${folder}">
                    <div class="flex items-center justify-between">
                        <button class="flex-grow text-left py-2" 
                                onclick="app.handleFolderClick('${folder}')">
                            ${this.escapeHtml(folder)}
                        </button>
                        <button class="text-red-500 px-4 py-2" 
                                onclick="app.handleFolderDelete('${folder}')">
                            削除
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="p-4 text-gray-500">フォルダがありません</div>';
    }

    renderPrompts() {
        const prompts = this.dataManager.getCurrentFolderPrompts();
        elements.promptList.innerHTML = prompts.length ? prompts
            .map(prompt => `
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold flex-grow">
                            ${this.escapeHtml(prompt.title)}
                        </h3>
                        <button class="text-red-500 ml-2" 
                                onclick="app.handlePromptDelete('${prompt.id}')">
                            削除
                        </button>
                    </div>
                    <p class="text-gray-600 whitespace-pre-wrap mb-2">
                        ${this.escapeHtml(prompt.content)}
                    </p>
                    <button class="text-blue-500" 
                            onclick="app.handlePromptCopy('${prompt.id}')">
                        コピー
                    </button>
                </div>
            `).join('') : this.dataManager.currentFolder ? 
                '<div class="text-gray-500">プロンプトがありません</div>' : 
                '<div class="text-gray-500">フォルダを選択してください</div>';
    }

    updateCurrentFolderDisplay() {
        elements.currentFolder.textContent = 
            this.dataManager.currentFolder || '未選択';
    }

    // Event Handlers
    handleFolderClick(folder) {
        if (this.dataManager.selectFolder(folder)) {
            this.updateCurrentFolderDisplay();
            this.renderPrompts();
            elements.folderView.classList.add('hidden');
        }
    }

    handleFolderDelete(folder) {
        if (!confirm(`フォルダ「${folder}」を削除してもよろしいですか？\n中のプロンプトも全て削除されます。`)) {
            return;
        }

        if (this.dataManager.deleteFolder(folder)) {
            this.renderAll();
            this.showToast('フォルダを削除しました');
        }
    }

    handlePromptDelete(id) {
        if (!confirm('このプロンプトを削除してもよろしいですか？')) {
            return;
        }

        if (this.dataManager.deletePrompt(id)) {
            this.renderPrompts();
            this.showToast('削除しました');
        }
    }

    handlePromptCopy(id) {
        const prompts = this.dataManager.getCurrentFolderPrompts();
        const prompt = prompts.find(p => p.id === id);
        if (!prompt) return;

        navigator.clipboard.writeText(prompt.content)
            .then(() => this.showToast('コピーしました'))
            .catch(() => this.showToast('コピーに失敗しました'));
    }

    // Utility Methods
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 
            'fixed bottom-4 left-1/2 transform -translate-x-1/2 ' +
            'bg-gray-800 text-white px-4 py-2 rounded-lg z-50';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, duration);
    }
}

// アプリケーションのインスタンス化
const app = new UIManager(new DataManager());
