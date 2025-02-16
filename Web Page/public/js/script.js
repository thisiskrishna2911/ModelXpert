document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const fileInfo = document.getElementById("file-info");
    const fileTable = document.querySelector("#data-table tbody");
    const manualSection = document.getElementById("manual-section");
    const labelSelect = document.getElementById("label-select");
    const allFeaturesPool = document.getElementById("all-features-pool");
    const selectedFeaturesPool = document.getElementById("selected-features-pool");
    const preprocessBtn = document.getElementById("preprocess-btn");
    const trainModelSection = document.getElementById("train-model-section");

    let uploadedFilePath = ""; // Variable to store the uploaded file path
    manualSection.style.display = "none"; // Hide manual section initially


    //modelxpert backgroun effect
    VANTA.NET({
        el: ".page1",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 700.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x4d6cde,
        backgroundColor: 0x20204
    })

    //Animation
    var tl = gsap.timeline()

    tl.from(".nav_logo, .nav_items .nav_link, .button", {
        y: -30,
        opacity: 0,
        delay: 1,
        duration: 1.5,
        stagger: 0.15
    })

    function breakThetext() {
        var h1 = document.querySelector(".mx")

        var h1text = h1.textContent

        var splitedtext = h1text.split("");
        var halfvalue = Math.floor(splitedtext.length / 2)

        var clutter = "";

        splitedtext.forEach(function (elem, idx) {
            if (idx < halfvalue) {
                // clutter = clutter + elem
                clutter += `<span class="a">${elem}</span>`
            } else {
                clutter += `<span class="b">${elem}</span>`
            }

        })

        h1.innerHTML = clutter
    }

    breakThetext();

    gsap.from(".a", {
        y: 80,
        opacity: 0,
        duration: 1,
        delay: 1,
        stagger: 0.15,
    })

    gsap.from(".b", {
        y: 80,
        opacity: 0,
        duration: 1,
        delay: 1,
        stagger: -0.15
    })



    var page1content = document.querySelector(".page1-content");
    var cursor = document.querySelector(".cursor");
    var cursorScaleElements = document.querySelectorAll(".nav_items a,.nav_logo, .button, .mx");

    // Cursor movement
    page1content.addEventListener("mousemove", function (dets) {
        gsap.to(cursor, {
            x: dets.x,
            y: dets.y,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Cursor visibility when entering/leaving the page
    page1content.addEventListener("mouseenter", function () {
        gsap.to(cursor, { scale: 1, opacity: 1 });
    });

    page1content.addEventListener("mouseleave", function () {
        gsap.to(cursor, { scale: 0, opacity: 0 });
    });

    // Increase cursor size and change color when hovering over elements
    cursorScaleElements.forEach((element) => {
        element.addEventListener("mouseenter", function () {
            gsap.to(cursor, {
                scale: 3, // Increase size
                backgroundColor: "white", // Change background color
                borderColor: "transparent", // Hide border
                mixBlendMode: "difference",
                duration: 0.3
            });
        });

        element.addEventListener("mouseleave", function () {
            gsap.to(cursor, {
                scale: 1, // Reset size
                backgroundColor: "transparent", // Reset background
                borderColor: "#fff",
                mixBlendMode: "difference", // Restore border
                duration: 0.3
            });
        });
    });






    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        handleFiles(e.dataTransfer.files);
    });

    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

    // Handle File Upload
    const handleFiles = (files) => {
        if (files.length > 0) {
            const file = files[0];
            const allowedFormats = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

            if (allowedFormats.includes(file.type)) {
                fileInfo.innerHTML = `<p><strong>File Name:</strong> ${file.name}</p>`;
                uploadFile(file);
            } else {
                fileInfo.innerHTML = `<p style="color: red;">Invalid file format. Only CSV/XLSX allowed.</p>`;
            }
        }
    };

    // Upload File and Fetch Data
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("✅ Server Response:", data);

            if (response.ok && data.items) {
                updateTable(data.items);
                setupFeatureSelection(data.items);
                uploadedFilePath = data.filePath; // Store the uploaded file path
            } else {
                alert(data.message || "Failed to upload or process the file.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to upload file. Please try again.");
        }
    };

    // Update Table After Upload
    const updateTable = (items) => {
        if (!fileTable) return;
        fileTable.innerHTML = "";

        if (items.length === 0) {
            fileTable.innerHTML = '<tr><td colspan="100%">No data available.</td></tr>';
            return;
        }

        // Create header row
        const headerRow = document.createElement("tr");
        Object.keys(items[0]).forEach((key) => {
            const headerCell = document.createElement("th");
            headerCell.textContent = key;
            headerRow.appendChild(headerCell);
        });
        fileTable.appendChild(headerRow);

        // Add table rows
        items.forEach((item) => {
            const row = document.createElement("tr");
            Object.values(item).forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value || "N/A";
                row.appendChild(cell);
            });
            fileTable.appendChild(row);
        });
    };

    // Setup Feature Selection After Upload
    const setupFeatureSelection = (items) => {
        if (!items || items.length === 0) {
            console.error("❌ No items received for feature selection.");
            return;
        }

        const columns = Object.keys(items[0]);
        console.log("✅ Extracted Columns:", columns);

        if (columns.length === 0) {
            console.error("❌ No columns detected from uploaded file.");
            return;
        }

        // Populate Label Dropdown
        labelSelect.innerHTML = '<option value="" disabled selected>Select a label</option>';
        columns.forEach((col) => {
            const option = document.createElement("option");
            option.value = col;
            option.textContent = col;
            labelSelect.appendChild(option);
        });

        // Show manual section only when selected
        manualSection.style.display = "none";
        document.querySelector('input[name="preprocess"][value="manual"]').addEventListener("click", () => {
            console.log("✅ Manual preprocessing selected.");
            manualSection.style.display = "block";
        });
    };

    // Populate Feature Pools When Label is Selected
    function populateFeaturePools() {
        const selectedLabel = labelSelect.value;
        allFeaturesPool.innerHTML = "";
        selectedFeaturesPool.innerHTML = "";

        if (!selectedLabel) {
            console.error("❌ No label selected.");
            return;
        }

        const columns = Array.from(labelSelect.options).map(option => option.value);
        console.log("✅ Available Columns for Features:", columns);

        columns.slice(1).forEach((col) => { // Start from the second element
            if (col !== selectedLabel) {
                addFeatureToPool(allFeaturesPool, col, true);
            }
        });
    }

    // Add Feature to Pool
    function addFeatureToPool(pool, feature, clickable) {
        const li = document.createElement("li");
        li.textContent = feature;
        li.dataset.feature = feature;

        if (clickable) {
            li.onclick = () => moveToSelectedFeatures(feature);
            li.style.cursor = "pointer";
            li.style.background = "#007bff";
            li.style.color = "white";
            li.style.padding = "5px";
            li.style.margin = "3px 0";
            li.style.borderRadius = "5px";
        } else {
            const removeBtn = document.createElement("span");
            removeBtn.textContent = " ❌";
            removeBtn.style.color = "red";
            removeBtn.style.cursor = "pointer";
            removeBtn.style.marginLeft = "10px";
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                moveToAllFeatures(feature);
            };
            li.appendChild(removeBtn);
        }

        pool.appendChild(li);
    }

    // Move Feature from All Features to Selected Features
    function moveToSelectedFeatures(feature) {
        Array.from(allFeaturesPool.children).forEach((li) => {
            if (li.dataset.feature === feature) allFeaturesPool.removeChild(li);
        });
        addFeatureToPool(selectedFeaturesPool, feature, false);
    }

    // Move Feature from Selected Features to All Features
    function moveToAllFeatures(feature) {
        Array.from(selectedFeaturesPool.children).forEach((li) => {
            if (li.dataset.feature === feature) selectedFeaturesPool.removeChild(li);
        });
        addFeatureToPool(allFeaturesPool, feature, true);
    }

    // Listen for Label Selection Changes
    labelSelect.addEventListener("change", populateFeaturePools);

    // Show Preprocess Button Only When Features & Label Are Selected
    function updatePreprocessButtonVisibility() {
        const label = document.getElementById("label-select").value;
        const selectedFeatures = document.getElementById("selected-features-pool").children;

        preprocessBtn.style.display = (label && selectedFeatures.length > 0) ? "block" : "none";
    }

    // Listen for changes in feature selection
    document.getElementById("label-select").addEventListener("change", updatePreprocessButtonVisibility);
    document.getElementById("selected-features-pool").addEventListener("DOMSubtreeModified", updatePreprocessButtonVisibility);

    // Preprocess Data
    async function preprocessData() {

        const label = document.getElementById("label-select").value;
        const selectedFeatures = Array.from(document.getElementById("selected-features-pool").children).map(li => li.textContent.replace(" ❌", ""));
        const fillNull = document.getElementById("fill-null").value;
        const scaleData = document.getElementById("scale-data").value;
        const applyPCA = document.getElementById("apply-pca").value;
        const nComponents = document.getElementById("n-components").value || "None";
        // Log the selected label and features for debugging
        console.log("Selected Label:", label);
        console.log("Selected Features:", selectedFeatures);
        console.log("Uploaded File Path:", uploadedFilePath);
        if (!label || selectedFeatures.length === 0 || !uploadedFilePath) {
            alert("Please select a label and at least one feature before preprocessing.");
            return;
        }

        try {
            const response = await fetch("/preprocess", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath: uploadedFilePath, label, selectedFeatures, fillNull, scaleData, applyPCA, nComponents })
            });

            const data = await response.json();
            if (response.ok) {
                alert("✅ Preprocessing successful! You can now train the model.");
                trainModelSection.style.display = "block";  // Show Train Model Section
            } else {
                alert("❌ Error during preprocessing.");
            }

        } catch (error) {
            console.error("Error:", error);
        }
    }

    preprocessBtn.addEventListener("click", preprocessData);
});