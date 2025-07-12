const prisma = require('../models/prismaClient');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');
const { logActivity } = require('./activityController');
const { isUUID } = require('validator');

// GET /children/:id
async function getChild(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const child = await prisma.child.findUnique({
      where: { id },
      include: { parents: true, group: { include: { educators: true, institution: true } } }
    });
    if (!child) return res.status(404).json({ error: 'Kind nicht gefunden' });
    // Institution check for admin/educator
    if (
      user.role !== 'SUPER_ADMIN' &&
      child.group && child.group.institutionId !== user.institutionId
    ) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    // Parent or educator in group
    const isParent = child.parents.some(p => p.id === user.id);
    const isEducator = child.group && child.group.educators.some(e => e.id === user.id);
    if (!(isParent || isEducator || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    res.json(child);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Laden des Kindes' });
  }
}

// POST /children (Admin only)
async function createChild(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Kinder anlegen' });
  }
  const { name, birthdate, groupId, parentIds, institutionId: bodyInstitutionId } = req.body;
  if (!name || !birthdate) {
    return res.status(400).json({ error: 'Name und Geburtsdatum erforderlich' });
  }
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    return res.status(400).json({ error: 'Ungültiges Datumsformat (YYYY-MM-DD)' });
  }
  try {
    // Check group institution
    let group = null;
    if (groupId) {
      group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) return res.status(400).json({ error: 'Gruppe nicht gefunden' });
      if (user.role !== 'SUPER_ADMIN' && group.institutionId !== user.institutionId) {
        return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
      }
    }
    const qrCodeSecret = crypto.randomBytes(16).toString('hex');
    let institutionId;
    if (user.role === 'SUPER_ADMIN') {
      institutionId = bodyInstitutionId;
      if (!institutionId) {
        return res.status(400).json({ error: 'Institution muss angegeben werden' });
      }
    } else {
      institutionId = user.institutionId;
      if (!institutionId) {
        return res.status(400).json({ error: 'Institution nicht gefunden' });
      }
    }
    const child = await prisma.child.create({
      data: {
        name,
        birthdate: new Date(birthdate),
        group: groupId ? { connect: { id: groupId } } : undefined,
        parents: parentIds && parentIds.length ? { connect: parentIds.map(id => ({ id })) } : undefined,
        qrCodeSecret,
        institution: { connect: { id: institutionId } }
      },
    });
    
    // Log activity
    await logActivity(
      user.id,
      'CHILD_CREATED',
      'Child',
      child.id,
      `Created child: ${name}`,
      institutionId,
      groupId || null
    );
    
    res.status(201).json(child);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Anlegen des Kindes' });
  }
}

// PUT /children/:id (Admin only)
async function updateChild(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Kinder bearbeiten' });
  }
  const { id } = req.params;
  const { name, birthdate, groupId, parentIds } = req.body;
  
  try {
    // Check if child exists and user has permission
    const existingChild = await prisma.child.findUnique({
      where: { id },
      include: { group: true }
    });
    
    if (!existingChild) {
      return res.status(404).json({ error: 'Kind nicht gefunden' });
    }
    
    // Check group institution if changing group
    if (groupId && groupId !== existingChild.groupId) {
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) return res.status(400).json({ error: 'Gruppe nicht gefunden' });
      if (user.role !== 'SUPER_ADMIN' && group.institutionId !== user.institutionId) {
        return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
      }
    }
    
    const child = await prisma.child.update({
      where: { id },
      data: {
        name: name || undefined,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        group: groupId ? { connect: { id: groupId } } : groupId === null ? { disconnect: true } : undefined,
        parents: parentIds ? { set: parentIds.map(id => ({ id })) } : undefined,
      },
      include: {
        group: true,
        parents: true
      }
    });
    
    // Log activity
    await logActivity(
      user.id,
      'CHILD_UPDATED',
      'Child',
      child.id,
      `Updated child: ${child.name}`,
      user.institutionId || null,
      child.groupId || null
    );
    
    res.json(child);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Bearbeiten des Kindes' });
  }
}

// DELETE /children/:id (Admin only)
async function deleteChild(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Kinder löschen' });
  }
  const { id } = req.params;
  
  try {
    // Check if child exists and user has permission
    const existingChild = await prisma.child.findUnique({
      where: { id },
      include: { group: true }
    });
    
    if (!existingChild) {
      return res.status(404).json({ error: 'Kind nicht gefunden' });
    }
    
    if (user.role !== 'SUPER_ADMIN' && existingChild.group?.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    await prisma.child.delete({
      where: { id }
    });
    
    // Log activity
    await logActivity(
      user.id,
      'CHILD_DELETED',
      'Child',
      id,
      `Deleted child: ${existingChild.name}`,
      user.institutionId || null,
      existingChild.groupId || null
    );
    
    res.json({ message: 'Kind erfolgreich gelöscht' });
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Löschen des Kindes' });
  }
}

// PUT /children/:id/photo (Admin only)
async function updateChildPhoto(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Fotos aktualisieren' });
  }
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'Foto erforderlich' });
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    // Find old photoUrl
    const existingChild = await prisma.child.findUnique({ where: { id } });
    if (existingChild && existingChild.photoUrl) {
      const oldPath = path.join(__dirname, '../../', existingChild.photoUrl);
      // Only delete if inside uploads
      if (oldPath.includes(path.join('uploads'))) {
        fs.unlink(oldPath, err => { /* ignore errors, file may not exist */ });
      }
    }
    const child = await prisma.child.update({
      where: { id },
      data: { photoUrl },
    });
    res.json(child);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Aktualisieren des Fotos' });
  }
}

// GET /children/:id/qrcode
async function getChildQRCode(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const child = await prisma.child.findUnique({ where: { id }, include: { group: true } });
    if (!child) return res.status(404).json({ error: 'Kind nicht gefunden' });
    if (user.role !== 'SUPER_ADMIN' && child.group && child.group.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    const qrData = child.qrCodeSecret;
    const qrImage = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' });
    const img = Buffer.from(qrImage.split(',')[1], 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length,
    });
    res.end(img);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Generieren des QR-Codes' });
  }
}

// POST /children/:id/qrcode/regenerate
async function regenerateChildQRCode(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const child = await prisma.child.findUnique({ where: { id }, include: { group: true } });
    if (!child) return res.status(404).json({ error: 'Kind nicht gefunden' });
    if (user.role !== 'SUPER_ADMIN' && child.group && child.group.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    const newSecret = crypto.randomBytes(16).toString('hex');
    await prisma.child.update({ where: { id }, data: { qrCodeSecret: newSecret } });
    res.json({ qrCodeSecret: newSecret });
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Regenerieren des QR-Codes' });
  }
}

module.exports = { getChild, createChild, updateChild, deleteChild, updateChildPhoto, getChildQRCode, regenerateChildQRCode }; 