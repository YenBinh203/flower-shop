import { Router } from 'express';
import categoryController from '../controllers/categoryController.js';
import { verifyToken, isAdmin } from '../middeware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/with-counts', categoryController.getCategoriesWithCounts);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategoryById);

// Admin routes - Temporarily disabled for testing
// router.use(verifyToken);
// router.use(isAdmin);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;