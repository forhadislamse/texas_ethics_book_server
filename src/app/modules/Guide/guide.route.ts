
import express from 'express';
import { GuideController } from './guide.controller';
import auth from '../../middlewares/auth';
import checkSubscription from '../../middlewares/checkSubscription';
import { UserRole } from '@prisma/client';

const router = express.Router();

// ─────────────── Public / Authenticated User Routes ───────────────

// Get all chapters with sections (used by Reader Sidebar)
// Keep this open so they can see titles, but detail view is locked
router.get('/chapters', auth(UserRole.USER, UserRole.ADMIN), GuideController.getAllChapters);

// Get a single chapter with its sections (requires subscription check in service)
router.get('/chapters/:id', auth(UserRole.USER, UserRole.ADMIN), GuideController.getChapterById);

// Get all sections (paginated) (requires subscription check in service)
router.get('/sections', auth(UserRole.USER, UserRole.ADMIN), GuideController.getAllSections);

// Get a single section (requires subscription check in service)
router.get('/sections/:id', auth(UserRole.USER, UserRole.ADMIN), GuideController.getSectionById);

// Search guide (requires subscription check in service)
router.get('/search', auth(UserRole.USER, UserRole.ADMIN), GuideController.searchGuide);

// ─────────────── Admin-Only Routes ───────────────

// Create a new chapter
router.post('/chapters', auth(UserRole.ADMIN), GuideController.createChapter);

// Update a chapter by ID
router.patch('/chapters/:id', auth(UserRole.ADMIN), GuideController.updateChapter);

// Delete a chapter by ID (cascades to sections)
router.delete('/chapters/:id', auth(UserRole.ADMIN), GuideController.deleteChapter);

// Create a new section (with internal/external refs)
router.post('/sections', auth(UserRole.ADMIN), GuideController.createSection);

// Update a section by ID
router.patch('/sections/:id', auth(UserRole.ADMIN), GuideController.updateSection);

// Delete a section by ID
router.delete('/sections/:id', auth(UserRole.ADMIN), GuideController.deleteSection);

// ─────────────── Admin-Only Reference Routes ───────────────

// Internal References
router.post('/internal-refs', auth(UserRole.ADMIN), GuideController.createInternalRef);
router.patch('/internal-refs/:id', auth(UserRole.ADMIN), GuideController.updateInternalRef);
router.delete('/internal-refs/:id', auth(UserRole.ADMIN), GuideController.deleteInternalRef);

// External References
router.post('/external-refs', auth(UserRole.ADMIN), GuideController.createExternalRef);
router.patch('/external-refs/:id', auth(UserRole.ADMIN), GuideController.updateExternalRef);
router.delete('/external-refs/:id', auth(UserRole.ADMIN), GuideController.deleteExternalRef);

export const GuideRoutes = router;
