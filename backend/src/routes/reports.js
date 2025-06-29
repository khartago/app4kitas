const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middlewares/auth');
const { Parser } = require('json2csv');
const { generatePDFExport, createInfoLines } = require('../utils/pdfHelper');

const prisma = new PrismaClient();

// Daily report (JSON)
router.get('/reports/daily', authMiddleware, async (req, res) => {
  const { date, groupId } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  const start = new Date(date + 'T00:00:00.000Z');
  const end = new Date(date + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  try {
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { checkIns: true }
    });
    const report = children.map(child => {
      const todaysCheckins = child.checkIns.filter(
        ci => ci.timestamp >= start && ci.timestamp <= end
      );
      return {
        childId: child.id,
        name: child.name,
        checkedIn: todaysCheckins.some(ci => ci.type === 'IN'),
        checkedOut: todaysCheckins.some(ci => ci.type === 'OUT'),
        checkIns: todaysCheckins.length
      };
    });
    if (req.query.format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Kind', 'Eingetragen', 'Ausgetragen', 'Anzahl Check-ins'],
        columns: ['name', 'checkedIn', 'checkedOut', 'checkIns'],
        colWidths: [120, 80, 80, 100],
        title: 'Tagesbericht',
        info: createInfoLines(
          `Datum: ${new Date(date).toLocaleDateString('de-DE')}`,
          groupId ? `Gruppe: ${(await prisma.group.findUnique({ where: { id: groupId } }))?.name || 'Unbekannt'}` : 'Gruppe: Alle Gruppen'
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: `tagesbericht-${date}.pdf`,
        transformData: (item) => ({
          ...item,
          checkedIn: item.checkedIn ? 'Ja' : 'Nein',
          checkedOut: item.checkedOut ? 'Ja' : 'Nein',
          checkIns: item.checkIns.toString()
        })
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="tagesbericht-${date}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    }
    res.json({ date, groupId, report });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Erstellen des Tagesberichts.' });
  }
});

// Monthly report (JSON)
router.get('/reports/monthly', authMiddleware, async (req, res) => {
  const { month, groupId } = req.query; // month: 'YYYY-MM'
  if (!month) return res.status(400).json({ error: 'month is required (YYYY-MM)' });
  const start = new Date(month + '-01T00:00:00.000Z');
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1) - 1);
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  try {
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { checkIns: true }
    });
    const report = children.map(child => {
      const monthCheckins = child.checkIns.filter(
        ci => ci.timestamp >= start && ci.timestamp <= end
      );
      return {
        childId: child.id,
        name: child.name,
        checkInDays: new Set(monthCheckins.map(ci => ci.timestamp.toISOString().slice(0, 10))).size
      };
    });
    if (req.query.format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Kind', 'Anzahl Tage'],
        columns: ['name', 'checkInDays'],
        colWidths: [200, 100],
        title: 'Monatsbericht',
        info: createInfoLines(
          `Monat: ${new Date(month + '-01').toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}`,
          groupId ? `Gruppe: ${(await prisma.group.findUnique({ where: { id: groupId } }))?.name || 'Unbekannt'}` : 'Gruppe: Alle Gruppen'
        ),
        headerColor: [0.20, 0.66, 0.38],
        filename: `monatsbericht-${month}.pdf`,
        transformData: (item) => ({
          ...item,
          checkInDays: item.checkInDays.toString()
        })
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="monatsbericht-${month}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    }
    res.json({ month, groupId, report });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Erstellen des Monatsberichts.' });
  }
});

// Late pickups report (JSON)
router.get('/reports/late-pickups', authMiddleware, async (req, res) => {
  // TODO: Implement late pickups logic (requires planned pickup time per child or group)
  res.json({ message: 'Verspätete Abholungen-Stub', date: req.query.date, groupId: req.query.groupId });
});

// Late pickups report export (CSV)
router.get('/reports/late-pickups/export', authMiddleware, async (req, res) => {
  // TODO: Implement CSV export for late pickups
  res.header('Content-Type', 'text/csv');
  res.attachment('late-pickups.csv');
  res.send('childId,name,late\n'); // Fixed single-line string
});

// Daily report export (CSV/PDF)
router.get('/reports/daily/export', authMiddleware, async (req, res) => {
  const { date, groupId, format = 'csv' } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  
  try {
  const start = new Date(date + 'T00:00:00.000Z');
  const end = new Date(date + 'T23:59:59.999Z');
  const children = await prisma.child.findMany({
    where: {
      ...(groupId ? { groupId } : {}),
      ...(institutionId ? { institutionId } : {})
    },
      include: { 
        checkIns: true,
        group: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
  const report = children.map(child => {
    const todaysCheckins = child.checkIns.filter(
      ci => ci.timestamp >= start && ci.timestamp <= end
    );
    return {
      childId: child.id,
      name: child.name,
      checkedIn: todaysCheckins.some(ci => ci.type === 'IN'),
      checkedOut: todaysCheckins.some(ci => ci.type === 'OUT'),
      checkIns: todaysCheckins.length
    };
  });

  if (format === 'csv') {
      const csvData = report.map(item => ({
        'Kind': item.name,
        'Eingetragen': item.checkedIn ? 'Ja' : 'Nein',
        'Ausgetragen': item.checkedOut ? 'Ja' : 'Nein',
        'Anzahl Check-ins': item.checkIns
      }));

      const parser = new Parser({
        fields: ['Kind', 'Eingetragen', 'Ausgetragen', 'Anzahl Check-ins'],
        delimiter: ';',
        quote: '"',
        header: true
      });

      const csv = parser.parse(csvData);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="tagesbericht-${date}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const group = groupId ? await prisma.group.findUnique({ where: { id: groupId } }) : null;
      
      const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Kind', 'Eingetragen', 'Ausgetragen', 'Anzahl Check-ins'],
        columns: ['name', 'checkedIn', 'checkedOut', 'checkIns'],
        colWidths: [120, 80, 80, 100],
        title: 'Tagesbericht',
        info: createInfoLines(
          `Datum: ${new Date(date).toLocaleDateString('de-DE')}`,
          groupId ? `Gruppe: ${(await prisma.group.findUnique({ where: { id: groupId } }))?.name || 'Unbekannt'}` : 'Gruppe: Alle Gruppen'
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: `tagesbericht-${date}.pdf`,
        transformData: (item) => ({
          ...item,
          checkedIn: item.checkedIn ? 'Ja' : 'Nein',
          checkedOut: item.checkedOut ? 'Ja' : 'Nein',
          checkIns: item.checkIns.toString()
        })
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="tagesbericht-${date}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
  } else {
      return res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Daily report export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren des Tagesberichts.' });
  }
});

// Monthly report export (CSV)
router.get('/reports/monthly/export', authMiddleware, async (req, res) => {
  const { month, groupId, format = 'csv' } = req.query;
  if (!month) return res.status(400).json({ error: 'month is required (YYYY-MM)' });
  
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  
  try {
  const start = new Date(month + '-01T00:00:00.000Z');
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1) - 1);
  const children = await prisma.child.findMany({
    where: {
      ...(groupId ? { groupId } : {}),
      ...(institutionId ? { institutionId } : {})
    },
      include: { 
        checkIns: true,
        group: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
  const report = children.map(child => {
    const monthCheckins = child.checkIns.filter(
      ci => ci.timestamp >= start && ci.timestamp <= end
    );
    return {
      childId: child.id,
      name: child.name,
      checkInDays: new Set(monthCheckins.map(ci => ci.timestamp.toISOString().slice(0, 10))).size
    };
  });

  if (format === 'csv') {
      const csvData = report.map(item => ({
        'Kind': item.name,
        'Anzahl Tage': item.checkInDays
      }));

      const parser = new Parser({
        fields: ['Kind', 'Anzahl Tage'],
        delimiter: ';',
        quote: '"',
        header: true
      });

      const csv = parser.parse(csvData);
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="monatsbericht-${month}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel UTF-8 support
    } else if (format === 'pdf') {
      const group = groupId ? await prisma.group.findUnique({ where: { id: groupId } }) : null;
      
      const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Kind', 'Anzahl Tage'],
        columns: ['name', 'checkInDays'],
        colWidths: [200, 100],
        title: 'Monatsbericht',
        info: createInfoLines(
          `Monat: ${new Date(month + '-01').toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}`,
          `Gruppe: ${groupId ? group?.name || 'Unbekannt' : 'Alle Gruppen'}`
        ),
        headerColor: [0.20, 0.66, 0.38], // Green
        filename: `monatsbericht-${month}.pdf`
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="monatsbericht-${month}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
  } else {
      return res.status(400).json({ error: 'Unterstütztes Format: csv oder pdf' });
    }
  } catch (err) {
    console.error('Monthly report export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren des Monatsberichts.' });
  }
});

// User Growth
router.get('/reports/user-growth', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  if (format === 'csv') {
    const csvData = users.map(u => ({
      'E-Mail': u.email,
      'Name': u.name,
      'Rolle': u.role,
      'Erstellt am': new Date(u.createdAt).toLocaleDateString('de-DE')
    }));
    const parser = new Parser({ fields: ['E-Mail', 'Name', 'Rolle', 'Erstellt am'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`user-growth-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: users,
      headers: ['ID', 'E-Mail', 'Name', 'Rolle', 'Erstellt am'],
      columns: ['id', 'email', 'name', 'role', 'createdAt'],
      colWidths: [80, 150, 120, 80, 100],
      title: 'Benutzer-Wachstum',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.95, 0.61, 0.07], // Orange
      filename: `user-growth-${from}_to_${to}.pdf`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="user-growth-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, users });
});

// Active Users
router.get('/reports/active-users', authMiddleware, async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const active = await prisma.user.findMany({
    where: {
      updatedAt: { gte: since },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, email: true, name: true, role: true, updatedAt: true }
  });
  if (req.query.format === 'csv') {
    const csvData = active.map(u => ({
      'E-Mail': u.email,
      'Name': u.name,
      'Rolle': u.role,
      'Aktualisiert am': new Date(u.updatedAt).toLocaleDateString('de-DE')
    }));
    const parser = new Parser({ fields: ['E-Mail', 'Name', 'Rolle', 'Aktualisiert am'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`active-users-last${days}days.csv`);
    return res.send(csv);
  }
  if (req.query.format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: active,
      headers: ['ID', 'E-Mail', 'Name', 'Rolle', 'Aktualisiert am'],
      columns: ['id', 'email', 'name', 'role', 'updatedAt'],
      colWidths: [80, 150, 120, 80, 100],
      title: 'Aktive Benutzer',
      info: createInfoLines(`Letzte ${days} Tage`),
      headerColor: [0.61, 0.35, 0.71], // Purple
      filename: `active-users-${days}days.pdf`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="active-users-${days}days.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ days, active });
});

// Check-in Trends
router.get('/reports/checkin-trends', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const checkins = await prisma.checkInLog.findMany({
    where: {
      timestamp: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, childId: true, actorId: true, type: true, timestamp: true, method: true }
  });
  if (format === 'csv') {
    const csvData = checkins.map(c => ({
      'Typ': c.type,
      'Zeit': new Date(c.timestamp).toLocaleString('de-DE'),
      'Methode': c.method
    }));
    const parser = new Parser({ fields: ['Typ', 'Zeit', 'Methode'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`checkin-trends-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: checkins,
      headers: ['ID', 'Kind ID', 'Aktor ID', 'Typ', 'Zeit', 'Methode'],
      columns: ['id', 'childId', 'actorId', 'type', 'timestamp', 'method'],
      colWidths: [80, 80, 80, 60, 120, 80],
      title: 'Check-in Trends',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.90, 0.49, 0.13],
      filename: `checkin-trends-${from}_to_${to}.pdf`,
      transformData: (checkin) => ({
        ...checkin,
        timestamp: new Date(checkin.timestamp).toLocaleString('de-DE')
      })
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="checkin-trends-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, checkins });
});

// Active Groups
router.get('/reports/active-groups', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const groups = await prisma.group.findMany({
    where: {
      updatedAt: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, name: true, updatedAt: true }
  });
  if (format === 'csv') {
    const csvData = groups.map(g => ({
      'Name': g.name,
      'Kinder': g.childrenCount,
      'Check-ins': g.checkins
    }));
    const parser = new Parser({ fields: ['Name', 'Kinder', 'Check-ins'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`active-groups-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: groups,
      headers: ['ID', 'Name', 'Kinder', 'Check-ins'],
      columns: ['id', 'name', 'childrenCount', 'checkins'],
      colWidths: [80, 200, 100, 100],
      title: 'Aktive Gruppen',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.20, 0.55, 0.74],
      filename: `active-groups-${from}_to_${to}.pdf`
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="active-groups-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, groups });
});

// Message Volume
router.get('/reports/message-volume', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const messages = await prisma.message.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, senderId: true, childId: true, groupId: true, createdAt: true }
  });
  if (format === 'csv') {
    const csvData = messages.map(m => ({
      'Datum': new Date(m.createdAt).toLocaleDateString('de-DE'),
      'Nachrichten': m.count
    }));
    const parser = new Parser({ fields: ['Datum', 'Nachrichten'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`message-volume-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: messages,
      headers: ['Datum', 'Nachrichten'],
      columns: ['date', 'count'],
      colWidths: [120, 120],
      title: 'Nachrichten-Volumen',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.20, 0.55, 0.74],
      filename: `message-volume-${from}_to_${to}.pdf`
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="message-volume-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, messages });
});

// Notification Stats
router.get('/reports/notification-stats', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const notifications = await prisma.notificationLog.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, userId: true, title: true, body: true, read: true, createdAt: true }
  });
  if (format === 'csv') {
    const csvData = notifications.map(n => ({
      'Titel': n.title,
      'Text': n.body,
      'Gelesen': n.read ? 'Ja' : 'Nein',
      'Erstellt am': new Date(n.createdAt).toLocaleDateString('de-DE')
    }));
    const parser = new Parser({ fields: ['Titel', 'Text', 'Gelesen', 'Erstellt am'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`notification-stats-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: notifications,
      headers: ['ID', 'Benutzer ID', 'Titel', 'Text', 'Gelesen', 'Erstellt am'],
      columns: ['id', 'userId', 'title', 'body', 'read', 'createdAt'],
      colWidths: [80, 100, 120, 150, 60, 100],
      title: 'Benachrichtigungs-Statistiken',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.83, 0.33, 0.00], // Orange-red
      filename: `notification-stats-${from}_to_${to}.pdf`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="notification-stats-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, notifications });
});

// Failed Logins
router.get('/reports/failed-logins', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const failed = await prisma.failedLogin.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, email: true, ip: true, userAgent: true, createdAt: true }
  });
  if (format === 'csv') {
    const csvData = failed.map(f => ({
      'E-Mail': f.email,
      'IP-Adresse': f.ip,
      'User Agent': f.userAgent,
      'Erstellt am': new Date(f.createdAt).toLocaleDateString('de-DE')
    }));
    const parser = new Parser({ fields: ['E-Mail', 'IP-Adresse', 'User Agent', 'Erstellt am'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`failed-logins-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: failed,
      headers: ['ID', 'E-Mail', 'IP-Adresse', 'User Agent', 'Erstellt am'],
      columns: ['id', 'email', 'ip', 'userAgent', 'createdAt'],
      colWidths: [80, 120, 100, 150, 100],
      title: 'Fehlgeschlagene Anmeldungen',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.75, 0.22, 0.17], // Red
      filename: `failed-logins-${from}_to_${to}.pdf`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="failed-logins-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, failed });
});

// 1. Children Without Recent Check-ins
router.get('/reports/children-without-checkin', authMiddleware, async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const children = await prisma.child.findMany({
    include: { checkIns: true, group: true },
    where: {
      ...(institutionId ? { institutionId } : {})
    }
  });
  const result = children.filter(child => {
    if (!child.checkIns.length) return true;
    const lastCheckin = child.checkIns.reduce((latest, ci) => ci.timestamp > latest ? ci.timestamp : latest, child.checkIns[0]?.timestamp || new Date(0));
    return lastCheckin < since;
  }).map(child => ({
    childId: child.id,
    name: child.name,
    group: child.group ? child.group.name : null,
    lastCheckin: child.checkIns.length ? child.checkIns.reduce((latest, ci) => ci.timestamp > latest ? ci.timestamp : latest, child.checkIns[0]?.timestamp || new Date(0)) : null
  }));
  if (req.query.format === 'csv') {
    const csvData = result.map(item => ({
      'Kind': item.name,
      'Gruppe': item.group,
      'Letzter Check-in': item.lastCheckin ? new Date(item.lastCheckin).toLocaleString('de-DE') : 'Kein Check-in'
    }));
    const parser = new Parser({ fields: ['Kind', 'Gruppe', 'Letzter Check-in'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`children-without-checkin-last${days}days.csv`);
    return res.send(csv);
  }
  if (req.query.format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: children,
      headers: ['Kind', 'Gruppe'],
      columns: ['name', 'groupName'],
      colWidths: [200, 200],
      title: 'Kinder ohne Check-in',
      info: createInfoLines(
        `Datum: ${new Date(date).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.95, 0.61, 0.07],
      filename: `children-without-checkin-${date}.pdf`
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="children-without-checkin-${date}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ days, children: result });
});

// 2. Group Attendance Overview
router.get('/reports/group-attendance', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const groups = await prisma.group.findMany({
    include: { children: { include: { checkIns: true } } },
    where: {
      ...(institutionId ? { institutionId } : {})
    }
  });
  const report = groups.map(group => {
    let total = 0;
    let days = 0;
    const attendanceByDay = {};
    group.children.forEach(child => {
      child.checkIns.forEach(ci => {
        if (ci.timestamp >= start && ci.timestamp <= end && ci.type === 'IN') {
          const day = ci.timestamp.toISOString().slice(0, 10);
          attendanceByDay[day] = (attendanceByDay[day] || 0) + 1;
        }
      });
    });
    const avgAttendance = Object.values(attendanceByDay).length ? (Object.values(attendanceByDay).reduce((a, b) => a + b, 0) / Object.values(attendanceByDay).length) : 0;
    return {
      groupId: group.id,
      groupName: group.name,
      avgAttendance: Math.round(avgAttendance * 100) / 100,
      days: Object.keys(attendanceByDay).length
    };
  });
  if (format === 'csv') {
    const csvData = report.map(item => ({
      'Gruppe': item.groupName,
      'Anwesenheitstage': item.days
    }));
    const parser = new Parser({ fields: ['Gruppe', 'Anwesenheitstage'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`group-attendance-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: attendance,
      headers: ['Gruppe', 'Anwesenheitstage'],
      columns: ['groupName', 'attendanceDays'],
      colWidths: [200, 150],
      title: 'Gruppenanwesenheit',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.20, 0.55, 0.74],
      filename: `group-attendance-${from}_to_${to}.pdf`
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="group-attendance-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, report });
});

// 3. Most Active Educators
router.get('/reports/active-educators', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  // Count check-ins and messages per educator
  const educators = await prisma.user.findMany({
    where: {
      role: 'EDUCATOR',
      ...(institutionId ? { institutionId } : {})
    },
    select: { id: true, name: true, email: true }
  });
  const checkinCounts = await prisma.checkInLog.groupBy({
    by: ['actorId'],
    where: {
      actor: { role: 'EDUCATOR' },
      timestamp: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    _count: { _all: true }
  });
  const messageCounts = await prisma.message.groupBy({
    by: ['senderId'],
    where: {
      sender: { role: 'EDUCATOR' },
      createdAt: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    _count: { _all: true }
  });
  const educatorStats = educators.map(e => {
    const checkins = checkinCounts.find(c => c.actorId === e.id)?._count._all || 0;
    const messages = messageCounts.find(m => m.senderId === e.id)?._count._all || 0;
    return { educatorId: e.id, name: e.name, email: e.email, checkins, messages };
  });
  educatorStats.sort((a, b) => (b.checkins + b.messages) - (a.checkins + a.messages));
  if (format === 'csv') {
    const csvData = educatorStats.map(e => ({
      'Name': e.name,
      'E-Mail': e.email,
      'Check-ins': e.checkins,
      'Nachrichten': e.messages
    }));
    const parser = new Parser({ fields: ['Name', 'E-Mail', 'Check-ins', 'Nachrichten'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`active-educators-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: educatorStats,
      headers: ['ID', 'Name', 'E-Mail', 'Check-ins', 'Nachrichten'],
      columns: ['educatorId', 'name', 'email', 'checkins', 'messages'],
      colWidths: [80, 200, 200, 80, 80],
      title: 'Aktivste Erzieher:innen',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.55, 0.27, 0.67],
      filename: `active-educators-${from}_to_${to}.pdf`
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="active-educators-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, educators: educatorStats });
});

// 4. Check-in Method Breakdown
router.get('/reports/checkin-methods', authMiddleware, async (req, res) => {
  const { from, to, format } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  const checkins = await prisma.checkInLog.findMany({
    where: {
      timestamp: { gte: start, lte: end },
      ...(institutionId ? { institutionId } : {})
    },
    select: { method: true }
  });
  const total = checkins.length;
  const qr = checkins.filter(c => c.method === 'QR').length;
  const manual = checkins.filter(c => c.method === 'MANUAL').length;
  const report = [
    { method: 'QR', count: qr, percent: total ? Math.round((qr / total) * 100) : 0 },
    { method: 'MANUAL', count: manual, percent: total ? Math.round((manual / total) * 100) : 0 }
  ];
  if (format === 'csv') {
    const csvData = report.map(item => ({
      'Methode': item.method,
      'Anzahl': item.count,
      'Prozent': item.percent + '%'
    }));
    const parser = new Parser({ fields: ['Methode', 'Anzahl', 'Prozent'], delimiter: ';', quote: '"', header: true });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`checkin-methods-${from}_to_${to}.csv`);
    return res.send(csv);
  }
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
      data: report.map(item => ({
        ...item,
        percent: item.percent + '%'
      })),
      headers: ['Methode', 'Anzahl', 'Prozent'],
      columns: ['method', 'count', 'percent'],
      colWidths: [120, 100, 100],
      title: 'Check-in Methoden Übersicht',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
        `Bis: ${new Date(to).toLocaleDateString('de-DE')}`
      ),
      headerColor: [0.09, 0.63, 0.52], // Teal
      filename: `checkin-methods-${from}_to_${to}.pdf`
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="checkin-methods-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
  res.json({ from, to, report });
});

module.exports = router; 