import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import ejsMate from "ejs-mate";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { parse } from "csv-parse";
import xlsx from "xlsx";
import { spawn } from "child_process";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// ✅ Ensure uploads directory exists
async function createUploadsDir() {
    try {
        await fs.access(uploadsDir);
    } catch (error) {
        await fs.mkdir(uploadsDir);
    }
}
createUploadsDir();

// ✅ Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + "_" + file.originalname;
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

// ✅ Function to Read CSV Files
async function readCSV(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return new Promise((resolve, reject) => {
            parse(data, { columns: true, skip_empty_lines: true }, (err, output) => {
                if (err) reject("Error parsing CSV file");
                else resolve(output);
            });
        });
    } catch (error) {
        console.error("Error reading CSV file:", error);
        throw error;
    }
}

// ✅ Function to Read XLSX Files
async function readXLSX(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } catch (error) {
        console.error("Error reading XLSX file:", error);
        throw error;
    }
}

// ✅ Serve Home Page
app.get("/", async (req, res) => {
    try {
        res.render("index", { title: "ModelXpert File Upload", items: [], key_s: [] });
    } catch (error) {
        console.error("Error rendering page:", error);
        res.status(500).send("Error loading page");
    }
});

// ✅ File Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const allowedFormats = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({ message: "Invalid file format. Only CSV and XLSX files are allowed." });
    }

    try {
        let parsedData = [];
        if (file.mimetype === "text/csv") {
            parsedData = await readCSV(file.path);
        } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            parsedData = await readXLSX(file.path);
        }

        const key_s = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
        res.status(200).json({
            message: "File uploaded successfully",
            items: parsedData.slice(0, 10),
            key_s,
            filePath: file.path  // ✅ Send file path for preprocessing
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: "Error processing file" });
    }
});

// ✅ Preprocess Data API (Calls Python Script)
app.post("/preprocess", async (req, res) => {
    const { filePath, label, selectedFeatures, fillNull, scaleData, applyPCA, nComponents } = req.body;
    console.log("this is from python function");
    if (!filePath) {
        return res.status(400).json({ message: "No file provided for preprocessing" });
    }

    const pythonProcess = spawn("python", [
        "preprocessing_node.py",
        filePath,
        label,
        selectedFeatures.join(","),
        fillNull,
        scaleData,
        applyPCA,
        nComponents || "None"
    ]);

    let outputData = "";

    pythonProcess.stdout.on("data", (data) => {
        console.log(`Python Output: ${data}`);
        outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            res.status(200).json({ message: "Preprocessing successful", processedFile: "processed_data.csv", output: outputData });
        } else {
            res.status(500).json({ message: "Error during preprocessing" });
        }
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 8010;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
