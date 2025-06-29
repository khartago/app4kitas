const prisma = require('../models/prismaClient');

// GET /groups/:id
async function getGroup(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        children: { include: { parents: true } },
        educators: true,
        institution: true,
      },
    });
    if (!group) return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    // Access: educator in group, admin, super_admin, or parent of a child in group
    const isEducator = group.educators.some(e => e.id === user.id);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isParent = group.children.some(child => child.parents.some(p => p.id === user.id));
    // Institution check for admin/educator
    if (
      user.role !== 'SUPER_ADMIN' &&
      group.institutionId !== user.institutionId
    ) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    if (!(isEducator || isAdmin || isParent)) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Laden der Gruppe' });
  }
}

// POST /groups (Admin only)
async function createGroup(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Gruppen anlegen' });
  }
  const { name, educatorIds } = req.body;
  if (!name) return res.status(400).json({ error: 'Name erforderlich' });
  try {
    // Only allow educators from same institution
    let connectEducators = undefined;
    if (educatorIds && educatorIds.length) {
      const validEducators = await prisma.user.findMany({
        where: {
          id: { in: educatorIds },
          role: 'EDUCATOR',
          institutionId: user.institutionId,
        },
      });
      connectEducators = { connect: validEducators.map(e => ({ id: e.id })) };
    }
    const group = await prisma.group.create({
      data: {
        name,
        institutionId: user.institutionId, // Always set from token
        educators: connectEducators,
      },
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Anlegen der Gruppe' });
  }
}

// PUT /groups/:id (Admin only)
async function updateGroup(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Gruppen bearbeiten' });
  }
  const { id } = req.params;
  const { name, educatorIds } = req.body;
  
  try {
    // Check if group exists and user has permission
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    if (user.role !== 'SUPER_ADMIN' && existingGroup.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // Only allow educators from same institution
    let connectEducators = undefined;
    if (educatorIds && educatorIds.length) {
      const validEducators = await prisma.user.findMany({
        where: {
          id: { in: educatorIds },
          role: 'EDUCATOR',
          institutionId: user.institutionId,
        },
      });
      connectEducators = { set: validEducators.map(e => ({ id: e.id })) };
    }
    
    const group = await prisma.group.update({
      where: { id },
      data: {
        name: name || undefined,
        educators: connectEducators,
      },
      include: {
        educators: true,
        children: true
      }
    });
    
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Bearbeiten der Gruppe' });
  }
}

// DELETE /groups/:id (Admin only)
async function deleteGroup(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Gruppen löschen' });
  }
  const { id } = req.params;
  
  try {
    // Check if group exists and user has permission
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      include: { children: true }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    if (user.role !== 'SUPER_ADMIN' && existingGroup.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // Check if group has children
    if (existingGroup.children && existingGroup.children.length > 0) {
      return res.status(400).json({ error: 'Gruppe kann nicht gelöscht werden, da sie noch Kinder enthält' });
    }
    
    await prisma.group.delete({
      where: { id }
    });
    
    res.json({ message: 'Gruppe erfolgreich gelöscht' });
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Löschen der Gruppe' });
  }
}

// PUT /groups/:id/educators (Admin only)
async function assignEducators(req, res) {
  const user = req.user;
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admin kann Erzieher zuweisen' });
  }
  const { id } = req.params;
  const { educatorIds } = req.body;
  
  try {
    // Check if group exists and user has permission
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    if (user.role !== 'SUPER_ADMIN' && existingGroup.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    // Only allow educators from same institution
    let connectEducators = undefined;
    if (educatorIds && educatorIds.length) {
      const validEducators = await prisma.user.findMany({
        where: {
          id: { in: educatorIds },
          role: 'EDUCATOR',
          institutionId: user.institutionId,
        },
      });
      connectEducators = { set: validEducators.map(e => ({ id: e.id })) };
    } else {
      connectEducators = { set: [] };
    }
    
    const group = await prisma.group.update({
      where: { id },
      data: {
        educators: connectEducators,
      },
      include: {
        educators: true
      }
    });
    
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Zuweisen der Erzieher' });
  }
}

module.exports = { getGroup, createGroup, updateGroup, deleteGroup, assignEducators }; 