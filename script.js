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

// メモ追加（修正）
newMemoBtn.addEventListener("click", () => {
    if (!currentFolder) {
        alert("メモを追加するフォルダを選択してください！");
        return;
    }
    const memoTitle = prompt("メモのタイトルを入力:");
    const memoContent = prompt("メモの内容を入力:");
    if (memoTitle && memoContent) {
        if (!folders[currentFolder]) {
            folders[currentFolder] = [];
        }
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

// メモの表示
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder && folders[currentFolder]) {
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
