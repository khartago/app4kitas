const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addNote, getNotesByChild, updateNote, deleteNote } = require('../controllers/noteController');
const { authMiddleware } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Add a new note for a child
router.post('/notes', authMiddleware, upload.single('file'), addNote);

// Get all notes for a specific child
router.get('/notes/child/:childId', authMiddleware, getNotesByChild);

// Update a note
router.put('/notes/:noteId', authMiddleware, upload.single('file'), updateNote);

// Delete a note
router.delete('/notes/:noteId', authMiddleware, deleteNote);

module.exports = router; 