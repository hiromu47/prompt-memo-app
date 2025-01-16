document.addEventListener("DOMContentLoaded", loadData);

const folderList = document.getElementById("folderList");
const memoList = document.getElementById("memoList");
const newFolderBtn = document.getElementById("newFolderBtn");
const newMemoBtn = document.getElementById("newMemoBtn");

let folders = JSON.parse(localStorage.getItem('folders')) || {};
let folderOrder = JSON.parse(localStorage.getItem('folderOrder')) || [];
let currentFolder = null;

// フォルダ追加
newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("新しいフォルダ名を入力:");
    if (folderName && !folders[folderName]) {
        folders[folderName] = [];
        folderOrder.push(folderName);
        saveData();
        renderFolders();
    }
});

// メモ追加
newMemoBtn.addEventListener("click", () => {
    if (!currentFolder) {
        alert("フォルダを選択してください！");
        return;
    }
    const memoTitle = prompt("メモのタイトルを入力:");
    const memoContent = prompt("メモ内容を入力:");
    if (memoTitle && memoContent) {
        folders[currentFolder].push({ title: memoTitle, content: memoContent });
        saveData();
        renderMemos();
    }
});

// フォルダの表示
function renderFolders() {
    folderList.innerHTML = "";
    folderOrder.forEach((folder, index) => {
        const folderDiv = document.createElement("div");
        folderDiv.className = "folder-item";
        folderDiv.draggable = true;
        folderDiv.dataset.index = index;

        const folderNameSpan = document.createElement("span");
        folderNameSpan.textContent = folder;
        folderNameSpan.onclick = () => {
            currentFolder = folder;
            renderMemos();
        };

        const editBtn = document.createElement("button");
        editBtn.innerHTML = "✏️";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editFolderName(folder);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteFolder(folder);
        };

        folderDiv.appendChild(folderNameSpan);
        folderDiv.appendChild(editBtn);
        folderDiv.appendChild(deleteBtn);

        // ドラッグイベント
        folderDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("folderIndex", index);
        });

        folderDiv.addEventListener("dragover", (e) => e.preventDefault());

        folderDiv.addEventListener("drop", (e) => {
            const fromIndex = e.dataTransfer.getData("folderIndex");
            reorderFolders(fromIndex, index);
        });

        folderList.appendChild(folderDiv);
    });
}

// フォルダの並べ替え
function reorderFolders(fromIndex, toIndex) {
    const movedFolder = folderOrder.splice(fromIndex, 1)[0];
    folderOrder.splice(toIndex, 0, movedFolder);
    saveData();
    renderFolders();
}

// フォルダ名の編集
function editFolderName(folder) {
    const newName = prompt("フォルダ名を変更:", folder);
    if (newName && newName !== folder) {
        folders[newName] = folders[folder];
        delete folders[folder];
        folderOrder[folderOrder.indexOf(folder)] = newName;
        saveData();
        renderFolders();
    }
}

// フォルダの削除
function deleteFolder(folder) {
    if (confirm("フォルダごと削除しますか？")) {
        delete folders[folder];
        folderOrder = folderOrder.filter(f => f !== folder);
        if (currentFolder === folder) currentFolder = null;
        saveData();
        renderFolders();
        memoList.innerHTML = "";
    }
}

// メモの表示
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";
            memoDiv.draggable = true;
            memoDiv.dataset.index = index;

            const memoTitleSpan = document.createElement("span");
            memoTitleSpan.textContent = memo.title;

            const editBtn = document.createElement("button");
            editBtn.innerHTML = "✏️";
            editBtn.onclick = () => editMemo(index);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "🗑️";
            deleteBtn.onclick = () => deleteMemo(index);

            memoDiv.appendChild(memoTitleSpan);
            memoDiv.appendChild(editBtn);
            memoDiv.appendChild(deleteBtn);

            // ドラッグイベント
            memoDiv.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("memoIndex", index);
            });

            memoDiv.addEventListener("dragover", (e) => e.preventDefault());

            memoDiv.addEventListener("drop", (e) => {
                const fromIndex = e.dataTransfer.getData("memoIndex");
                reorderMemos(fromIndex, index);
            });

            memoList.appendChild(memoDiv);
        });
    }
}

// メモの並べ替え
function reorderMemos(fromIndex, toIndex) {
    const movedMemo = folders[currentFolder].splice(fromIndex, 1)[0];
    folders[currentFolder].splice(toIndex, 0, movedMemo);
    saveData();
    renderMemos();
}

// メモの編集
function editMemo(index) {
    const memo = folders[currentFolder][index];
    const newTitle = prompt("新しいタイトル:", memo.title);
    const newContent = prompt("新しい内容:", memo.content);
    if (newTitle && newContent) {
        folders[currentFolder][index] = { title: newTitle, content: newContent };
        saveData();
        renderMemos();
    }
}

// メモの削除
function deleteMemo(index) {
    if (confirm("本当に削除しますか？")) {
        folders[currentFolder].splice(index, 1);
        saveData();
        renderMemos();
    }
}

// データ保存
function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
    localStorage.setItem('folderOrder', JSON.stringify(folderOrder));
}

// データ読み込み
function loadData() {
    renderFolders();
    if (currentFolder) renderMemos();
}
