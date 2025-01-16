document.addEventListener("DOMContentLoaded", loadData);

const folderList = document.getElementById("folderList");
const memoList = document.getElementById("memoList");
const newFolderBtn = document.getElementById("newFolderBtn");
const newMemoBtn = document.getElementById("newMemoBtn");

let folders = JSON.parse(localStorage.getItem('folders')) || {};
let currentFolder = null;

// フォルダ追加（修正版）
newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("新しいフォルダ名を入力:");
    if (folderName && !folders[folderName]) {
        folders[folderName] = [];
        currentFolder = folderName;
        saveData();
        renderFolders();
    } else {
        alert("既に存在するフォルダ名か、無効な名前です。");
    }
});

// メモ追加（修正版）
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
    Object.keys(folders).forEach((folder, index) => {
        const folderBtn = document.createElement("button");
        folderBtn.textContent = folder;
        folderBtn.className = "folder-btn";
        folderBtn.dataset.index = index;
        folderBtn.onclick = () => {
            currentFolder = folder;
            renderMemos();
        };
        folderBtn.draggable = true;

        // ドラッグ開始
        folderBtn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('folderIndex', index);
        });

        // ドロップ許可
        folderBtn.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // ドロップ処理
        folderBtn.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = e.dataTransfer.getData('folderIndex');
            const toIndex = e.target.dataset.index;
            reorderFolders(fromIndex, toIndex);
        });

        folderList.appendChild(folderBtn);
    });
}

// フォルダの並べ替え
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

            const headingDiv = document.createElement("h3");
            headingDiv.className = "memo-heading";
            headingDiv.textContent = memo.heading;
            headingDiv.onclick = () => editMemoHeading(index);  // 見出し編集

            const contentDiv = document.createElement("p");
            contentDiv.textContent = memo.content;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            // ドラッグ開始
            memoDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('memoIndex', index);
            });

            // ドロップ許可
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

// メモの並べ替え
function reorderMemos(fromIndex, toIndex) {
    const memoArray = folders[currentFolder];
    const [movedMemo] = memoArray.splice(fromIndex, 1);
    memoArray.splice(toIndex, 0, movedMemo);
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
}

// データ読み込み
function loadData() {
    renderFolders();
    if (currentFolder) renderMemos();
}
