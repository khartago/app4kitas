const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middlewares/auth');
const bcrypt = require('bcryptjs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Parser } = require('json2csv');
const { generatePDFExport, createInfoLines } = require('../utils/pdfHelper');

const prisma = new PrismaClient();

// List all users, optionally filtered by role
router.get('/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  const { role } = req.query;
  try {
    const where = {
      deletedAt: null // Exclude soft-deleted users
    };
    if (role) where.role = role;
    if ((role === 'EDUCATOR' || role === 'PARENT') && req.user.role === 'ADMIN') {
      where.institutionId = req.user.institutionId;
    }
    const users = await prisma.user.findMany({ where });
    
    // Return proper structure for educators
    if (role === 'EDUCATOR') {
      res.json({ educators: users });
    } else if (role === 'PARENT') {
      res.json({ users });
    } else {
      res.json({ users });
    }
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Nutzer.' });
  }
});

// Get specific user by ID
router.get('/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ 
      where: { 
        id,
        deletedAt: null // Exclude soft-deleted users
      } 
    });
    if (!user) {
      return res.status(404).json({ error: 'Nutzer nicht gefunden.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden des Nutzers.' });
  }
});

// Update user
router.put('/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, password, institutionId } = req.body;
  
  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (institutionId !== undefined) updateData.institutionId = institutionId;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, institutionId: true }
    });
    
    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Nutzer nicht gefunden.' });
    } else {
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Nutzers.' });
    }
  }
});

// Delete user
router.delete('/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  // Only SUPER_ADMIN can delete users
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung zum Löschen von Nutzern.' });
  }
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Nutzer nicht gefunden.' });
    }
    
    // Check if user is already soft-deleted
    if (user.deletedAt) {
      return res.status(400).json({ error: 'Nutzer ist bereits zur Löschung markiert.' });
    }
    
    // Prevent deleting SUPER_ADMIN users
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'SUPER_ADMIN Nutzer können nicht gelöscht werden.' });
    }
    
    // Soft delete the user
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    res.json({ success: true, message: 'Nutzer zur Löschung markiert.' });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Nutzer nicht gefunden.' });
    } else {
      res.status(500).json({ error: 'Fehler beim Löschen des Nutzers.' });
    }
  }
});

// Export educators (CSV/PDF)
router.get('/educators/export', authMiddleware, async (req, res) => {
  const { format = 'csv' } = req.query;
  const user = req.user;
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung für Export' });
  }

  try {
    const educators = await prisma.user.findMany({
      where: { 
        role: 'EDUCATOR',
        deletedAt: null // Exclude soft-deleted users
      },
      include: {
        groups: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (format === 'csv') {
      const csvData = educators.map(educator => ({
        Name: educator.name,
        'E-Mail': educator.email,
        Gruppen: educator.groups?.map(g => g.name).join('; ') || 'Keine Gruppen',
        'Erstellt am': new Date(educator.createdAt).toLocaleDateString('de-DE')
      }));
      const parser = new Parser({
        fields: ['Name', 'E-Mail', 'Gruppen', 'Erstellt am'],
        delimiter: ';',
        quote: '"',
        header: true
      });
      const csv = parser.parse(csvData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="erzieher-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: educators.map(educator => ({
          ...educator,
          gruppen: educator.groups?.map(g => g.name).join('; ') || 'Keine Gruppen',
          erstelltAm: new Date(educator.createdAt).toLocaleDateString('de-DE')
        })),
        headers: ['Name', 'E-Mail', 'Gruppen', 'Erstellt am'],
        columns: ['name', 'email', 'gruppen', 'erstelltAm'],
        colWidths: [120, 180, 180, 80],
        title: 'Erzieher Export',
        info: createInfoLines(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`),
        headerColor: [0.90, 0.23, 0.23],
        filename: `erzieher-${new Date().toISOString().split('T')[0]}.pdf`
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="erzieher-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    } else {
      res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Erzieher.' });
  }
});

// Export parents (CSV/PDF)
router.get('/parents/export', authMiddleware, async (req, res) => {
  const { format = 'csv' } = req.query;
  const user = req.user;
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung für Export' });
  }

  try {
    const parents = await prisma.user.findMany({
      where: { 
        role: 'PARENT',
        deletedAt: null // Exclude soft-deleted users
      },
      include: {
        children: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (format === 'csv') {
      const csvData = parents.map(parent => ({
        Name: parent.name,
        'E-Mail': parent.email,
        Kinder: parent.children?.map(c => c.name).join('; ') || 'Keine Kinder',
        'Erstellt am': new Date(parent.createdAt).toLocaleDateString('de-DE')
      }));
      const parser = new Parser({
        fields: ['Name', 'E-Mail', 'Kinder', 'Erstellt am'],
        delimiter: ';',
        quote: '"',
        header: true
      });
      const csv = parser.parse(csvData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="eltern-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: parents.map(parent => ({
          ...parent,
          kinder: parent.children?.map(c => c.name).join(', ') || 'Keine Kinder',
          erstelltAm: new Date(parent.createdAt).toLocaleDateString('de-DE')
        })),
        headers: ['Name', 'E-Mail', 'Kinder', 'Erstellt am'],
        columns: ['name', 'email', 'kinder', 'erstelltAm'],
        colWidths: [120, 150, 150, 100],
        title: 'Elternliste',
        info: createInfoLines(`Gesamtanzahl Eltern: ${parents.length}`),
        headerColor: [0.52, 0.73, 0.40],
        filename: `eltern-${new Date().toISOString().split('T')[0]}.pdf`
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="eltern-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    } else {
      res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Eltern.' });
  }
});

module.exports = router; 