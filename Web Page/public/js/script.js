document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileTable = document.querySelector('#data-table tbody'); // Ensure correct selection

    // Highlight drop zone on dragover
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Remove highlight on dragleave
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // Handle click to open file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Handle file input change
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    const handleFiles = (files) => {
        if (files.length > 0) {
            const file = files[0];
            const allowedFormats = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

            if (allowedFormats.includes(file.type)) {
                fileInfo.innerHTML = `
            <p><strong>File Name:</strong> ${file.name}</p>
            <p><strong>File Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
          `;
                uploadFile(file);
            } else {
                fileInfo.innerHTML = `<p style="color: red;">Invalid file format. Only CSV and XLSX files are allowed.</p>`;
            }
        } else {
            fileInfo.innerHTML = `<p style="color: red;">No file selected.</p>`;
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', { // Match server's endpoint
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.items) {
                updateTable(data.items); // Update table with the file data
            } else {
                alert(data.message || 'Failed to upload or process the file.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload file. Please try again.');
        }
    };

    const updateTable = (items) => {
        // Check if the fileTable exists to avoid errors
        if (!fileTable) {
            console.error('Table body not found!');
            return;
        }

        // Clear existing table rows (including header row if already present)
        fileTable.innerHTML = '';

        // Check if there is any data
        if (items.length === 0) {
            fileTable.innerHTML = '<tr><td colspan="100%">No data available to display.</td></tr>';
            return;
        }

        // Create header row (only once)
        const headerRow = document.createElement('tr');
        Object.keys(items[0]).forEach((key) => {
            const headerCell = document.createElement('th');
            headerCell.textContent = key; // Use the keys from the first data object as headers
            headerRow.appendChild(headerCell);
        });
        fileTable.appendChild(headerRow);

        // Add new rows based on the first 10 rows of the uploaded file data
        items.forEach((item) => {
            const row = document.createElement('tr');
            Object.values(item).forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value || 'N/A'; // Handle empty or missing values
                row.appendChild(cell);
            });
            fileTable.appendChild(row);
        });
    };


});
