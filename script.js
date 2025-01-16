// フォルダの表示（ドラッグ＆ドロップ対応）
function renderFolders() {
    folderList.innerHTML = "";
    Object.keys(folders).forEach((folder, index) => {
        const folderDiv = createFolderElement(folder);
        folderDiv.draggable = true;
        folderDiv.dataset.index = index;

        // ドラッグ開始
        folderDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('folderIndex', e.target.dataset.index);
        });

        // ドラッグオーバー
        folderDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // ドロップ処理
        folderDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = e.dataTransfer.getData('folderIndex');
            const toIndex = e.target.dataset.index;
            reorderFolders(fromIndex, toIndex);
        });

        folderList.appendChild(folderDiv);
    });
}

// フォルダの順序を入れ替える
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

// メモの表示（ドラッグ＆ドロップ対応 + 見出し編集）
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";
            memoDiv.draggable = true;
            memoDiv.dataset.index = index;

            const headingDiv = document.createElement("div");
            headingDiv.className = "memo-heading";
            headingDiv.textContent = memo.heading;
            headingDiv.onclick = () => editMemoHeading(index);  // 見出しの編集

            const contentDiv = document.createElement("div");
            contentDiv.textContent = memo.content;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "action-btn";
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            // ドラッグ開始
            memoDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('memoIndex', e.target.dataset.index);
            });

            // ドラッグオーバー
            memoDiv.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            // ドロップ処理
            memoDiv.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = e.dataTransfer.getData('memoIndex');
                const toIndex = e.target.dataset.index;
                reorderMemos(fromIndex, toIndex);
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

// メモの見出しを編集
function editMemoHeading(index) {
    const currentHeading = folders[currentFolder][index].heading;
    const newHeading = prompt("新しい見出しを入力:", currentHeading);
    if (newHeading && newHeading !== currentHeading) {
        folders[currentFolder][index].heading = newHeading;
        saveData();
        renderMemos();
    }
}
