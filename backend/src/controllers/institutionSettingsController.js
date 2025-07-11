const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logActivity } = require('./activityController');

// GET /institution-settings/:institutionId
async function getInstitutionSettings(req, res) {
  const { institutionId } = req.params;
  const currentUser = req.user;

  try {
    // Check permissions
    if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can access any institution
    } else if (currentUser.role === 'ADMIN' && currentUser.institutionId === institutionId) {
      // Admin can only access their own institution
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung für diese Institution' 
      });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        closedDays: {
          orderBy: { date: 'asc' }
        },
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        groups: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                children: true,
                educators: true
              }
            }
          }
        },
        _count: {
          select: {
            children: true,
            groups: true,
            admins: true
          }
        }
      }
    });

    if (!institution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Institution nicht gefunden' 
      });
    }

    res.json({
      success: true,
      institution
    });

  } catch (err) {
    console.error('Error getting institution settings:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Laden der Institutionseinstellungen' 
    });
  }
}

// PUT /institution-settings/:institutionId
async function updateInstitutionSettings(req, res) {
  const { institutionId } = req.params;
  const currentUser = req.user;
  const { 
    name, 
    address, 
    openingTime, 
    closingTime,
    repeatedClosedDays
  } = req.body;

  try {
    // Check permissions
    if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can update any institution
    } else if (currentUser.role === 'ADMIN' && currentUser.institutionId === institutionId) {
      // Admin can only update their own institution
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung für diese Institution' 
      });
    }

    const updateData = {
      name,
      address,
      openingTime,
      closingTime
    };

    // Add repeatedClosedDays if provided
    if (repeatedClosedDays) {
      updateData.repeatedClosedDays = repeatedClosedDays;
    }

    const updatedInstitution = await prisma.institution.update({
      where: { id: institutionId },
      data: updateData
    });

    // Log activity
    await logActivity(
      currentUser.id,
      'INSTITUTION_SETTINGS_UPDATED',
      'Institution',
      institutionId,
      `Updated institution settings: ${updatedInstitution.name}`,
      institutionId,
      null
    );

    res.json({
      success: true,
      institution: updatedInstitution,
      message: 'Institutionseinstellungen erfolgreich aktualisiert'
    });

  } catch (err) {
    console.error('Error updating institution settings:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Aktualisieren der Institutionseinstellungen' 
    });
  }
}

// POST /institution-settings/:institutionId/closed-days
async function addClosedDay(req, res) {
  const { institutionId } = req.params;
  const currentUser = req.user;
  const { date, fromDate, toDate, reason, recurrence } = req.body;

  try {
    // Check permissions
    if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can access any institution
    } else if (currentUser.role === 'ADMIN' && currentUser.institutionId === institutionId) {
      // Admin can only access their own institution
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung für diese Institution' 
      });
    }

    // Validate input
    if (!date && (!fromDate || !toDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datum oder Datumsbereich ist erforderlich' 
      });
    }

    // For date ranges, validate that fromDate is before toDate
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from >= to) {
        return res.status(400).json({ 
          success: false, 
          message: 'Startdatum muss vor dem Enddatum liegen' 
        });
      }
    }

    // Check if closed day already exists for the date range
    let existingClosedDay;
    if (date) {
      // Single day check
      existingClosedDay = await prisma.closedDay.findFirst({
        where: {
          institutionId,
          date: new Date(date)
        }
      });
    } else {
      // Date range check - check for any overlap
      existingClosedDay = await prisma.closedDay.findFirst({
        where: {
          institutionId,
          OR: [
            {
              // Check if existing single day falls within new range
              date: {
                gte: new Date(fromDate),
                lte: new Date(toDate)
              }
            },
            {
              // Check if existing range overlaps with new range
              AND: [
                { fromDate: { not: null } },
                { toDate: { not: null } },
                {
                  OR: [
                    {
                      fromDate: { lte: new Date(toDate) },
                      toDate: { gte: new Date(fromDate) }
                    }
                  ]
                }
              ]
            }
          ]
        }
      });
    }

    if (existingClosedDay) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dieser Zeitraum überschneidet sich mit einem bereits geschlossenen Tag' 
      });
    }

    // Create closed day data
    const closedDayData = {
      institutionId,
      reason,
      recurrence: recurrence || 'ONCE'
    };

    if (date) {
      // Single day holiday
      closedDayData.date = new Date(date);
    } else {
      // Date range holiday
      closedDayData.fromDate = new Date(fromDate);
      closedDayData.toDate = new Date(toDate);
    }

    const closedDay = await prisma.closedDay.create({
      data: closedDayData
    });

    // Log activity
    const dateDescription = date 
      ? new Date(date).toLocaleDateString('de-DE')
      : `${new Date(fromDate).toLocaleDateString('de-DE')} - ${new Date(toDate).toLocaleDateString('de-DE')}`;
    
    await logActivity(
      currentUser.id,
      'CLOSED_DAY_ADDED',
      'ClosedDay',
      closedDay.id,
      `Added closed day: ${dateDescription} (${recurrence === 'YEARLY' ? 'Jährlich' : 'Einmalig'})`,
      institutionId,
      null
    );

    res.status(201).json({
      success: true,
      closedDay,
      message: 'Geschlossener Tag erfolgreich hinzugefügt'
    });

  } catch (err) {
    console.error('Error adding closed day:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Hinzufügen des geschlossenen Tages' 
    });
  }
}

// DELETE /institution-settings/:institutionId/closed-days/:closedDayId
async function removeClosedDay(req, res) {
  const { institutionId, closedDayId } = req.params;
  const currentUser = req.user;

  try {
    // Check permissions
    if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can access any institution
    } else if (currentUser.role === 'ADMIN' && currentUser.institutionId === institutionId) {
      // Admin can only access their own institution
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung für diese Institution' 
      });
    }

    const closedDay = await prisma.closedDay.findFirst({
      where: {
        id: closedDayId,
        institutionId
      }
    });

    if (!closedDay) {
      return res.status(404).json({ 
        success: false, 
        message: 'Geschlossener Tag nicht gefunden' 
      });
    }

    await prisma.closedDay.delete({
      where: { id: closedDayId }
    });

    // Log activity
    await logActivity(
      currentUser.id,
      'CLOSED_DAY_REMOVED',
      'ClosedDay',
      closedDayId,
      `Removed closed day: ${closedDay.date.toLocaleDateString('de-DE')}`,
      institutionId,
      null
    );

    res.json({
      success: true,
      message: 'Geschlossener Tag erfolgreich entfernt'
    });

  } catch (err) {
    console.error('Error removing closed day:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Entfernen des geschlossenen Tages' 
    });
  }
}

// GET /institution-settings/:institutionId/stats
async function getInstitutionStats(req, res) {
  const { institutionId } = req.params;
  const currentUser = req.user;

  try {
    // Check permissions
    if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can access any institution
    } else if (currentUser.role === 'ADMIN' && currentUser.institutionId === institutionId) {
      // Admin can only access their own institution
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung für diese Institution' 
      });
    }

    const [
      childrenCount,
      educatorsCount,
      parentsCount,
      groupsCount,
      recentCheckIns,
      recentMessages
    ] = await Promise.all([
      prisma.child.count({ where: { institutionId } }),
      prisma.user.count({ 
        where: { 
          institutionId, 
          role: 'EDUCATOR' 
        } 
      }),
      prisma.user.count({ 
        where: { 
          institutionId, 
          role: 'PARENT' 
        } 
      }),
      prisma.group.count({ where: { institutionId } }),
      prisma.checkInLog.count({
        where: {
          child: { institutionId },
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            { child: { institutionId } },
            { group: { institutionId } }
          ],
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        childrenCount,
        educatorsCount,
        parentsCount,
        groupsCount,
        recentCheckIns,
        recentMessages
      }
    });

  } catch (err) {
    console.error('Error getting institution stats:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Laden der Statistiken' 
    });
  }
}

module.exports = {
  getInstitutionSettings,
  updateInstitutionSettings,
  addClosedDay,
  removeClosedDay,
  getInstitutionStats
}; 