const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getGroup, createGroup, updateGroup, deleteGroup, assignEducators, getEducatorGroups, getGroupChildren, getTodaysChildren } = require('../controllers/groupController');
const { authMiddleware } = require('../middlewares/auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Parser } = require('json2csv');
const { generatePDFExport, createInfoLines } = require('../utils/pdfHelper');

const prisma = new PrismaClient();

// List all groups
router.get('/groups', authMiddleware, async (req, res) => {
  // Only ADMIN and SUPER_ADMIN can list all groups
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  try {
    const where = {};
    if (req.user.role === 'ADMIN') {
      where.institutionId = req.user.institutionId;
    }
    const groups = await prisma.group.findMany({
      where,
      include: {
        educators: true,
        children: true
      }
    });
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Gruppen.' });
  }
});

// Export groups (CSV/PDF)
router.get('/groups/export', authMiddleware, async (req, res) => {
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
    const groups = await prisma.group.findMany({
      where,
      include: {
        educators: true,
        children: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (format === 'csv') {
      const csvData = groups.map(group => ({
        Name: group.name,
        Erzieher: group.educators?.map(e => e.name).join('; ') || 'Keine Erzieher',
        'Anzahl Kinder': group.children?.length || 0,
        'Erstellt am': new Date(group.createdAt).toLocaleDateString('de-DE')
      }));

      const parser = new Parser({
        fields: ['Name', 'Erzieher', 'Anzahl Kinder', 'Erstellt am'],
        delimiter: ';',
        quote: '"',
        header: true
      });

      const csv = parser.parse(csvData);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="gruppen-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: groups.map(group => ({
          ...group,
          erzieher: group.educators?.map(e => e.name).join('; ') || 'Keine Erzieher',
          kinder: group.children?.length || 0,
          erstelltAm: new Date(group.createdAt).toLocaleDateString('de-DE')
        })),
        headers: ['Name', 'Erzieher', 'Kinder', 'Erstellt am'],
        columns: ['name', 'erzieher', 'kinder', 'erstelltAm'],
        colWidths: [120, 180, 80, 80],
        title: 'Gruppen Export',
        info: createInfoLines(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`),
        headerColor: [0.16, 0.67, 0.38],
        filename: `gruppen-${new Date().toISOString().split('T')[0]}.pdf`
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="gruppen-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.end(Buffer.from(pdfBytes));
    } else {
      res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Gruppen.' });
  }
});

router.get('/groups/:id', authMiddleware, getGroup);
router.post('/groups', authMiddleware, createGroup);
router.put('/groups/:id', authMiddleware, updateGroup);
router.delete('/groups/:id', authMiddleware, deleteGroup);
router.put('/groups/:id/educators', authMiddleware, assignEducators);

// Educator-specific routes
router.get('/educators/:educatorId/groups', authMiddleware, getEducatorGroups);
router.get('/educators/:educatorId/children', authMiddleware, async (req, res) => {
  try {
    const { educatorId } = req.params;
    
    // Get the educator's group
    const educator = await prisma.user.findUnique({
      where: { id: educatorId },
      include: {
        groups: {
          include: {
            children: {
              include: {
                parents: true
              }
            }
          }
        }
      }
    });
    
    if (!educator || educator.role !== 'EDUCATOR') {
      return res.status(404).json({ error: 'Erzieher nicht gefunden.' });
    }
    
    // Return children from all groups the educator is assigned to
    const children = educator.groups.flatMap(group => group.children);
    res.json({ children });
  } catch (err) {
    console.error('Error fetching educator children:', err);
    res.status(500).json({ error: 'Fehler beim Laden der zugewiesenen Kinder.' });
  }
});
router.get('/groups/:groupId/children', authMiddleware, getGroupChildren);
router.get('/groups/:groupId/children/today', authMiddleware, getTodaysChildren);

module.exports = router; 