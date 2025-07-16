const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/gdpr/request-delete/:userId - Create a GDPR deletion request
const createGDPRRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const requestingUserId = req.user.id;

    if (!reason) {
      return res.status(400).json({ error: 'Grund für die Löschung ist erforderlich' });
    }

    // Check if user exists and is not deleted
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null }
    });

    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Check if there's already a pending request for this user
    const existingRequest = await prisma.gDPRRequest.findFirst({
      where: {
        userId: userId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(409).json({ error: 'Es existiert bereits eine ausstehende Löschanfrage für diesen Benutzer' });
    }

    // Create the GDPR request
    const gdprRequest = await prisma.gDPRRequest.create({
      data: {
        userId: userId,
        reason: reason,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Add activity log entry
    await prisma.activityLog.create({
      data: {
        userId: requestingUserId,
        action: 'GDPR_DELETE_REQUEST_CREATED',
        entity: 'GDPRRequest',
        entityId: gdprRequest.id,
        details: `GDPR Löschanfrage erstellt für Benutzer: ${user.email}`,
        institutionId: user.institutionId
      }
    });

    res.status(201).json({
      message: 'GDPR Löschanfrage erfolgreich erstellt',
      data: gdprRequest
    });

  } catch (error) {
    console.error('Error creating GDPR request:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

// GET /api/gdpr/requests - List all GDPR deletion requests
const getGDPRRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.gDPRRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              institutionId: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.gDPRRequest.count({ where: whereClause })
    ]);

    res.json({
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching GDPR requests:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

// POST /api/gdpr/requests/:requestId/approve - Approve a GDPR deletion request
const approveGDPRRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reviewerId = req.user.id;

    // Find the GDPR request
    const gdprRequest = await prisma.gDPRRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institutionId: true
          }
        }
      }
    });

    if (!gdprRequest) {
      return res.status(404).json({ error: 'GDPR Anfrage nicht gefunden' });
    }

    if (gdprRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Anfrage kann nur genehmigt werden, wenn sie ausstehend ist' });
    }

    // Start a transaction to update request and soft delete user
    const result = await prisma.$transaction(async (tx) => {
      // Update the GDPR request
      const updatedRequest = await tx.gDPRRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewerId,
          reviewedAt: new Date()
        }
      });

      // Soft delete the user
      await tx.user.update({
        where: { id: gdprRequest.userId },
        data: { deletedAt: new Date() }
      });

      // Add activity log entry
      await tx.activityLog.create({
        data: {
          userId: reviewerId,
          action: 'GDPR_DELETE_USER',
          entity: 'User',
          entityId: gdprRequest.userId,
          details: `Benutzer ${gdprRequest.user.email} aufgrund GDPR Anfrage gelöscht`,
          institutionId: gdprRequest.user.institutionId
        }
      });

      return updatedRequest;
    });

    res.json({
      message: 'GDPR Anfrage genehmigt und Benutzer gelöscht',
      data: result
    });

  } catch (error) {
    console.error('Error approving GDPR request:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

// POST /api/gdpr/requests/:requestId/reject - Reject a GDPR deletion request
const rejectGDPRRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const reviewerId = req.user.id;

    if (!reason) {
      return res.status(400).json({ error: 'Grund für die Ablehnung ist erforderlich' });
    }

    // Find the GDPR request
    const gdprRequest = await prisma.gDPRRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institutionId: true
          }
        }
      }
    });

    if (!gdprRequest) {
      return res.status(404).json({ error: 'GDPR Anfrage nicht gefunden' });
    }

    if (gdprRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Anfrage kann nur abgelehnt werden, wenn sie ausstehend ist' });
    }

    // Update the GDPR request
    const updatedRequest = await prisma.gDPRRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reason: `${gdprRequest.reason} | ABGELEHNT: ${reason}`
      }
    });

    // Add activity log entry
    await prisma.activityLog.create({
      data: {
        userId: reviewerId,
        action: 'GDPR_DELETE_REQUEST_REJECTED',
        entity: 'GDPRRequest',
        entityId: requestId,
        details: `GDPR Löschanfrage für ${gdprRequest.user.email} abgelehnt: ${reason}`,
        institutionId: gdprRequest.user.institutionId
      }
    });

    res.json({
      message: 'GDPR Anfrage abgelehnt',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error rejecting GDPR request:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

// GET /api/gdpr/requests/:requestId - Get a specific GDPR request
const getGDPRRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const gdprRequest = await prisma.gDPRRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            institutionId: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!gdprRequest) {
      return res.status(404).json({ error: 'GDPR Anfrage nicht gefunden' });
    }

    res.json({ data: gdprRequest });

  } catch (error) {
    console.error('Error fetching GDPR request:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

module.exports = {
  createGDPRRequest,
  getGDPRRequests,
  approveGDPRRequest,
  rejectGDPRRequest,
  getGDPRRequest
}; 