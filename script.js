// フォルダの表示（ドラッグ＆ドロップ対応）
function renderFolders() {
    folderList.innerHTML = "";
    Object.keys(folders).forEach((folder, index) => {
        const folderDiv = document.createElement("div");
        folderDiv.textContent = folder;
        folderDiv.className = "folder-item";
        folderDiv.dataset.index = index;
        folderDiv.draggable = true;

        folderDiv.onclick = () => {
            currentFolder = folder;
            renderMemos();
        };

        // ドラッグ開始
        folderDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('folderIndex', index);
            e.target.classList.add('dragging');
        });

        // ドラッグオーバー
        folderDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.target.classList.add('drag-over');
        });

        // ドラッグ離脱
        folderDiv.addEventListener('dragleave', (e) => {
            e.target.classList.remove('drag-over');
        });

        // ドロップ処理
        folderDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            e.target.classList.remove('drag-over');
            const fromIndex = e.dataTransfer.getData('folderIndex');
            const toIndex = e.target.dataset.index;
            reorderFolders(fromIndex, toIndex);
        });

        folderDiv.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        folderList.appendChild(folderDiv);
    });
}

// フォルダの並べ替え（データ更新）
function reorderFolders(fromIndex, toIndex) {
    const folderKeys = Object.keys(folders);
    const movedFolder = folderKeys.splice(fromIndex, 1)[0];
    folderKeys.splice(toIndex, 0, movedFolder);

    const reorderedFolders = {};
    folderKeys.forEach(key => {
        reorderedFolders[key] = folders[key];
    });

    folders = reorderedFolders;
    saveData();
    renderFolders();
}
