// データの読み込み
document.addEventListener("DOMContentLoaded", loadData);

const folderList = document.getElementById("folderList");
const memoList = document.getElementById("memoList");
const newFolderBtn = document.getElementById("newFolderBtn");
const newMemoBtn = document.getElementById("newMemoBtn");

let folders = JSON.parse(localStorage.getItem('folders')) || {};
let currentFolder = null;

// フォルダ追加
newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("新しいフォルダ名を入力:");
    if (folderName) {
        folders[folderName] = [];
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
    const memoContent = prompt("メモ内容を入力:");
    if (memoContent) {
        folders[currentFolder].push(memoContent);
        saveData();
        renderMemos();
    }
});

// フォルダの表示
function renderFolders() {
    folderList.innerHTML = "";
    for (let folder in folders) {
        const folderBtn = document.createElement("button");
        folderBtn.textContent = folder;
        folderBtn.onclick = () => {
            currentFolder = folder;
            renderMemos();
        };
        folderList.appendChild(folderBtn);
    }
}

// メモの表示
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";
            memoDiv.textContent = memo;

            const copyBtn = document.createElement("button");
            copyBtn.className = "copyBtn";
            copyBtn.textContent = "コピー";
            copyBtn.onclick = () => copyToClipboard(memo);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "deleteBtn";
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            memoDiv.appendChild(copyBtn);
            memoDiv.appendChild(deleteBtn);
            memoList.appendChild(memoDiv);
        });
    }
}

// メモのコピー
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("コピーしました！");
    }).catch(err => {
        console.error("コピー失敗:", err);
    });
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
