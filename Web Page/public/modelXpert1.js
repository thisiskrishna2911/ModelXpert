const formOpenBtn = document.querySelector("#form-open"),
    home = document.querySelector(".home"),
    formContainer = document.querySelector(".form_container"),
    formCloseBtn = document.querySelector(".form_close"),
    signupBtn = document.querySelector("#signup"),
    loginBtn = document.querySelector("#login"),
    pwShowHide = document.querySelectorAll(".pw_hide");

formOpenBtn.addEventListener("click", () => home.classList.add("show"));
formCloseBtn.addEventListener("click", () => home.classList.remove("show"));

pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
        let getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.classList.replace("uil-eye-slash", "uil-eye");
        } else {
            getPwInput.type = "password";
            icon.classList.replace("uil-eye", "uil-eye-slash");
        }
    });
});

signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.add("active");
});
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.remove("active");
});

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');

    // Highlight drop zone on dragover
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Remove highlight on dragleave
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // Handle click to open file dialog
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
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
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Failed to upload file.');
            });
    }
});

const columns = ["Column1", "Column2", "Column3", "Column4", "Column5"];
const labelSelect = document.getElementById("label-select");
const allFeaturesPool = document.getElementById("all-features-pool");
const selectedFeaturesPool = document.getElementById("selected-features-pool");

// Toggle Manual Section
function toggleManualSection(show) {
    document.getElementById("manual-section").style.display = show
        ? "block"
        : "none";
    if (show) populateLabelOptions();
}

// Populate label dropdown with column names
function populateLabelOptions() {
    labelSelect.innerHTML =
        '<option value="" disabled selected>Select a label</option>';
    columns.forEach((col) => {
        const option = document.createElement("option");
        option.value = col;
        option.textContent = col;
        labelSelect.appendChild(option);
    });
}

// Populate All Features and Selected Features Pools
function populateFeaturePools() {
    const selectedLabel = labelSelect.value;
    allFeaturesPool.innerHTML = ""; // Clear All Features Pool
    selectedFeaturesPool.innerHTML = ""; // Clear Selected Features Pool

    columns
        .filter((col) => col !== selectedLabel) // Exclude selected label
        .forEach((col) => {
            addFeatureToPool(allFeaturesPool, col, true); // Add to All Features Pool
        });
}

// Add feature to a specific pool (All Features or Selected Features)
function addFeatureToPool(pool, feature, clickable) {
    const li = document.createElement("li");
    li.textContent = feature;

    if (clickable) {
        li.onclick = () => moveToSelectedFeatures(feature);
        li.style.cursor = "pointer";
        li.style.color = "#007bff";
    } else {
        const cancelButton = document.createElement("span");
        cancelButton.textContent = " X";
        cancelButton.style.color = "red";
        cancelButton.style.cursor = "pointer";
        cancelButton.onclick = (e) => {
            e.stopPropagation(); // Prevent parent click event
            moveToAllFeatures(feature);
        };
        li.appendChild(cancelButton);
    }

    pool.appendChild(li);
}

// Move feature from All Features to Selected Features
function moveToSelectedFeatures(feature) {
    // Remove from All Features Pool
    Array.from(allFeaturesPool.children).forEach((li) => {
        if (li.textContent === feature) allFeaturesPool.removeChild(li);
    });

    // Add to Selected Features Pool
    addFeatureToPool(selectedFeaturesPool, feature, false);
}

// Move feature from Selected Features to All Features
function moveToAllFeatures(feature) {
    // Remove from Selected Features Pool
    Array.from(selectedFeaturesPool.children).forEach((li) => {
        if (li.textContent.startsWith(feature)) selectedFeaturesPool.removeChild(li);
    });

    // Add to All Features Pool
    addFeatureToPool(allFeaturesPool, feature, true);
}