const fileInput = document.getElementById('pdfs');
const dropArea = document.getElementById('drop-area');
const fileListDisplay = document.getElementById('fileList');
const mergeForm = document.getElementById('mergeForm');
const toast = document.getElementById('toast');

let selectedFiles = [];

dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.backgroundColor = "#e0f0ff";
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.backgroundColor = "";
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.backgroundColor = "";
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
    for (let file of files) {
        if (file.type === 'application/pdf' && !selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
        }
    }
    updateFileList();
}

function updateFileList() {
    fileListDisplay.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.addEventListener('click', () => {
            selectedFiles.splice(index, 1);
            updateFileList();
        });
        fileListDisplay.appendChild(li);
    });
}

mergeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
        alert("Please upload at least one PDF.");
        return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('pdfs', file));

    toast.classList.add('show');

    fetch('/merge', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) return response.text().then(msg => { throw new Error(msg); });
        return response.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
    })
    .catch(error => {
        alert("❌ " + error.message);
        console.error(error);
    })
    .finally(() => {
        toast.classList.remove('show');
    });
});
