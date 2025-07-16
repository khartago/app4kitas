const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sanitizeText, sanitizeFileName, detectMalware } = require('../utils/sanitizer');

// Add a new note for a child
const addNote = async (req, res) => {
  try {
    const { childId, content } = req.body;
    const educatorId = req.user.id;

    // Validate input
    if (!childId || !content) {
      return res.status(400).json({ error: 'Kind-ID und Inhalt sind erforderlich' });
    }

    // Check if child exists and educator has access
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        group: {
          educators: {
            some: {
              id: educatorId
            }
          }
        }
      },
      include: { parents: true }
    });

    if (!child) {
      return res.status(404).json({ error: 'Kind nicht gefunden oder kein Zugriff' });
    }

    // Check if child has consent (manual or parent app consent)
    const { childHasConsent } = require('./childController');
    const hasConsent = await childHasConsent(childId);
    if (!hasConsent) {
      return res.status(403).json({ error: 'Notiz nicht erlaubt: Einwilligung für sensitive Datenverarbeitung erforderlich (DSGVO Art. 6).' });
    }

    // Check for malware in uploaded file
    if (req.file && detectMalware(req.file.buffer, req.file.filename)) {
      return res.status(400).json({
        success: false,
        message: 'Suspicious file content detected. Upload rejected for security reasons.'
      });
    }

    // Create note with sanitized content
    const note = await prisma.note.create({
      data: {
        content: sanitizeText(content), // Sanitize content to prevent XSS
        childId,
        educatorId,
        attachmentUrl: req.file ? `/uploads/${sanitizeFileName(req.file.filename)}` : null,
        attachmentName: req.file ? sanitizeFileName(req.file.originalname) : null,
        attachmentType: req.file ? req.file.mimetype : null
      },
      include: {
        educator: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Notiz erfolgreich erstellt',
      note: {
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        educatorId: note.educatorId,
        educatorName: note.educator.name,
        childId: note.childId,
        attachmentUrl: note.attachmentUrl,
        attachmentName: note.attachmentName,
        attachmentType: note.attachmentType
      }
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Notiz' });
  }
};

// Get all notes for a specific child
const getNotesByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const educatorId = req.user.id;

    // Check if educator has access to this child
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        group: {
          educators: {
            some: {
              id: educatorId
            }
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Kind nicht gefunden oder kein Zugriff' });
    }

    // Get notes
    const notes = await prisma.note.findMany({
      where: {
        childId
      },
      include: {
        educator: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedNotes = notes.map(note => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      educatorId: note.educatorId,
      educatorName: note.educator.name,
      childId: note.childId,
      attachmentUrl: note.attachmentUrl,
      attachmentName: note.attachmentName,
      attachmentType: note.attachmentType
    }));

    res.json(formattedNotes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Notizen' });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const educatorId = req.user.id;

    // Validate input
    if (!content) {
      return res.status(400).json({ error: 'Inhalt ist erforderlich' });
    }

    // Check if note exists and educator owns it
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        educatorId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Notiz nicht gefunden oder kein Zugriff' });
    }

    // Check for malware in uploaded file
    if (req.file && detectMalware(req.file.buffer, req.file.filename)) {
      return res.status(400).json({
        success: false,
        message: 'Suspicious file content detected. Upload rejected for security reasons.'
      });
    }

    // Update note
    const updatedNote = await prisma.note.update({
      where: {
        id: noteId
      },
      data: {
        content: sanitizeText(content), // Sanitize content to prevent XSS
        attachmentUrl: req.file ? `/uploads/${sanitizeFileName(req.file.filename)}` : note.attachmentUrl,
        attachmentName: req.file ? sanitizeFileName(req.file.originalname) : note.attachmentName,
        attachmentType: req.file ? req.file.mimetype : note.attachmentType
      },
      include: {
        educator: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Notiz erfolgreich aktualisiert',
      note: {
        id: updatedNote.id,
        content: updatedNote.content,
        createdAt: updatedNote.createdAt,
        educatorId: updatedNote.educatorId,
        educatorName: updatedNote.educator.name,
        childId: updatedNote.childId,
        attachmentUrl: updatedNote.attachmentUrl,
        attachmentName: updatedNote.attachmentName,
        attachmentType: updatedNote.attachmentType
      }
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Notiz' });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const educatorId = req.user.id;

    // Check if note exists and educator owns it
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        educatorId
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Notiz nicht gefunden oder kein Zugriff' });
    }

    // Delete note
    await prisma.note.delete({
      where: {
        id: noteId
      }
    });

    res.json({ message: 'Notiz erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Notiz' });
  }
};

module.exports = {
  addNote,
  getNotesByChild,
  updateNote,
  deleteNote
}; 