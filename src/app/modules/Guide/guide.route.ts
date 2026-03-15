
import express from 'express';
import { GuideController } from './guide.controller';
import auth from '../../middlewares/auth';
import checkSubscription from '../../middlewares/checkSubscription';
import { UserRole } from '@prisma/client';

const router = express.Router();

// ─────────────── Public / Authenticated User Routes ───────────────

// Get all chapters with sections (used by Reader Sidebar)
router.get('/chapters', auth(), GuideController.getAllChapters);

// Get a single chapter with its sections
router.get('/chapters/:id', auth(), GuideController.getChapterById);

// Get a single section (requires subscription)
router.get('/sections/:id', auth(), checkSubscription, GuideController.getSectionById);

// Search guide (requires subscription)
router.get('/search', auth(), checkSubscription, GuideController.searchGuide);

// ─────────────── Admin-Only Routes ───────────────

// Create a new chapter
router.post('/chapters', auth(UserRole.ADMIN), GuideController.createChapter);

// Update a chapter by ID
router.patch('/chapters/:id', auth(UserRole.ADMIN), GuideController.updateChapter);

// Delete a chapter by ID (cascades to sections)
router.delete('/chapters/:id', auth(UserRole.ADMIN), GuideController.deleteChapter);

export const GuideRoutes = router;
