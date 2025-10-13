import { Router } from 'express';
import productController from '../controllers/productController.js';
import { verifyToken, isAdmin } from '../middeware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category_id', productController.getProductsByCategory);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);

// Admin routes - Temporarily disabled for testing
// router.use(verifyToken);
// router.use(isAdmin);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;