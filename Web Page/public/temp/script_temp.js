document.getElementById("csvFileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Please select a CSV file!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;

        // Parse CSV content
        Papa.parse(content, {
            header: true, // Set to false if the CSV doesn't have headers
            skipEmptyLines: true,
            complete: function (results) {
                const data = results.data;
                const n = 5; // Number of lines to display
                renderTable(data.slice(0, n));
            },
        });
    };
    reader.readAsText(file);
});

function renderTable(data) {
    const table = document.getElementById("csvTable");
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = "<tr><td>No data found</td></tr>";
        return;
    }

    // Create table header
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    data.forEach(row => {
        const rowElement = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            td.textContent = row[header] || ""; // Handle empty cells
            rowElement.appendChild(td);
        });
        table.appendChild(rowElement);
    });
}const express = require("express");
const multer = require("multer");
const app = express();
const PORT = 3000;

// Middleware for serving static files
app.use(express.static("public"));

// Multer setup for file uploads (optional, for full file uploads)
const upload = multer({ dest: "uploads/" });

app.post("/preview", upload.single("csvFile"), (req, res) => {
    const filePath = req.file.path;
    const fs = require("fs");
    const readline = require("readline");

    const lines = [];
    const n = 5; // Number of lines to read

    // Read the file line by line
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        terminal: false,
    });

    rl.on("line", (line) => {
        if (lines.length < n) {
            lines.push(line);
        } else {
            rl.close();
        }
    });

    rl.on("close", () => {
        // Respond with the first n lines
        res.json({ lines });
        // Optionally delete the uploaded file
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", err);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

