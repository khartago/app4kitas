const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middlewares/auth');
const { Parser } = require('json2csv');
const { generatePDFExport, createInfoLines } = require('../utils/pdfHelper');

const prisma = new PrismaClient();

// Helper function to calculate working days in a month (excluding weekends and institution closed days)
function getWorkingDaysInMonth(start, end, closedDayDates) {
  let workingDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().slice(0, 10);
    
    // Skip weekends (0 = Sunday, 6 = Saturday) and institution closed days
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !closedDayDates.has(dateString)) {
      workingDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

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
      const checkInRecord = todaysCheckins.find(ci => ci.type === 'IN');
      const checkOutRecord = todaysCheckins.find(ci => ci.type === 'OUT');
      
      return {
        childId: child.id,
        name: child.name,
        checkedIn: !!checkInRecord,
        checkedOut: !!checkOutRecord,
        checkInTime: checkInRecord ? checkInRecord.timestamp.toISOString() : null,
        checkOutTime: checkOutRecord ? checkOutRecord.timestamp.toISOString() : null,
        checkIns: todaysCheckins.length
      };
    });
    if (req.query.format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Kind', 'Check-in Zeit', 'Check-out Zeit', 'Status', 'Anzahl Check-ins'],
        columns: ['name', 'checkInTime', 'checkOutTime', 'status', 'checkIns'],
        colWidths: [120, 80, 80, 100, 80],
        title: 'Tagesbericht',
        info: createInfoLines(
          `Datum: ${new Date(date).toLocaleDateString('de-DE')}`,
          groupId ? `Gruppe: ${(await prisma.group.findUnique({ where: { id: groupId } }))?.name || 'Unbekannt'}` : 'Gruppe: Alle Gruppen'
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: `tagesbericht-${date}.pdf`,
        transformData: (item) => ({
          ...item,
          checkInTime: item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOutTime: item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-',
          status: item.checkedIn && !item.checkedOut ? 'Aktuell anwesend' : item.checkedOut ? 'Heute ausgecheckt' : 'Nicht anwesend',
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
    // Get institution's closed days for the month
    const closedDays = institutionId ? await prisma.closedDay.findMany({
      where: {
        institutionId,
        date: {
          gte: start,
          lte: end
        }
      }
    }) : [];

    const closedDayDates = new Set(closedDays.map(cd => cd.date.toISOString().slice(0, 10)));

    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { checkIns: true }
    });

    // Calculate working days in the month (excluding weekends and institution closed days)
    const workingDaysInMonth = getWorkingDaysInMonth(start, end, closedDayDates);

    const report = children.map(child => {
      const monthCheckins = child.checkIns.filter(
        ci => ci.timestamp >= start && ci.timestamp <= end
      );
      return {
        childId: child.id,
        name: child.name,
        checkInDays: new Set(monthCheckins.map(ci => ci.timestamp.toISOString().slice(0, 10))).size,
        workingDaysInMonth
      };
    });
    if (req.query.format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Kind', 'Anwesenheitstage', 'Anwesenheitsrate'],
        columns: ['name', 'checkInDays', 'attendanceRate'],
        colWidths: [150, 100, 100],
        title: 'Monatsbericht',
        info: createInfoLines(
          `Monat: ${new Date(month + '-01').toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}`,
          groupId ? `Gruppe: ${(await prisma.group.findUnique({ where: { id: groupId } }))?.name || 'Unbekannt'}` : 'Gruppe: Alle Gruppen'
        ),
        headerColor: [0.20, 0.66, 0.38],
        filename: `monatsbericht-${month}.pdf`,
        transformData: (item) => ({
          ...item,
          checkInDays: item.checkInDays.toString(),
          attendanceRate: `${Math.round((item.checkInDays / item.workingDaysInMonth) * 100)}%`
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
  const { startDate, endDate, groupId, severity } = req.query;
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate und endDate sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T23:59:59.999Z');
  try {
    // Get children
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { group: true, checkIns: {
        where: {
          timestamp: { gte: start, lte: end },
          type: 'OUT'
        }
      } }
    });
    // Get groups and use default pickup time of 17:00
    const groups = await prisma.group.findMany({
      where: institutionId ? { institutionId } : {},
      select: { id: true, name: true }
    });
    const groupPickupMap = Object.fromEntries(groups.map(g => [g.id, '17:00']));
    // Build late pickups
    const latePickups = [];
    for (const child of children) {
      for (const out of child.checkIns) {
        const planned = groupPickupMap[child.groupId] || '17:00';
        const [h, m] = planned.split(':');
        const plannedDate = new Date(out.timestamp);
        plannedDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        if (out.timestamp > plannedDate) {
          const delay = Math.round((out.timestamp - plannedDate) / 60000); // min
          let sev = 'low';
          if (delay > 30) sev = 'high';
          else if (delay > 15) sev = 'medium';
          if (!severity || sev === severity) {
            latePickups.push({
              id: out.id,
              childName: child.name,
              groupName: child.group?.name || '',
              date: out.timestamp.toISOString().slice(0, 10),
              scheduledPickup: planned,
              actualPickup: out.timestamp.toISOString().slice(11, 16),
              delayMinutes: delay,
              severity: sev
            });
          }
        }
      }
    }
    // KPIs
    const kpis = {
      totalLatePickups: latePickups.length,
      averageDelay: latePickups.length ? Math.round(latePickups.reduce((a, b) => a + b.delayMinutes, 0) / latePickups.length) : 0,
      mostFrequentChild: latePickups.length ? latePickups.reduce((a, b, i, arr) => {
        const countA = arr.filter(x => x.childName === a.childName).length;
        const countB = arr.filter(x => x.childName === b.childName).length;
        return countA > countB ? a : b;
      }).childName : '',
      mostFrequentDay: latePickups.length ? latePickups.reduce((a, b, i, arr) => {
        const countA = arr.filter(x => x.date === a.date).length;
        const countB = arr.filter(x => x.date === b.date).length;
        return countA > countB ? a : b;
      }).date : ''
    };
    res.json({ kpis, latePickups });
  } catch (err) {
    console.error('Late pickups error:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Verspätete Abholungen Berichts.' });
  }
});

// Late pickups report export (CSV)
router.get('/reports/late-pickups/export', authMiddleware, async (req, res) => {
  const { startDate, endDate, groupId, severity } = req.query;
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate und endDate sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T23:59:59.999Z');
  try {
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { group: true, checkIns: {
        where: {
          timestamp: { gte: start, lte: end },
          type: 'OUT'
        }
      } }
    });
    const groups = await prisma.group.findMany({
      where: institutionId ? { institutionId } : {},
      select: { id: true, name: true }
    });
    const groupPickupMap = Object.fromEntries(groups.map(g => [g.id, '17:00']));
    const latePickups = [];
    for (const child of children) {
      for (const out of child.checkIns) {
        const planned = groupPickupMap[child.groupId] || '17:00';
        const [h, m] = planned.split(':');
        const plannedDate = new Date(out.timestamp);
        plannedDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        if (out.timestamp > plannedDate) {
          const delay = Math.round((out.timestamp - plannedDate) / 60000);
          let sev = 'low';
          if (delay > 30) sev = 'high';
          else if (delay > 15) sev = 'medium';
          if (!severity || sev === severity) {
            latePickups.push({
              childName: child.name,
              groupName: child.group?.name || '',
              date: out.timestamp.toISOString().slice(0, 10),
              scheduledPickup: planned,
              actualPickup: out.timestamp.toISOString().slice(11, 16),
              delayMinutes: delay,
              severity: sev
            });
          }
        }
      }
    }
    const csvData = latePickups.map(item => ({
      'Kind': item.childName,
      'Gruppe': item.groupName,
      'Datum': item.date,
      'Geplante Abholung': item.scheduledPickup,
      'Tatsächliche Abholung': item.actualPickup,
      'Verspätung (min)': item.delayMinutes,
      'Schweregrad': item.severity
    }));
    const parser = new Parser({
      fields: ['Kind', 'Gruppe', 'Datum', 'Geplante Abholung', 'Tatsächliche Abholung', 'Verspätung (min)', 'Schweregrad'],
      delimiter: ';',
      quote: '"',
      header: true
    });
    const csv = parser.parse(csvData);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="late-pickups-${startDate}_to_${endDate}.csv"`);
    res.send('\ufeff' + csv);
  } catch (err) {
    console.error('Late pickups export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren des Verspätete Abholungen Berichts.' });
  }
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
    const checkInRecord = todaysCheckins.find(ci => ci.type === 'IN');
    const checkOutRecord = todaysCheckins.find(ci => ci.type === 'OUT');
    
    return {
      childId: child.id,
      name: child.name,
      checkedIn: !!checkInRecord,
      checkedOut: !!checkOutRecord,
      checkInTime: checkInRecord ? checkInRecord.timestamp.toISOString() : null,
      checkOutTime: checkOutRecord ? checkOutRecord.timestamp.toISOString() : null,
      checkIns: todaysCheckins.length
    };
  });

  if (format === 'csv') {
      const csvData = report.map(item => {
        const status = item.checkedIn && !item.checkedOut ? 'Aktuell anwesend' : 
                      item.checkedOut ? 'Heute ausgecheckt' : 'Nicht anwesend';
        const checkInTime = item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-';
        const checkOutTime = item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-';
        
        return {
        'Kind': item.name,
          'Check-in Zeit': checkInTime,
          'Check-out Zeit': checkOutTime,
          'Status': status,
          'Anzahl Check-ins': item.checkIns,
          'Anwesend': item.checkedIn ? 'Ja' : 'Nein',
          'Ausgecheckt': item.checkedOut ? 'Ja' : 'Nein'
        };
      });

      const parser = new Parser({
        fields: ['Kind', 'Check-in Zeit', 'Check-out Zeit', 'Status', 'Anzahl Check-ins', 'Anwesend', 'Ausgecheckt'],
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
        headers: ['Kind', 'Check-in Zeit', 'Check-out Zeit', 'Status'],
        columns: ['name', 'checkInTime', 'checkOutTime', 'status'],
        colWidths: [150, 100, 100, 120],
        title: 'Tagesbericht',
        info: createInfoLines(
          `Datum: ${new Date(date).toLocaleDateString('de-DE')}`,
          groupId ? `Gruppe: ${(await prisma.group.findUnique({ where: { id: groupId } }))?.name || 'Unbekannt'}` : 'Gruppe: Alle Gruppen',
          `Anwesend: ${report.filter(r => r.checkedIn).length} von ${report.length} Kindern`
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: `tagesbericht-${date}.pdf`,
        transformData: (item) => ({
          ...item,
          checkInTime: item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-',
          checkOutTime: item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-',
          status: item.checkedIn && !item.checkedOut ? 'Aktuell anwesend' : 
                 item.checkedOut ? 'Heute ausgecheckt' : 'Nicht anwesend'
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
    
    // Get institution's closed days for the month
    const closedDays = institutionId ? await prisma.closedDay.findMany({
      where: {
        institutionId,
        date: {
          gte: start,
          lte: end
        }
      }
    }) : [];

    const closedDayDates = new Set(closedDays.map(cd => cd.date.toISOString().slice(0, 10)));
    const workingDaysInMonth = getWorkingDaysInMonth(start, end, closedDayDates);

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
        checkInDays: new Set(monthCheckins.map(ci => ci.timestamp.toISOString().slice(0, 10))).size,
        workingDaysInMonth
    };
  });

  if (format === 'csv') {
      const csvData = report.map(item => {
        const attendanceRate = Math.round((item.checkInDays / item.workingDaysInMonth) * 100);
        return {
        'Kind': item.name,
          'Anwesenheitstage': item.checkInDays,
          'Anwesenheitsrate (%)': attendanceRate
        };
      });

      const parser = new Parser({
        fields: ['Kind', 'Anwesenheitstage', 'Anwesenheitsrate (%)'],
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
        headers: ['Kind', 'Anwesenheitstage', 'Anwesenheitsrate'],
        columns: ['name', 'checkInDays', 'attendanceRate'],
        colWidths: [200, 120, 120],
        title: 'Monatsbericht',
        info: createInfoLines(
          `Monat: ${new Date(month + '-01').toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}`,
          `Gruppe: ${groupId ? group?.name || 'Unbekannt' : 'Alle Gruppen'}`,
          `Arbeitstage im Monat: ${workingDaysInMonth}`
        ),
        headerColor: [0.20, 0.66, 0.38], // Green
        filename: `monatsbericht-${month}.pdf`,
        transformData: (item) => ({
          ...item,
          checkInDays: item.checkInDays.toString(),
          attendanceRate: `${Math.round((item.checkInDays / item.workingDaysInMonth) * 100)}%`
        })
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
  const { from, to, format, type } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  
  try {
    // Get children for this institution to filter check-ins
    const children = institutionId ? await prisma.child.findMany({
      where: { institutionId },
      select: { id: true }
    }) : [];
    
    const childIds = children.map(c => c.id);
    
  const checkins = await prisma.checkInLog.findMany({
    where: {
      timestamp: { gte: start, lte: end },
        ...(institutionId && childIds.length > 0 ? { childId: { in: childIds } } : {}),
        ...(type ? { type } : {})
      },
      select: { 
        id: true, 
        childId: true, 
        actorId: true, 
        type: true, 
        timestamp: true, 
        method: true 
      },
      orderBy: { timestamp: 'desc' }
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
  } catch (err) {
    console.error('Checkin trends error:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Check-in Trends.' });
  }
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
  
  try {
  const groups = await prisma.group.findMany({
      include: { 
        children: { 
          include: { 
            checkIns: {
              where: {
                timestamp: { gte: start, lte: end },
                type: 'IN'
              }
            } 
          } 
        } 
      },
    where: {
      ...(institutionId ? { institutionId } : {})
    }
  });

    // Calculate working days in the period (excluding weekends)
    let workingDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const report = groups.map(group => {
      const childCount = group.children.length;
      const totalCheckIns = group.children.reduce((sum, child) => sum + child.checkIns.length, 0);
      
      // Calculate attendance rate based on expected vs actual check-ins
      const expectedCheckIns = childCount * workingDays;
      const attendanceRate = expectedCheckIns > 0 ? Math.round((totalCheckIns / expectedCheckIns) * 100) : 0;
      
      // Calculate average check-in and check-out times
      const allCheckIns = group.children.flatMap(child => child.checkIns);
      const avgCheckinTime = allCheckIns.length > 0 ? 
        new Date(allCheckIns.reduce((sum, ci) => sum + new Date(ci.timestamp).getTime(), 0) / allCheckIns.length)
          .toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-';
      
    return {
        id: group.id,
      groupName: group.name,
        childCount,
        attendanceRate,
        avgCheckinTime,
        avgCheckoutTime: '-', // Would need check-out data
        totalCheckIns,
        workingDays
    };
  });

    // Calculate KPIs
    const totalGroups = report.length;
    const avgAttendanceRate = totalGroups > 0 ? 
      Math.round(report.reduce((sum, group) => sum + group.attendanceRate, 0) / totalGroups) : 0;
    const bestPerformingGroup = report.reduce((best, group) => 
      group.attendanceRate > (best?.attendanceRate || 0) ? group : best, null)?.groupName || '';
    const totalChildren = report.reduce((sum, group) => sum + group.childCount, 0);

    const kpis = {
      totalGroups,
      avgAttendanceRate,
      bestPerformingGroup,
      totalChildren
    };

  if (format === 'csv') {
    const csvData = report.map(item => ({
      'Gruppe': item.groupName,
        'Kinder': item.childCount,
        'Anwesenheitsrate': `${item.attendanceRate}%`,
        'Ø Check-in Zeit': item.avgCheckinTime,
        'Check-ins gesamt': item.totalCheckIns
      }));
      const parser = new Parser({ 
        fields: ['Gruppe', 'Kinder', 'Anwesenheitsrate', 'Ø Check-in Zeit', 'Check-ins gesamt'], 
        delimiter: ';', 
        quote: '"', 
        header: true 
      });
    const csv = parser.parse(csvData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`group-attendance-${from}_to_${to}.csv`);
    return res.send(csv);
  }
    
  if (format === 'pdf') {
    const pdfBytes = await generatePDFExport({
        data: report,
        headers: ['Gruppe', 'Kinder', 'Anwesenheitsrate', 'Ø Check-in Zeit'],
        columns: ['groupName', 'childCount', 'attendanceRate', 'avgCheckinTime'],
        colWidths: [150, 80, 120, 100],
      title: 'Gruppenanwesenheit',
      info: createInfoLines(
        `Von: ${new Date(from).toLocaleDateString('de-DE')}`,
          `Bis: ${new Date(to).toLocaleDateString('de-DE')}`,
          `Arbeitstage: ${workingDays}`
      ),
      headerColor: [0.20, 0.55, 0.74],
        filename: `group-attendance-${from}_to_${to}.pdf`,
        transformData: (item) => ({
          ...item,
          attendanceRate: `${item.attendanceRate}%`,
          childCount: item.childCount.toString()
        })
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="group-attendance-${from}_to_${to}.pdf"`);
    res.end(Buffer.from(pdfBytes));
    return;
  }
    
    res.json({ kpis, report });
  } catch (err) {
    console.error('Group attendance error:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Gruppenanwesenheitsberichts.' });
  }
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
      ...(institutionId ? { child: { institutionId } } : {})
    },
    _count: { _all: true }
  });
  const messageCounts = await prisma.message.groupBy({
    by: ['senderId'],
    where: {
      sender: { role: 'EDUCATOR' },
      createdAt: { gte: start, lte: end },
      ...(institutionId ? { sender: { institutionId } } : {})
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
      ...(institutionId ? { child: { institutionId } } : {})
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

// Platform statistics report (PDF)
router.get('/reports/platform-stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Super Admins können Plattform-Statistiken exportieren.' });
  }

  try {
    // Get platform stats (similar to /stats endpoint)
    const users = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const educators = await prisma.user.count({ where: { role: 'EDUCATOR' } });
    const parents = await prisma.user.count({ where: { role: 'PARENT' } });
    const children = await prisma.child.count();
    const groups = await prisma.group.count();
    const institutionen = await prisma.institution.count();
    const activity = await prisma.activityLog.count();
    const checkins = await prisma.checkInLog.count();
    const messages = await prisma.message.count();
    const notifications = await prisma.notificationLog.count();
    const failedLogins = await prisma.failedLogin.count();

    // Calculate active users
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { activityLogs: { some: { createdAt: { gte: sevenDaysAgo } } } },
          { checkIns: { some: { timestamp: { gte: sevenDaysAgo } } } },
          { messages: { some: { createdAt: { gte: sevenDaysAgo } } } }
        ]
      }
    });

    // Calculate late check-ins for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const institutions = await prisma.institution.findMany();
    let totalLate = 0;
    for (const inst of institutions) {
      let openingHour = 8, openingMinute = 0;
      if (inst.openingTime) {
        const [h, m] = inst.openingTime.split(':');
        openingHour = parseInt(h, 10);
        openingMinute = parseInt(m || '0', 10);
      }
      const openingDate = new Date(today);
      openingDate.setHours(openingHour, openingMinute, 0, 0);
      const instChildIds = (await prisma.child.findMany({ where: { institutionId: inst.id }, select: { id: true } })).map(c => c.id);
      if (instChildIds.length > 0) {
        const lateCount = await prisma.checkInLog.count({
          where: {
            timestamp: { gte: today, lt: tomorrow, gt: openingDate },
            type: 'IN',
            childId: { in: instChildIds }
          }
        });
        totalLate += lateCount;
      }
    }

    const statsData = [
      { category: 'Alle Nutzer', value: users.toString() },
      { category: 'Aktive Nutzer (7 Tage)', value: activeUsers.toString() },
      { category: 'Admins (Kita-Leitung)', value: admins.toString() },
      { category: 'Erzieher:innen', value: educators.toString() },
      { category: 'Eltern', value: parents.toString() },
      { category: 'Kinder', value: children.toString() },
      { category: 'Gruppen', value: groups.toString() },
      { category: 'Institutionen', value: institutionen.toString() },
      { category: 'Check-ins', value: checkins.toString() },
      { category: 'Verspätete Check-ins', value: totalLate.toString() },
      { category: 'Nachrichten', value: messages.toString() },
      { category: 'Benachrichtigungen', value: notifications.toString() },
      { category: 'Aktivitäts-Logs', value: activity.toString() },
      { category: 'Fehlgeschlagene Logins', value: failedLogins.toString() }
    ];

    if (req.query.format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: statsData,
        headers: ['Kategorie', 'Wert'],
        columns: ['category', 'value'],
        colWidths: [300, 100],
        title: 'Plattform-Statistiken',
        info: createInfoLines(
          `Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}`,
          'Plattformweite Übersicht aller wichtigen Kennzahlen'
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: 'plattform-statistiken.pdf'
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="plattform-statistiken.pdf"');
      res.end(Buffer.from(pdfBytes));
      return;
    }

    res.json({ stats: statsData });
  } catch (err) {
    console.error('Platform stats export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren der Plattform-Statistiken.' });
  }
});

// Absence Patterns report (JSON)
router.get('/reports/absence-patterns', authMiddleware, async (req, res) => {
  const { startDate, endDate, groupId, patternType } = req.query;
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate und endDate sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T23:59:59.999Z');
  try {
    // Get all children with their check-ins
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { 
        group: true, 
        checkIns: {
          where: {
            timestamp: { gte: start, lte: end },
            type: 'IN'
          }
        }
      }
    });

    // Calculate working days in the period (excluding weekends)
    let workingDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Calculate absences based on missing check-ins
    const childrenStats = children.map(child => {
      const checkInDays = new Set(
        child.checkIns.map(ci => ci.timestamp.toISOString().slice(0, 10))
      );
      const absenceDays = workingDays - checkInDays.size;
      const attendanceRate = workingDays > 0 ? Math.round((checkInDays.size / workingDays) * 100) : 0;
      
      return {
        id: child.id,
        childName: child.name,
        groupName: child.group?.name || '',
        totalAbsences: Math.max(0, absenceDays),
        attendanceRate,
        checkInDays: checkInDays.size,
        workingDays,
        pattern: absenceDays > workingDays * 0.3 ? 'Regelmäßig' : 'Unregelmäßig'
      };
    });

    // Calculate KPIs
    const totalAbsences = childrenStats.reduce((sum, child) => sum + child.totalAbsences, 0);
    const averageAbsencesPerChild = children.length ? +(totalAbsences / children.length).toFixed(2) : 0;
    const mostAbsentChild = childrenStats.reduce((max, c) => (c.totalAbsences > (max?.totalAbsences || 0) ? c : max), null)?.childName || '';

    // Weekly pattern (simplified - just show distribution)
    const weeklyPattern = [1,2,3,4,5].map(dow => ({
      day: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag'][dow - 1],
      absences: Math.round(totalAbsences / 5), // Distribute evenly for demo
      percentage: 20
    }));

    // Monthly pattern
    const monthName = new Date(start).toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    const monthlyPattern = [{ month: monthName, absences: totalAbsences }];

    // Reasons (simplified)
    const reasonsArr = [
      { reason: 'Krankheit', count: Math.round(totalAbsences * 0.6), percentage: 60 },
      { reason: 'Urlaub', count: Math.round(totalAbsences * 0.3), percentage: 30 },
      { reason: 'Andere', count: Math.round(totalAbsences * 0.1), percentage: 10 }
    ];

    // Trend (simplified)
    const trend = 'stable';
    const trendPercentage = 0;

    const kpis = { 
      totalAbsences, 
      averageAbsencesPerChild, 
      mostAbsentChild, 
      trend, 
      trendPercentage,
      workingDays,
      totalChildren: children.length
    };

    res.json({ kpis, patterns: { weeklyPattern, monthlyPattern, reasons: reasonsArr }, children: childrenStats });
  } catch (err) {
    console.error('Absence patterns error:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Fehlzeiten-Muster Berichts.' });
  }
});

// Absence Patterns report export (CSV)
router.get('/reports/absence-patterns/export', authMiddleware, async (req, res) => {
  const { startDate, endDate, groupId } = req.query;
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate und endDate sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T23:59:59.999Z');
  try {
    // Get all children with their check-ins
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { 
        group: true, 
        checkIns: {
          where: {
            timestamp: { gte: start, lte: end },
            type: 'IN'
          }
        }
      }
    });

    // Calculate working days
    let workingDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const csvData = children.map(child => {
      const checkInDays = new Set(
        child.checkIns.map(ci => ci.timestamp.toISOString().slice(0, 10))
      );
      const absenceDays = Math.max(0, workingDays - checkInDays.size);
      const attendanceRate = workingDays > 0 ? Math.round((checkInDays.size / workingDays) * 100) : 0;
      
      return {
        'Kind': child.name,
        'Gruppe': child.group?.name || '',
        'Anwesenheitstage': checkInDays.size,
        'Fehlzeiten': absenceDays,
        'Anwesenheitsrate': `${attendanceRate}%`,
        'Arbeitstage': workingDays,
        'Muster': absenceDays > workingDays * 0.3 ? 'Regelmäßig' : 'Unregelmäßig'
      };
    });

    const parser = new Parser({
      fields: ['Kind', 'Gruppe', 'Anwesenheitstage', 'Fehlzeiten', 'Anwesenheitsrate', 'Arbeitstage', 'Muster'],
      delimiter: ';',
      quote: '"',
      header: true
    });
    const csv = parser.parse(csvData);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="absence-patterns-${startDate}_to_${endDate}.csv"`);
    res.send('\ufeff' + csv);
  } catch (err) {
    console.error('Absence patterns export error:', err);
    res.status(500).json({ error: 'Fehler beim Exportieren des Fehlzeiten-Muster Berichts.' });
  }
});

// Check-in Trends report (JSON)
router.get('/reports/checkin-trends', authMiddleware, async (req, res) => {
  const { from, to, type } = req.query;
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  try {
    // Get all check-ins for the period
    const checkins = await prisma.checkInLog.findMany({
      where: {
        timestamp: { gte: start, lte: end },
        ...(institutionId ? {
          child: { institutionId }
        } : {})
      },
      include: {
        child: {
          select: { name: true, group: { select: { name: true } } }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Analyze hourly distribution
    const hourlyDistribution = {};
    for (let hour = 7; hour <= 18; hour++) {
      hourlyDistribution[hour] = {
        checkins: 0,
        checkouts: 0,
        peak: hour >= 7 && hour <= 9 || hour >= 16 && hour <= 18
      };
    }

    checkins.forEach(checkin => {
      const hour = new Date(checkin.timestamp).getHours();
      if (hour >= 7 && hour <= 18) {
        if (checkin.type === 'IN') {
          hourlyDistribution[hour].checkins++;
        } else if (checkin.type === 'OUT') {
          hourlyDistribution[hour].checkouts++;
        }
      }
    });

    // Calculate KPIs
    const totalCheckins = checkins.filter(c => c.type === 'IN').length;
    const totalCheckouts = checkins.filter(c => c.type === 'OUT').length;
    const qrCheckins = checkins.filter(c => c.method === 'QR').length;
    const manualCheckins = checkins.filter(c => c.method === 'MANUAL').length;
    
    // Find peak times
    const peakCheckinHour = Object.entries(hourlyDistribution)
      .filter(([hour, data]) => data.checkins > 0)
      .sort((a, b) => b[1].checkins - a[1].checkins)[0];
    
    const peakCheckoutHour = Object.entries(hourlyDistribution)
      .filter(([hour, data]) => data.checkouts > 0)
      .sort((a, b) => b[1].checkouts - a[1].checkouts)[0];

    // Calculate average duration (for children with both check-in and check-out)
    const childDurations = {};
    checkins.forEach(checkin => {
      if (!childDurations[checkin.childId]) {
        childDurations[checkin.childId] = { checkin: null, checkout: null };
      }
      if (checkin.type === 'IN') {
        childDurations[checkin.childId].checkin = checkin.timestamp;
      } else if (checkin.type === 'OUT') {
        childDurations[checkin.childId].checkout = checkin.timestamp;
      }
    });

    const validDurations = Object.values(childDurations)
      .filter(d => d.checkin && d.checkout)
      .map(d => (d.checkout - d.checkin) / (1000 * 60 * 60)); // hours

    const averageDuration = validDurations.length ? 
      +(validDurations.reduce((a, b) => a + b, 0) / validDurations.length).toFixed(1) : 0;

    const kpis = {
      totalCheckins,
      totalCheckouts,
      qrCheckins,
      manualCheckins,
      qrPercentage: totalCheckins ? Math.round((qrCheckins / totalCheckins) * 100) : 0,
      peakCheckinTime: peakCheckinHour ? `${peakCheckinHour[0]}:00` : 'N/A',
      peakCheckoutTime: peakCheckoutHour ? `${peakCheckoutHour[0]}:00` : 'N/A',
      averageDuration: `${averageDuration}h`
    };

    // Prepare data for export
    const exportData = checkins.map(checkin => ({
      datum: new Date(checkin.timestamp).toLocaleDateString('de-DE'),
      uhrzeit: new Date(checkin.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      kind: checkin.child.name,
      gruppe: checkin.child.group?.name || '',
      typ: checkin.type === 'IN' ? 'Check-in' : 'Check-out',
      methode: checkin.method === 'QR' ? 'QR-Code' : 'Manuell',
      stunde: new Date(checkin.timestamp).getHours(),
      spitzzeit: hourlyDistribution[new Date(checkin.timestamp).getHours()]?.peak ? 'Ja' : 'Nein'
    }));

    if (req.query.format === 'pdf') {
      const pdfBytes = await generatePDFExport({
        data: exportData,
        headers: ['Datum', 'Uhrzeit', 'Kind', 'Gruppe', 'Typ', 'Methode', 'Spitzenzeit'],
        columns: ['datum', 'uhrzeit', 'kind', 'gruppe', 'typ', 'methode', 'spitzzeit'],
        colWidths: [80, 60, 120, 80, 60, 60, 60],
        title: 'Check-in Zeit-Analyse',
        info: createInfoLines(
          `Zeitraum: ${new Date(from).toLocaleDateString('de-DE')} - ${new Date(to).toLocaleDateString('de-DE')}`,
          `Gesamt Check-ins: ${totalCheckins}, Check-outs: ${totalCheckouts}`
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: `checkin-trends-${from}_to_${to}.pdf`
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="checkin-trends-${from}_to_${to}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    }

    if (req.query.format === 'csv') {
      const parser = new Parser({
        fields: ['Datum', 'Uhrzeit', 'Kind', 'Gruppe', 'Typ', 'Methode', 'Spitzenzeit'],
        delimiter: ';',
        quote: '"',
        header: true
      });
      const csv = parser.parse(exportData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="checkin-trends-${from}_to_${to}.csv"`);
      res.send('\ufeff' + csv);
      return;
    }

    res.json({ 
      kpis, 
      hourlyDistribution, 
      checkins: checkins.slice(0, 50), // Limit for performance
      totalAnalyzed: checkins.length 
    });
  } catch (err) {
    console.error('Check-in trends error:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen der Check-in Zeit-Analyse.' });
  }
});

// Custom Range Attendance report (JSON)
router.get('/reports/custom-attendance', authMiddleware, async (req, res) => {
  const { from, to, groupId, type } = req.query;
  const institutionId = req.user.role === 'ADMIN' ? req.user.institutionId : undefined;
  if (!from || !to) return res.status(400).json({ error: 'from und to sind erforderlich (YYYY-MM-DD)' });
  const start = new Date(from + 'T00:00:00.000Z');
  const end = new Date(to + 'T23:59:59.999Z');
  try {
    // Get children for the institution/group
    const children = await prisma.child.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(institutionId ? { institutionId } : {})
      },
      include: { 
        group: true,
        checkIns: {
          where: {
            timestamp: { gte: start, lte: end }
          }
        }
      }
    });

    // Calculate working days in the period (excluding weekends)
    let workingDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Generate attendance data
    const attendanceData = children.map(child => {
      const checkInDays = new Set(
        child.checkIns
          .filter(ci => ci.type === 'IN')
          .map(ci => ci.timestamp.toISOString().slice(0, 10))
      ).size;

      const attendanceRate = workingDays > 0 ? Math.round((checkInDays / workingDays) * 100) : 0;
      
      return {
        childId: child.id,
        childName: child.name,
        groupName: child.group?.name || '',
        checkInDays,
        workingDays,
        attendanceRate,
        totalCheckIns: child.checkIns.length
      };
    });

    // Calculate KPIs
    const totalChildren = children.length;
    const averageAttendance = totalChildren > 0 ? 
      Math.round(attendanceData.reduce((sum, child) => sum + child.attendanceRate, 0) / totalChildren) : 0;
    const perfectAttendance = attendanceData.filter(child => child.attendanceRate === 100).length;
    const lowAttendance = attendanceData.filter(child => child.attendanceRate < 70).length;

    const kpis = {
      totalChildren,
      workingDays,
      averageAttendance: `${averageAttendance}%`,
      perfectAttendance,
      lowAttendance,
      periodDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    };

    // Prepare sample data for display
    const sampleData = attendanceData.slice(0, 10).map(child => ({
      date: new Date().toLocaleDateString('de-DE'),
      type: 'Anwesenheit',
      value: `${child.attendanceRate}%`,
      status: child.attendanceRate >= 90 ? 'success' : child.attendanceRate >= 70 ? 'warning' : 'error',
      statusText: child.attendanceRate >= 90 ? 'Sehr gut' : child.attendanceRate >= 70 ? 'Gut' : 'Verbesserung nötig'
    }));

    if (req.query.format === 'pdf') {
      const exportData = attendanceData.map(child => ({
        'Kind': child.childName,
        'Gruppe': child.groupName,
        'Anwesenheitstage': child.checkInDays,
        'Arbeitstage': child.workingDays,
        'Anwesenheitsrate': `${child.attendanceRate}%`
      }));

      const pdfBytes = await generatePDFExport({
        data: exportData,
        headers: ['Kind', 'Gruppe', 'Anwesenheitstage', 'Arbeitstage', 'Anwesenheitsrate'],
        columns: ['Kind', 'Gruppe', 'Anwesenheitstage', 'Arbeitstage', 'Anwesenheitsrate'],
        colWidths: [120, 80, 100, 80, 100],
        title: 'Benutzerdefinierter Anwesenheitsbericht',
        info: createInfoLines(
          `Zeitraum: ${new Date(from).toLocaleDateString('de-DE')} - ${new Date(to).toLocaleDateString('de-DE')}`,
          `Arbeitstage: ${workingDays}, Durchschnittliche Anwesenheit: ${averageAttendance}%`
        ),
        headerColor: [0.20, 0.55, 0.74],
        filename: `custom-attendance-${from}_to_${to}.pdf`
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="custom-attendance-${from}_to_${to}.pdf"`);
      res.end(Buffer.from(pdfBytes));
      return;
    }

    if (req.query.format === 'csv') {
      const exportData = attendanceData.map(child => ({
        'Kind': child.childName,
        'Gruppe': child.groupName,
        'Anwesenheitstage': child.checkInDays,
        'Arbeitstage': child.workingDays,
        'Anwesenheitsrate': `${child.attendanceRate}%`
      }));

      const parser = new Parser({
        fields: ['Kind', 'Gruppe', 'Anwesenheitstage', 'Arbeitstage', 'Anwesenheitsrate'],
        delimiter: ';',
        quote: '"',
        header: true
      });
      const csv = parser.parse(exportData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="custom-attendance-${from}_to_${to}.csv"`);
      res.send('\ufeff' + csv);
      return;
    }

    res.json({ 
      kpis, 
      attendanceData, 
      sampleData,
      totalRecords: attendanceData.length 
    });
  } catch (err) {
    console.error('Custom attendance error:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des benutzerdefinierten Anwesenheitsberichts.' });
  }
});

module.exports = router; 