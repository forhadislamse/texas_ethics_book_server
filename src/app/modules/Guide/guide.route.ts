
import express from 'express';
import { GuideController } from './guide.controller';
import auth from '../../middlewares/auth';
import checkSubscription from '../../middlewares/checkSubscription';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Publicly accessible for sidebar (maybe some items will have locked flag)
router.get('/chapters', auth(), GuideController.getAllChapters);
router.get('/chapters/:id', auth(), GuideController.getChapterById);

// Protected routes - require subscription
router.get('/sections/:id', auth(), checkSubscription, GuideController.getSectionById);
router.get('/search', auth(), checkSubscription, GuideController.searchGuide);

export const GuideRoutes = router;
