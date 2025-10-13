import Product from '../models/productModel.js';
import pool from '../config/dbConfig.js';

const productController = {
  async getProducts(req, res) {
    try {
      const { category_id, page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = req.query;
      
      const result = await Product.findAll({
        categoryId: category_id,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order
      });
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  },
  
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  },
  
  async createProduct(req, res) {
    try {
      const { images, ...productData } = req.body;
      
      if (!productData.name || !productData.price || !productData.category_id) {
        return res.status(400).json({
          success: false,
          message: 'Name, price, and category are required fields'
        });
      }
      
      const product = await Product.create(productData, images || []);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  },
  
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { images, ...productData } = req.body;
      
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      const updatedProduct = await Product.update(id, productData, images || []);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  },
  
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      await Product.delete(id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  },
  
  async searchProducts(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const result = await Product.search(q, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching products',
        error: error.message
      });
    }
  },
  
  async getFeaturedProducts(req, res) {
    try {
      const { limit = 8 } = req.query;
      const limitNum = Math.max(1, parseInt(limit));
      
      const sql = `
        SELECT p.*, c.name as category_name,
               (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC
        LIMIT ${limitNum}
      `;
      const [products] = await pool.execute(sql);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured products',
        error: error.message
      });
    }
  },
  
  async getProductsByCategory(req, res) {
    try {
      const { category_id } = req.params;
      const { page = 1, limit = 12, sortBy = 'created_at', order = 'DESC' } = req.query;
      
      const [categories] = await pool.execute('SELECT * FROM categories WHERE category_id = ?', [category_id]);
      if (categories.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      const result = await Product.findAll({
        categoryId: category_id,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order
      });
      
      res.json({
        success: true,
        category: categories[0],
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products by category',
        error: error.message
      });
    }
  },
  
  // Lấy sản phẩm liên quan
  async getRelatedProducts(req, res) {
    try {
      const { id } = req.params; 
      const { limit = 4 } = req.query;
      
      const relatedProducts = await Product.getRelatedProducts(Number(id), parseInt(limit));
      
      res.json({
        success: true,
        data: relatedProducts
      });
    } catch (error) {
      console.error('Get related products error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy sản phẩm liên quan',
        error: error.message
      });
    }
  }
};

export default productController;