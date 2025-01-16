let folders = JSON.parse(localStorage.getItem('folders')) || [];

function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

function renderFolders() {
    const folderList = document.getElementById('folder-list');
    folderList.innerHTML = '';

    folders.forEach((folder, folderIndex) => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.innerHTML = `
            <strong ondblclick="editFolderName(${folderIndex})">${folder.name}</strong>
            <div class="actions">
                <button onclick="createNote(${folderIndex})">＋ メモ追加</button>
                <button onclick="moveFolder(${folderIndex})">↕ 移動</button>
                <button onclick="deleteFolder(${folderIndex})">🗑 削除</button>
            </div>
            <div>
                ${folder.notes.map((note, noteIndex) => `
                    <div class="note">
                        <strong ondblclick="editNoteTitle(${folderIndex}, ${noteIndex})">${note.title}</strong>
                        <p>${note.content}</p>
                        <div class="actions">
                            <button onclick="moveNote(${folderIndex}, ${noteIndex})">↕ 移動</button>
                            <button onclick="deleteNote(${folderIndex}, ${noteIndex})">🗑 削除</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        folderList.appendChild(folderDiv);
    });
}

function createFolder() {
    const name = prompt('フォルダ名を入力してください');
    if (name) {
        folders.push({ name, notes: [] });
        saveData();
        renderFolders();
    }
}

function editFolderName(index) {
    const newName = prompt('フォルダ名を変更してください', folders[index].name);
    if (newName) {
        folders[index].name = newName;
        saveData();
        renderFolders();
    }
}

function deleteFolder(index) {
    if (confirm('フォルダを削除しますか？')) {
        folders.splice(index, 1);
        saveData();
        renderFolders();
    }
}

function moveFolder(index) {
    const newIndex = prompt('移動先の位置を入力 (0〜' + (folders.length - 1) + ')');
    if (newIndex !== null) {
        const folder = folders.splice(index, 1)[0];
        folders.splice(newIndex, 0, folder);
        saveData();
        renderFolders();
    }
}

function createNote(folderIndex) {
    const title = prompt('メモの見出しを入力してください');
    const content = prompt('メモの内容を入力してください');
    if (title && content) {
        folders[folderIndex].notes.push({ title, content });
        saveData();
        renderFolders();
    }
}

function editNoteTitle(folderIndex, noteIndex) {
    const newTitle = prompt('メモの見出しを変更してください', folders[folderIndex].notes[noteIndex].title);
    if (newTitle) {
        folders[folderIndex].notes[noteIndex].title = newTitle;
        saveData();
        renderFolders();
    }
}

function deleteNote(folderIndex, noteIndex) {
    if (confirm('メモを削除しますか？')) {
        folders[folderIndex].notes.splice(noteIndex, 1);
        saveData();
        renderFolders();
    }
}

function moveNote(folderIndex, noteIndex) {
    const newIndex = prompt('移動先の位置を入力 (0〜' + (folders[folderIndex].notes.length - 1) + ')');
    if (newIndex !== null) {
        const note = folders[folderIndex].notes.splice(noteIndex, 1)[0];
        folders[folderIndex].notes.splice(newIndex, 0, note);
        saveData();
        renderFolders();
    }
}

renderFolders();
