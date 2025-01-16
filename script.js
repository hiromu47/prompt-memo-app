// データの読み込み
document.addEventListener("DOMContentLoaded", loadData);

const folderList = document.getElementById("folderList");
const memoList = document.getElementById("memoList");
const newFolderBtn = document.getElementById("newFolderBtn");
const newMemoBtn = document.getElementById("newMemoBtn");

let folders = JSON.parse(localStorage.getItem('folders')) || {};
let currentFolder = localStorage.getItem('currentFolder') || null;

// フォルダ追加（動作修正済み）
newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("新しいフォルダ名を入力:");
    if (folderName && !folders[folderName]) {
        folders[folderName] = [];
        currentFolder = folderName;
        saveData();
        renderFolders();
        renderMemos();
    } else if (folders[folderName]) {
        alert("同じ名前のフォルダが既に存在します。");
    }
});

// メモ追加（動作修正済み）
newMemoBtn.addEventListener("click", () => {
    if (!currentFolder) {
        alert("フォルダを選択してください！");
        return;
    }
    const memoContent = prompt("メモ内容を入力:");
    if (memoContent) {
        folders[currentFolder].push({ content: memoContent, timestamp: new Date().toLocaleString() });
        saveData();
        renderMemos();
    }
});

// フォルダの表示（修正済み）
function renderFolders() {
    folderList.innerHTML = "";
    Object.keys(folders).forEach(folder => {
        const folderBtn = document.createElement("button");
        folderBtn.textContent = folder;
        folderBtn.className = folder === currentFolder ? "selected" : "";
        folderBtn.onclick = () => {
            currentFolder = folder;
            saveData();
            renderFolders();
            renderMemos();
        };
        folderList.appendChild(folderBtn);
    });
}

// メモの表示（修正済み）
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";

            const memoContent = document.createElement("p");
            memoContent.textContent = memo.content;

            const memoTimestamp = document.createElement("small");
            memoTimestamp.textContent = memo.timestamp;

            const copyBtn = document.createElement("button");
            copyBtn.className = "copyBtn";
            copyBtn.textContent = "コピー";
            copyBtn.onclick = () => copyToClipboard(memo.content);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "deleteBtn";
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            memoDiv.appendChild(memoContent);
            memoDiv.appendChild(memoTimestamp);
            memoDiv.appendChild(copyBtn);
            memoDiv.appendChild(deleteBtn);
            memoList.appendChild(memoDiv);
        });
    }
}

// メモ削除（修正済み）
function deleteMemo(index) {
    if (confirm("本当に削除しますか？")) {
        folders[currentFolder].splice(index, 1);
        saveData();
        renderMemos();
    }
}

// データ保存（修正済み）
function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
    localStorage.setItem('currentFolder', currentFolder);
}

// データ読み込み（修正済み）
function loadData() {
    renderFolders();
    if (currentFolder) {
        renderMemos();
    }
}
