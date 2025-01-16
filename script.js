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
    saveToFolder: getElement('saveToFolder'),
    currentFolderName: getElement('currentFolderName'),
    promptTitle: getElement('promptTitle'),
    promptContent: getElement('promptContent'),
    copyButton: getElement('copyButton'),
    saveButton: getElement('saveButton'),
    promptList: getElement('promptList'),
    folderEditModal: getElement('folderEditModal'),
    editFolderName: getElement('editFolderName'),
    saveFolderEdit: getElement('saveFolderEdit'),
    cancelFolderEdit: getElement('cancelFolderEdit'),
    promptTitleEditModal: getElement('promptTitleEditModal'),
    editPromptTitle: getElement('editPromptTitle'),
    savePromptTitleEdit: getElement('savePromptTitleEdit'),
    cancelPromptTitleEdit: getElement('cancelPromptTitleEdit')
};

// データ管理クラス
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.currentFolder = null;
        this.editingFolder = null;
        this.editingPromptId = null;
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

    validateFolderName(name) {
        return name && name.trim().length > 0 && name.trim().length <= 30;
    }

    addFolder(name) {
        name = name.trim();
        if (!this.validateFolderName(name)) return false;
        if (this.data.folders.includes(name)) return false;
        
        this.data.folders.push(name);
        this.data.prompts[name] = [];
        return this.saveData();
    }

    editFolder(oldName, newName) {
        newName = newName.trim();
        if (oldName === newName) return true;
        if (!this.validateFolderName(newName)) return false;
        if (this.data.folders.includes(newName)) return false;

        const index = this.data.folders.indexOf(oldName);
        if (index === -1) return false;

        this.data.folders[index] = newName;
        this.data.prompts[newName] = this.data.prompts[oldName];
        delete this.data.prompts[oldName];
        
        if (this.currentFolder === oldName) {
            this.currentFolder = newName;
        }
        
        return this.saveData();
    }

    reorderFolders(newOrder) {
        // 順序の整合性チェック
        if (newOrder.length !== this.data.folders.length) return false;
        if (!newOrder.every(folder => this.data.folders.includes(folder))) return false;

        this.data.folders = newOrder;
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

    savePrompt(folder, title, content) {
        if (!this.data.folders.includes(folder)) return false;
        if (!title.trim() || !content.trim()) return false;

        const prompt = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };

        this.data.prompts[folder].unshift(prompt);
        return this.saveData();
    }

    editPromptTitle(folder, promptId, newTitle) {
        newTitle = newTitle.trim();
        if (!newTitle) return false;

        const prompt = this.data.prompts[folder]?.find(p => p.id === promptId);
        if (!prompt) return false;

        prompt.title = newTitle;
        prompt.updated = new Date().toISOString();
        return this.saveData();
    }

    deletePrompt(folder, id) {
        const prompts = this.data.prompts[folder];
        if (!prompts) return false;

        const index = prompts.findIndex(p => p.id === id);
        if (index === -1) return false;

        prompts.splice(index, 1);
        return this.saveData();
    }

    getPrompt(folder, id) {
        return this.data.prompts[folder]?.find(p => p.id === id) || null;
    }
}

// UI管理クラス
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.setupEventListeners();
        this.setupSortable();
        this.renderAll();
    }

    setupSortable() {
        new Sortable(elements.folderList, {
            animation: 150,
            handle: '.folder-handle',
            onEnd: (evt) => {
                const folders = Array.from(elements.folderList.children)
                    .map(el => el.getAttribute('data-folder'));
                if (this.dataManager.reorderFolders(folders)) {
                    this.renderFoldersSelect();
                }
            }
        });
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
                this.renderAll();
                this.showToast('フォルダを作成しました');
            } else {
                this.showToast('同名のフォルダが既に存在します');
            }
        });

        // フォルダの選択
        elements.saveToFolder.addEventListener('change', (e) => {
            const selectedFolder = e.target.value;
            if (selectedFolder) {
                this.dataManager.selectFolder(selectedFolder);
                this.updateCurrentFolderDisplay();
                this.renderPrompts();
            }
        });

        // プロンプトの保存
        elements.saveButton.addEventListener('click', () => {
            const folder = elements.saveToFolder.value;
            if (!folder) {
                this.showToast('保存先フォルダを選択してください');
                return;
            }

            const title = elements.promptTitle.value.trim();
            const content = elements.promptContent.value.trim();

            if (!title || !content) {
                this.showToast('タイトルとプロンプト内容を入力してください');
                return;
            }

            if (this.dataManager.savePrompt(folder, title, content)) {
                elements.promptTitle.value = '';
                elements.promptContent.value = '';
                if (folder === this.dataManager.currentFolder) {
                    this.renderPrompts();
                }
                this.showToast('保存しました');
            } else {
                this.showToast('保存に失敗しました');
            }
        });

        // フォルダ編集モーダルの制御
        elements.saveFolderEdit.addEventListener('click', () => {
            const newName = elements.editFolderName.value.trim();
            if (!newName) return;

            if (this.dataManager.editFolder(this.dataManager.editingFolder, newName)) {
                this.renderAll();
                elements.folderEditModal.classList.add('hidden');
                this.showToast('フォルダ名を変更しました');
            } else {
                this.showToast('同名のフォルダが既に存在します');
            }
        });

        elements.cancelFolderEdit.addEventListener('click', () => {
            elements.folderEditModal.classList.add('hidden');
        });

        // プロンプトタイトル編集モーダルの制御
        elements.savePromptTitleEdit.addEventListener('click', () => {
            const newTitle = elements.editPromptTitle.value.trim();
            if (!newTitle) return;

            if (this.dataManager.editPromptTitle(
                this.dataManager.currentFolder,
                this.dataManager.editingPromptId,
                newTitle
            )) {
                this.renderPrompts();
                elements.promptTitleEditModal.classList.add('hidden');
                this.showToast('タイトルを変更しました');
            }
        });

        elements.cancelPromptTitleEdit.addEventListener('click', () => {
            elements.promptTitleEditModal.classList.add('hidden');
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
        this.renderFoldersSelect();
        this.updateCurrentFolderDisplay();
        this.renderPrompts();
    }

    renderFolders() {
        const folders = this.dataManager.data.folders;
        elements.folderList.innerHTML = folders.length ? folders
            .map(folder => `
                <div class="folder-item p-4 border-b bg-white" data-folder="${folder}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center flex-grow">
                            <span class="folder-handle mr-2 text-gray-400 cursor-move">⋮⋮</span>
                            <button class="flex-grow text-left" 
                                    onclick="app.handleFolderClick('${this.escapeHtml(folder)}')">
                                ${this.escapeHtml(folder)}
                            </button>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="app.handleFolderEdit('${this.escapeHtml(folder)}')"
                                    class="text-blue-500 px-2">
                                編集
                            </button>
                            <button onclick="app.handleFolderDelete('${this.escapeHtml(folder)}')"
                                    class="text-red-500 px-2">
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="p-4 text-gray-500">フォルダがありません</div>';
    }

    renderFoldersSelect() {
        const folders = this.dataManager.data.folders;
        elements.saveToFolder.innerHTML = `
            <option value="">フォルダを選択してください</option>
            ${folders.map(folder => `
                <option value="${this.escapeHtml(folder)}"
                        ${folder === this.dataManager.currentFolder ? 'selected' : ''}>
                    ${this.escapeHtml(folder)}
                </option>
            `).join('')}
        `;
    }

    renderPrompts() {
        const currentFolder = this.dataManager.currentFolder;
        if (!currentFolder) {
            elements.promptList.innerHTML = 
                '<div class="text-gray-500">フォルダを選択してください</div>';
            return;
        }

        const prompts = this.dataManager.data.prompts[currentFolder];
        elements.promptList.innerHTML = prompts.length ? prompts
            .map(prompt => `
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold cursor-pointer hover:text-blue-500"
                            onclick="app.handlePromptTitleEdit('${prompt.id}', '${this.escapeHtml(prompt.title)}')">
                            ${this.escapeHtml(prompt.title)}
                        </h3>
                        <button onclick="app.handlePromptDelete('${prompt.id}')" 
                                class="text-red-500">
                            削除
                        </button>
                    </div>
                    <p class="mt-2 text-gray-600 whitespace-pre-wrap">${this.escapeHtml(prompt.content)}</p>
                    <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>更新: ${this.formatDate(prompt.updated)}</span>
                        <button onclick="app.handlePromptCopy('${prompt.id}')" 
                                class="text-blue-500">
                            コピー
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="text-gray-500">プロンプトがありません</div>';
    }

    updateCurrentFolderDisplay() {
        elements.currentFolderName.textContent = 
            `フォルダ: ${this.dataManager.currentFolder || '未選択'}`;
    }

    // Event Handlers
    handleFolderClick(folder) {
