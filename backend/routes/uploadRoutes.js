const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// --- Multer Storage Configuration ---
// We assume this script is run from the 'backend' directory
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // The destination is relative to the CWD (backend/)
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // Generate a unique filename: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// --- Multer Filter Configuration ---
function checkFileType(file, cb) {
    const filetypes = /jpe?g|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Только изображения (JPG, PNG)!'), false);
    }
}

// --- Initialize Multer Upload Middleware ---
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

// --- Route Definition ---
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Файл не был загружен');
    }
    
    // Send back the public URL of the uploaded file
    const filePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');

    res.status(200).send({
        message: 'Изображение успешно загружено',
        image: filePath
    });
});

module.exports = router;
