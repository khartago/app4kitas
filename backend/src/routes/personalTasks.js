const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middlewares/auth');

const prisma = new PrismaClient();

// Get all personal tasks for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.personalTask.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching personal tasks:', error);
    res.status(500).json({ error: 'Fehler beim Laden der persönlichen Aufgaben.' });
  }
});

// Create a new personal task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Titel ist erforderlich.' });
    }

    const task = await prisma.personalTask.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'medium'
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating personal task:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Aufgabe.' });
  }
});

// Update a personal task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, completed } = req.body;

    // Check if task belongs to user
    const existingTask = await prisma.personalTask.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }

    const task = await prisma.personalTask.update({
      where: { id },
      data: updateData
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating personal task:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Aufgabe.' });
  }
});

// Delete a personal task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task belongs to user
    const existingTask = await prisma.personalTask.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden.' });
    }

    await prisma.personalTask.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting personal task:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Aufgabe.' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task belongs to user
    const existingTask = await prisma.personalTask.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden.' });
    }

    const task = await prisma.personalTask.update({
      where: { id },
      data: {
        completed: !existingTask.completed,
        completedAt: !existingTask.completed ? new Date() : null
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({ error: 'Fehler beim Umschalten des Aufgabenstatus.' });
  }
});

module.exports = router; 