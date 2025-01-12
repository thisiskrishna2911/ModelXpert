import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import ejsMate from "ejs-mate";
import { fileURLToPath } from 'url';
// import fs from 'fs';
import { open } from 'node:fs/promises';
// import requ
const app = express();
const upload = multer({ dest: 'uploads/' }); // Folder to store uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from the 'public' folder
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views')); // Set the directory for EJS templates
app.use(cors()); // Allow cross-origin requests
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));

// Render the upload page
app.get('/', async(req, res) => {
    // console.log(__dirname+"/uploads/f1.txt")
    // let data = await fs.readFile(__dirname+"/uploads/f1.txt")
    const file = await open(__dirname+"/uploads/f1.txt");

  for await (const line of file.readLines()) {
    // console.log(line);
    let data_var =data_var + line;
  }
  console.log(data_var)
    // console.log(data.toString())
    res.render('index.ejs', { title: 'ModelXpert File Upload' , _data: data_var});

});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
console.log(file)
    // Validate file type
    const allowedFormats = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file format' });
    }

    res.status(200).json({
        message: 'File uploaded successfully',
        fileName: file.originalname,
        fileSize: file.size,
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// app.listen(3000)