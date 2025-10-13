import Category from '../models/categoryModel.js';

const categoryController = {
  // Lấy tất cả categories
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách danh mục',
        error: error.message
      });
    }
  },
  
  // Lấy category theo ID
  async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin danh mục',
        error: error.message
      });
    }
  },
  
  // Lấy category theo slug
  async getCategoryBySlug(req, res) {
    try {
      const category = await Category.findBySlug(req.params.slug);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin danh mục',
        error: error.message
      });
    }
  },
  
  async createCategory(req, res) {
    try {
      const { name, slug, parent_id, description } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Name and slug are required fields'
        });
      }
      
      const existingCategory = await Category.findBySlug(slug);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
      
      if (parent_id) {
        const parentCategory = await Category.findById(parent_id);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
      }
      
      const category = await Category.create({
        name,
        slug,
        parent_id: parent_id || null,
        description: description || null
      });
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message
      });
    }
  },
  
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, parent_id, description } = req.body;
      
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      if (slug && slug !== existingCategory.slug) {
        const categoryWithSameSlug = await Category.findBySlug(slug);
        if (categoryWithSameSlug && categoryWithSameSlug.category_id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Category with this slug already exists'
          });
        }
      }
      
      if (parent_id) {
        if (parseInt(parent_id) === parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be a parent of itself'
          });
        }
        
        const parentCategory = await Category.findById(parent_id);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
      }
      
      const updatedCategory = await Category.update(id, {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        parent_id: parent_id !== undefined ? parent_id : existingCategory.parent_id,
        description: description !== undefined ? description : existingCategory.description
      });
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message
      });
    }
  },
  
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      await Category.delete(id);
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      const statusCode = error.message.includes('associated products') || 
                        error.message.includes('subcategories') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error deleting category',
        error: error.message
      });
    }
  },
  
  // Lấy categories kèm số lượng sản phẩm
  async getCategoriesWithCounts(req, res) {
    try {
      const categories = await Category.getCategoriesWithCounts();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories with counts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories with counts',
        error: error.message
      });
    }
  }
};

export default categoryController;