import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import ejsMate from 'ejs-mate';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { parse } from 'csv-parse';
import xlsx from 'xlsx';

const app = express();

// Define __dirname correctly for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');

// Set up multer storage to save files with the original name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get file extension
        const filename = file.originalname; // Use the original file name
        cb(null, filename); // Save with the original name
    }
});

const upload = multer({ storage: storage });

try {
    await fs.access(uploadsDir);
} catch (error) {
    await fs.mkdir(uploadsDir);
}

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);

async function readCSV(filePath) {
    const data = await fs.readFile(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
        parse(data, { columns: true, skip_empty_lines: true }, (err, output) => {
            if (err) reject('Error parsing CSV file');
            else resolve(output);
        });
    });
}

async function readXLSX(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
}

app.get('/', async (req, res) => {
    try {
        const items = []; // Replace with actual logic to fetch data
        const key_s = items.length > 0 ? Object.keys(items[0]) : [];
        res.render('index', { title: 'ModelXpert File Upload', items, key_s });
    } catch (error) {
        console.error('Error rendering page:', error);
        res.status(500).send('Error loading page');
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const allowedFormats = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file format. Only CSV and XLSX files are allowed.' });
    }

    try {
        let parsedData = [];
        if (file.mimetype === 'text/csv') {
            parsedData = await readCSV(file.path);
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            parsedData = await readXLSX(file.path);
        }

        // Send parsed data as a response
        const limitedData = parsedData.slice(0, 10);
        res.status(200).json({ message: 'File uploaded and parsed successfully', items: limitedData });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ message: 'Error processing file' });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
