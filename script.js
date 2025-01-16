// フォルダのドラッグ＆ドロップ並べ替え
function renderFolders() {
    folderList.innerHTML = "";
    Object.keys(folders).forEach(folder => {
        const folderDiv = createFolderElement(folder);
        folderDiv.draggable = true;

        // ドラッグ開始
        folderDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', folder);
        });

        // ドロップ許可
        folderDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // ドロップ処理
        folderDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedFolder = e.dataTransfer.getData('text/plain');
            reorderFolders(draggedFolder, folder);
        });

        folderList.appendChild(folderDiv);
    });
}

// フォルダの順序を入れ替える
function reorderFolders(dragged, target) {
    const newOrder = {};
    Object.keys(folders).forEach(folder => {
        if (folder === target) newOrder[dragged] = folders[dragged];
        if (folder !== dragged) newOrder[folder] = folders[folder];
    });
    folders = newOrder;
    saveData();
    renderFolders();
}

// メモの並べ替え
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";
            memoDiv.draggable = true;

            const headingDiv = document.createElement("div");
            headingDiv.className = "memo-heading";
            headingDiv.textContent = memo.heading;
            headingDiv.onclick = () => editMemoHeading(index);

            const contentDiv = document.createElement("div");
            contentDiv.textContent = memo.content;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "action-btn";
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            // ドラッグ開始
            memoDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
            });

            // ドロップ許可
            memoDiv.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            // ドロップ処理
            memoDiv.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedIndex = e.dataTransfer.getData('text/plain');
                reorderMemos(draggedIndex, index);
            });

            memoDiv.appendChild(headingDiv);
            memoDiv.appendChild(contentDiv);
            memoDiv.appendChild(deleteBtn);
            memoList.appendChild(memoDiv);
        });
    }
}

// メモの順序を入れ替える
function reorderMemos(fromIndex, toIndex) {
    const memoListArray = folders[currentFolder];
    const [movedMemo] = memoListArray.splice(fromIndex, 1);
    memoListArray.splice(toIndex, 0, movedMemo);
    saveData();
    renderMemos();
}

// メモの見出し編集
function editMemoHeading(index) {
    const newHeading = prompt("新しい見出しを入力:", folders[currentFolder][index].heading);
    if (newHeading) {
        folders[currentFolder][index].heading = newHeading;
        saveData();
        renderMemos();
    }
}
