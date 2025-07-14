const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const prisma = new PrismaClient();
const { requireRole } = require('../middlewares/auth');
const { generatePDFExport, createInfoLines } = require('../utils/pdfHelper');
const { logActivity } = require('../controllers/activityController');

// Alle Institutionen auflisten
router.get('/institutionen', requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const institutionen = await prisma.institution.findMany({
      include: {
        admins: true,
        groups: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(institutionen);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Institutionen.' });
  }
});

// Export institutions (CSV/PDF)
router.get('/institutionen/export', requireRole('SUPER_ADMIN'), async (req, res) => {
  const { format = 'csv' } = req.query;

  try {
    const institutionen = await prisma.institution.findMany({
      include: {
        admins: true,
        groups: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (format === 'csv') {
      const csvData = institutionen.map(institution => ({
        Name: institution.name,
        Adresse: institution.address || 'Keine Adresse',
        'Anzahl Admins': institution.admins?.length || 0,
        'Anzahl Gruppen': institution.groups?.length || 0,
        'Erstellt am': new Date(institution.createdAt).toLocaleDateString('de-DE')
      }));
      const parser = new Parser({
        fields: ['Name', 'Adresse', 'Anzahl Admins', 'Anzahl Gruppen', 'Erstellt am'],
        delimiter: ';',
        quote: '"',
        header: true
      });
      const csv = parser.parse(csvData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="institutionen-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: institutionen.map(inst => ({
          ...inst,
          admins: inst.admins?.map(a => a.name).join('; ') || 'Keine Admins',
          gruppen: inst.groups?.map(g => g.name).join('; ') || 'Keine Gruppen',
          erstelltAm: new Date(inst.createdAt).toLocaleDateString('de-DE')
        })),
        headers: ['Name', 'Adresse', 'Admins', 'Gruppen', 'Erstellt am'],
        columns: ['name', 'address', 'admins', 'gruppen', 'erstelltAm'],
        colWidths: [120, 180, 120, 120, 80],
        title: 'Institutionen Export',
        info: createInfoLines(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`),
        headerColor: [0.16, 0.67, 0.38],
        filename: `institutionen-${new Date().toISOString().split('T')[0]}.pdf`
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="institutionen-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    } else {
      res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Institutionen.' });
  }
});

// Neue Institution anlegen
router.post('/institutionen', requireRole('SUPER_ADMIN'), async (req, res) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Name ist erforderlich.' });
  try {
    const institution = await prisma.institution.create({
      data: { name, address },
    });
    // Create institution chat channel
    await prisma.chatChannel.create({
      data: {
        name: `${name} Chat`,
        type: 'INSTITUTION_CHAT',
        institutionId: institution.id,
        participants: {
          connect: [] // No users yet, will be added as users join
        }
      }
    });
    // Log activity
    await logActivity(
      req.user.id,
      'INSTITUTION_CREATED',
      'Institution',
      institution.id,
      `Created institution: ${name}`,
      institution.id,
      null
    );
    res.status(201).json(institution);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Erstellen der Institution.' });
  }
});

// Institution bearbeiten
router.put('/institutionen/:id', requireRole('SUPER_ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  try {
    const updated = await prisma.institution.update({
      where: { id },
      data: { name, address },
    });
    
    // Log activity
    await logActivity(
      req.user.id,
      'INSTITUTION_UPDATED',
      'Institution',
      updated.id,
      `Updated institution: ${updated.name}`,
      updated.id,
      null
    );
    
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: 'Institution nicht gefunden.' });
  }
});

// Institution löschen
router.delete('/institutionen/:id', requireRole('SUPER_ADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    // Get institution name before deletion for logging
    const institution = await prisma.institution.findUnique({ where: { id } });
    if (!institution) {
      return res.status(404).json({ error: 'Institution nicht gefunden.' });
    }
    
    if (institution.deletedAt) {
      return res.status(400).json({ error: 'Institution ist bereits zur Löschung markiert.' });
    }
    
    // Use GDPR service for soft delete with cascading logic
    const gdprService = require('../services/gdprService');
    const result = await gdprService.softDeleteInstitution(id, req.user.id, 'Institution deleted by super admin');
    
    // Log activity
    await logActivity(
      req.user.id,
      'INSTITUTION_SOFT_DELETED',
      'Institution',
      id,
      `Soft deleted institution: ${institution.name}`,
      institution.id,
      null
    );
    
    res.json({ 
      success: true, 
      message: 'Institution zur Löschung markiert',
      institution: result.institution
    });
  } catch (err) {
    console.error('Error deleting institution:', err);
    res.status(500).json({ error: 'Fehler beim Löschen der Institution.' });
  }
});

module.exports = router; 