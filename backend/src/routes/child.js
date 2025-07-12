const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getChild, createChild, updateChild, deleteChild, updateChildPhoto, getChildQRCode, regenerateChildQRCode } = require('../controllers/childController');
const { authMiddleware } = require('../middlewares/auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Parser } = require('json2csv');
const { generatePDFExport, createInfoLines } = require('../utils/pdfHelper');

const prisma = new PrismaClient();

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

// List all children
router.get('/children', authMiddleware, async (req, res) => {
  // Only ADMIN and SUPER_ADMIN can list all children
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  try {
    const where = {};
    if (req.user.role === 'ADMIN') {
      where.institutionId = req.user.institutionId;
    }
    const children = await prisma.child.findMany({
      where,
      include: {
        group: true,
        parents: true
      }
    });
    res.json({ children });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Kinder.' });
  }
});

// Export children (CSV/PDF)
router.get('/children/export', authMiddleware, async (req, res) => {
  const { format = 'csv' } = req.query;
  const user = req.user;
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung für Export' });
  }

  try {
    const where = {};
    if (user.role === 'ADMIN') {
      where.institutionId = user.institutionId;
    }
    const children = await prisma.child.findMany({
      where,
      include: {
        group: true,
        parents: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (format === 'csv') {
      const csvData = children.map(child => ({
        Name: child.name,
        Geburtsdatum: new Date(child.birthdate).toLocaleDateString('de-DE'),
        Gruppe: child.group?.name || 'Keine Gruppe',
        Eltern: child.parents?.map(p => p.name).join('; ') || 'Keine Eltern'
      }));
      const parser = new Parser({
        fields: ['Name', 'Geburtsdatum', 'Gruppe', 'Eltern'],
        delimiter: ';',
        quote: '"',
        header: true
      });
      const csv = parser.parse(csvData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="kinder-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: children.map(child => ({
          ...child,
          geburtsdatum: new Date(child.birthdate).toLocaleDateString('de-DE'),
          gruppe: child.group?.name || 'Keine Gruppe',
          eltern: child.parents?.map(p => p.name).join('; ') || 'Keine Eltern'
        })),
        headers: ['Name', 'Geburtsdatum', 'Gruppe', 'Eltern'],
        columns: ['name', 'geburtsdatum', 'gruppe', 'eltern'],
        colWidths: [120, 80, 100, 200],
        title: 'Kinder Export',
        info: createInfoLines(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`),
        headerColor: [0.20, 0.55, 0.74],
        filename: `kinder-${new Date().toISOString().split('T')[0]}.pdf`
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="kinder-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    } else {
      res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Kinder.' });
  }
});

router.get('/children/:id', authMiddleware, getChild);
router.post('/children', authMiddleware, createChild);
router.put('/children/:id', authMiddleware, updateChild);
router.delete('/children/:id', authMiddleware, deleteChild);
router.put('/children/:id/photo', authMiddleware, upload.single('photo'), updateChildPhoto);
router.get('/children/:id/qrcode', authMiddleware, getChildQRCode);
router.post('/children/:id/qrcode/regenerate', authMiddleware, regenerateChildQRCode);

module.exports = router; 