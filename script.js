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
        currentFolder = folderName;
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
    const memoHeading = prompt("メモの見出しを入力:");
    const memoContent = prompt("メモ内容を入力:");
    if (memoHeading && memoContent) {
        folders[currentFolder].push({ heading: memoHeading, content: memoContent });
        saveData();
        renderMemos();
    }
});

// フォルダの表示
function renderFolders() {
    folderList.innerHTML = "";
    folderOrder.forEach((folder) => {
        const folderDiv = document.createElement("div");
        folderDiv.className = "folder-item";
        folderDiv.textContent = folder;
        folderDiv.onclick = () => {
            currentFolder = folder;
            renderMemos();
        };

        const editBtn = document.createElement("button");
        editBtn.innerHTML = "✏️";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editFolderName(folder);
        };

        folderDiv.appendChild(editBtn);
        folderList.appendChild(folderDiv);
    });
}

// フォルダ名の編集
function editFolderName(folder) {
    const newFolderName = prompt("フォルダ名を変更:", folder);
    if (newFolderName && newFolderName !== folder) {
        folders[newFolderName] = folders[folder];
        delete folders[folder];
        folderOrder[folderOrder.indexOf(folder)] = newFolderName;
        saveData();
        renderFolders();
    }
}

// メモの表示（ドラッグ＆ドロップ対応）
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";
            memoDiv.draggable = true;
            memoDiv.dataset.index = index;

            const headingDiv = document.createElement("div");
            headingDiv.textContent = memo.heading;

            const editBtn = document.createElement("button");
            editBtn.innerHTML = "✏️";
            editBtn.onclick = () => editMemoHeading(index);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "🗑️";
            deleteBtn.onclick = () => deleteMemo(index);

            memoDiv.appendChild(headingDiv);
            memoDiv.appendChild(editBtn);
            memoDiv.appendChild(deleteBtn);

            // ドラッグ処理
            memoDiv.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("memoIndex", index);
            });

            memoDiv.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

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
    fromIndex = parseInt(fromIndex);
    toIndex = parseInt(toIndex);

    const movedMemo = folders[currentFolder].splice(fromIndex, 1)[0];
    folders[currentFolder].splice(toIndex, 0, movedMemo);

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
