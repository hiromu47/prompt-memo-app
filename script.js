// PWAのService Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
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
    promptList: document.getElementById('promptList')
};

// データ管理
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.currentFolder = null;
    }

    // データの読み込み
    loadData() {
        const saved = localStorage.getItem('promptDictionary');
        return saved ? JSON.parse(saved) : { folders: [], prompts: {} };
    }

    // データの保存
    saveData() {
        localStorage.setItem('promptDictionary', JSON.stringify(this.data));
    }

    // フォルダの追加
    addFolder(name) {
        if (!this.data.folders.includes(name)) {
            this.data.folders.push(name);
            this.data.prompts[name] = [];
            this.saveData();
            return true;
        }
        return false;
    }

    // プロンプトの保存
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

    // プロンプトの削除
    deletePrompt(id) {
        if (!this.currentFolder) return false;

        this.data.prompts[this.currentFolder] = 
            this.data.prompts[this.currentFolder].filter(p => p.id !== id);
        this.saveData();
        return true;
    }

    // フォルダの選択
    selectFolder(name) {
        this.currentFolder = name;
        return this.data.prompts[name] || [];
    }
}

// UI管理
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.setupEventListeners();
        this.renderFolders();
    }

    // イベントリスナーの設定
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
            if (name) {
                if (this.dataManager.addFolder(name)) {
                    this.renderFolders();
                    elements.newFolderName.value = '';
                } else {
                    this.showToast('同名のフォルダが既に存在します');
                }
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
                this.renderPrompts();
                elements.promptTitle.value = '';
                elements.promptContent.value = '';
                this.showToast('保存しました');
            }
        });

        // プロンプトのコピー
        elements.copyButton.addEventListener('click', () => {
            const content = elements.promptContent.value.trim();
            if (content) {
                navigator.clipboard.writeText(content)
                    .then(() => this.showToast('コピーしました'))
                    .catch(() => this.showToast('コピーに失敗しました'));
            }
        });
    }

    // フォルダ一覧の表示
    renderFolders() {
        elements.folderList.innerHTML = this.dataManager.data.folders
            .map(folder => `
                <div class="p-2 border-b cursor-pointer hover:bg-gray-100" 
                     onclick="app.selectFolder('${folder}')">
                    ${folder}
                </div>
            `).join('');
    }

    // プロンプト一覧の表示
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
                        <h3 class="font-bold">${prompt.title}</h3>
                        <button onclick="app.deletePrompt('${prompt.id}')" 
                                class="text-red-500">削除</button>
                    </div>
                    <p class="mt-2 text-gray-600">${prompt.content}</p>
                    <button onclick="app.copyPromptToClipboard('${prompt.id}')" 
                            class="mt-2 text-blue-500">
                        コピー
                    </button>
                </div>
            `).join('');
    }

    // フォルダの選択
    selectFolder(name) {
        this.dataManager.selectFolder(name);
        elements.currentFolder.textContent = name;
        elements.folderView.classList.add('hidden');
        this.renderPrompts();
    }

    // プロンプトの削除
    deletePrompt(id) {
        if (confirm('このプロンプトを削除しますか？')) {
            if (this.dataManager.deletePrompt(id)) {
                this.renderPrompts();
                this.showToast('削除しました');
            }
        }
    }

    // プロンプトのコピー
    copyPromptToClipboard(id) {
        const prompts = this.dataManager.data.prompts[this.dataManager.currentFolder];
        const prompt = prompts.find(p => p.id === id);
        if (prompt) {
            navigator.clipboard.writeText(prompt.content)
                .then(() => this.showToast('コピーしました'))
                .catch(() => this.showToast('コピーに失敗しました'));
        }
    }

    // トースト通知の表示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 
            'fixed bottom-4 left-1/2 transform -translate-x-1/2 ' +
            'bg-gray-800 text-white px-4 py-2 rounded-lg';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Service Workerファイルの作成も必要です
const app = new UIManager(new DataManager());
