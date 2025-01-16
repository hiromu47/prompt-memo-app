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
    if (folderName && !folders[folderName]) {
        folders[folderName] = [];  // メモ用の空配列を追加
        saveData();
        renderFolders();
    } else if (folders[folderName]) {
        alert("既に同じ名前のフォルダが存在します。");
    }
});

// メモ追加
newMemoBtn.addEventListener("click", () => {
    if (!currentFolder) {
        alert("メモを追加するフォルダを選択してください。");
        return;
    }

    const memoTitle = prompt("メモのタイトルを入力:");
    const memoContent = prompt("メモの内容を入力:");
    
    if (memoTitle && memoContent) {
        folders[currentFolder].push({ title: memoTitle, content: memoContent });
        saveData();
        renderMemos();
    }
});

// フォルダの表示
function renderFolders() {
    folderList.innerHTML = "";
    for (let folder in folders) {
        const folderDiv = document.createElement("div");
        folderDiv.className = "folder-item";

        const folderNameSpan = document.createElement("span");
        folderNameSpan.textContent = folder;
        folderNameSpan.onclick = () => {
            currentFolder = folder;
            renderMemos();
        };

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✏️";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            const newName = prompt("新しいフォルダ名を入力:", folder);
            if (newName && newName !== folder) {
                folders[newName] = folders[folder];
                delete folders[folder];
                saveData();
                renderFolders();
                if (currentFolder === folder) {
                    currentFolder = newName;
                    renderMemos();
                }
            }
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "🗑️";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm("本当に削除しますか？")) {
                delete folders[folder];
                saveData();
                renderFolders();
                if (currentFolder === folder) {
                    currentFolder = null;
                    memoList.innerHTML = "";
                }
            }
        };

        folderDiv.appendChild(folderNameSpan);
        folderDiv.appendChild(editBtn);
        folderDiv.appendChild(deleteBtn);
        folderList.appendChild(folderDiv);
    }
}

// メモの表示
function renderMemos() {
    memoList.innerHTML = "";
    if (currentFolder && folders[currentFolder].length > 0) {
        folders[currentFolder].forEach((memo, index) => {
            const memoDiv = document.createElement("div");
            memoDiv.className = "memo-item";

            const memoTitleSpan = document.createElement("span");
            memoTitleSpan.textContent = memo.title;
            memoTitleSpan.onclick = () => alert(`内容: ${memo.content}`);

            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "✏️";
            editBtn.onclick = () => {
                const newTitle = prompt("新しいメモのタイトル:", memo.title);
                const newContent = prompt("新しいメモの内容:", memo.content);
                if (newTitle && newContent) {
                    folders[currentFolder][index] = { title: newTitle, content: newContent };
                    saveData();
                    renderMemos();
                }
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "🗑️";
            deleteBtn.onclick = () => {
                if (confirm("本当に削除しますか？")) {
                    folders[currentFolder].splice(index, 1);
                    saveData();
                    renderMemos();
                }
            };

            memoDiv.appendChild(memoTitleSpan);
            memoDiv.appendChild(editBtn);
            memoDiv.appendChild(deleteBtn);
            memoList.appendChild(memoDiv);
        });
    } else {
        memoList.innerHTML = "<p>メモがありません。</p>";
    }
}

// データ保存
function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

// データ読み込み
function loadData() {
    renderFolders();
}
