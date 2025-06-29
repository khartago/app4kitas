const prisma = require('../models/prismaClient');

// POST /message
async function sendMessage(req, res) {
  const { content, childId, groupId } = req.body;
  const senderId = req.user.id;
  const user = req.user;
  let fileUrl = null;
  let fileType = null;
  if (req.file) {
    fileUrl = `/uploads/${req.file.filename}`;
    if (req.file.mimetype.startsWith('image/')) fileType = 'IMAGE';
    if (req.file.mimetype === 'application/pdf') fileType = 'PDF';
  }
  if (!content && !fileUrl) {
    return res.status(400).json({ success: false, message: 'Nachricht oder Datei erforderlich' });
  }
  if (!childId && !groupId) {
    return res.status(400).json({ success: false, message: 'childId oder groupId erforderlich' });
  }
  try {
    // Institution check
    if (user.role !== 'SUPER_ADMIN') {
      if (groupId) {
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group || group.institutionId !== user.institutionId) {
          return res.status(403).json({ success: false, message: 'Keine Berechtigung (Institution)' });
        }
      }
      if (childId) {
        const child = await prisma.child.findUnique({ where: { id: childId }, include: { group: true } });
        if (!child || (child.group && child.group.institutionId !== user.institutionId)) {
          return res.status(403).json({ success: false, message: 'Keine Berechtigung (Institution)' });
        }
      }
    }
    const message = await prisma.message.create({
      data: {
        senderId,
        childId,
        groupId,
        content,
        fileUrl,
        fileType,
      },
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Senden der Nachricht' });
  }
}

// GET /messages/child/:childId
async function getMessagesByChild(req, res) {
  const { childId } = req.params;
  const user = req.user;
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { parents: true, group: { include: { educators: true, institution: true } } }
    });
    if (!child) return res.status(404).json({ error: 'Kind nicht gefunden' });
    // Institution check
    if (
      user.role !== 'SUPER_ADMIN' &&
      child.group && child.group.institutionId !== user.institutionId
    ) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung (Institution)' });
    }
    const isParent = child.parents.some(p => p.id === user.id);
    const isEducator = child.group && child.group.educators.some(e => e.id === user.id);
    if (!(isParent || isEducator || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }
    const messages = await prisma.message.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Laden der Nachrichten' });
  }
}

// GET /inbox/:userId
async function getInbox(req, res) {
  const { userId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: 'Fehler beim Laden der Inbox' });
  }
}

module.exports = { sendMessage, getMessagesByChild, getInbox }; 