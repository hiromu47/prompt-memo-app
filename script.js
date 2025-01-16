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
        saveData();
        renderFolders();
    }
});

// フォルダ編集・削除
function createFolderElement(folder) {
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";

    const folderBtn = document.createElement("button");
    folderBtn.textContent = folder;
    folderBtn.onclick = () => {
        currentFolder = folder;
        renderMemos();
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editFolderName(folder);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = () => deleteFolder(folder);

    folderDiv.appendChild(folderBtn);
    folderDiv.appendChild(editBtn);
    folderDiv.appendChild(deleteBtn);

    return folderDiv;
}

function editFolderName(oldName) {
    const newName = prompt("新しいフォルダ名を入力:", oldName);
    if (newName && newName !== oldName) {
        folders[newName] = folders[oldName];
        delete folders[oldName];
        saveData();
        renderFolders();
    }
}

function deleteFolder(folder) {
    if (confirm(`${folder}を削除しますか？`)) {
        delete folders[folder];
        saveData();
        renderFolders();
    }
}

function renderFolders() {
    folderList.innerHTML = "";
    for (let folder in folders) {
        folderList.appendChild(createFolderElement(folder));
    }
}

// メモ追加（見出し対応）
newMemoBtn.addEventListener("click", () => {
    if (!currentFolder) {
        alert("フォルダを選択してください！");
        return;
    }
    const heading = prompt("メモの見出しを入力:");
    const content = prompt("メモの内容を入力:");
    if (heading && content) {
        folders[currentFolder].push({ heading, content });
        saveData();
        renderMemos();
    }
});

function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo";

            const headingDiv = document.createElement("div");
            headingDiv.className = "memo-heading";
            headingDiv.textContent = memo.heading;

            const contentDiv = document.createElement("div");
            contentDiv.textContent = memo.content;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "action-btn";
            deleteBtn.textContent = "削除";
            deleteBtn.onclick = () => deleteMemo(index);

            memoDiv.appendChild(headingDiv);
            memoDiv.appendChild(contentDiv);
            memoDiv.appendChild(deleteBtn);

            memoList.appendChild(memoDiv);
        });
    }
}

function deleteMemo(index) {
    if (confirm("本当に削除しますか？")) {
        folders[currentFolder].splice(index, 1);
        saveData();
        renderMemos();
    }
}

function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

function loadData() {
    renderFolders();
    if (currentFolder) renderMemos();
}
