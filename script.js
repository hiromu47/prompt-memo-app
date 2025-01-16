document.addEventListener("DOMContentLoaded", loadData);

const folderList = document.getElementById("folderList");
const memoList = document.getElementById("memoList");
const newFolderBtn = document.getElementById("newFolderBtn");
const newMemoBtn = document.getElementById("newMemoBtn");

let folders = JSON.parse(localStorage.getItem('folders')) || {};
let folderOrder = JSON.parse(localStorage.getItem('folderOrder')) || [];
let currentFolder = null;

// フォルダ追加（並び順も管理）
newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("新しいフォルダ名を入力:");
    if (folderName && !folders[folderName]) {
        folders[folderName] = [];
        folderOrder.push(folderName);  // 並び順にも追加
        currentFolder = folderName;
        saveData();
        renderFolders();
    } else {
        alert("既に存在するフォルダ名か、無効な名前です。");
    }
});

// メモ追加（見出し対応）
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

// フォルダの表示（ドラッグ＆ドロップ対応）
function renderFolders() {
    folderList.innerHTML = "";
    folderOrder.forEach((folder, index) => {
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

// フォルダの並べ替え
function reorderFolders(fromIndex, toIndex) {
    fromIndex = parseInt(fromIndex);
    toIndex = parseInt(toIndex);

    const movedFolder = folderOrder.splice(fromIndex, 1)[0];
    folderOrder.splice(toIndex, 0, movedFolder);

    saveData();
    renderFolders();
}

// メモの表示（見出し付き）
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";

            const headingDiv = document.createElement("h3");
            headingDiv.textContent = memo.heading;
            headingDiv.onclick = () => editMemoHeading(index);

            const contentDiv = document.createElement("p");
            contentDiv.textContent = memo.content;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            memoDiv.appendChild(headingDiv);
            memoDiv.appendChild(contentDiv);
            memoDiv.appendChild(deleteBtn);
            memoList.appendChild(memoDiv);
        });
    }
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

// データ保存（フォルダ順序も保存）
function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
    localStorage.setItem('folderOrder', JSON.stringify(folderOrder));
}

// データ読み込み
function loadData() {
    renderFolders();
    if (currentFolder) renderMemos();
}
