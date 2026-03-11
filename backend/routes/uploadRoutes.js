const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// --- General Storage Configuration ---
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // Sanitize filename to prevent directory traversal
        const originalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(originalName)}`);
    }
});

// --- File Type Checkers ---
function checkImageFileType(file, cb) {
    const filetypes = /jpe?g|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (JPG, PNG)'), false);
    }
}

function checkPdfFileType(file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('PDF documents only!'), false);
    }
}

// --- Multer Middleware Instances ---
const uploadImage = multer({
    storage,
    fileFilter: (req, file, cb) => checkImageFileType(file, cb),
});

const uploadPdf = multer({
    storage,
    fileFilter: (req, file, cb) => checkPdfFileType(file, cb),
});

// --- Route Definitions ---

// @desc    Upload an image
// @route   POST /api/upload/image
router.post('/image', uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'File not uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
    res.status(200).send({
        message: 'Image uploaded successfully',
        path: filePath
    });
});

// @desc    Upload a PDF document
// @route   POST /api/upload/pdf
router.post('/pdf', uploadPdf.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'File not uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
    res.status(200).send({
        message: 'PDF uploaded successfully',
        path: filePath
    });
});

module.exports = router;
