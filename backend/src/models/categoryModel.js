import pool from '../config/dbConfig.js';

const Category = {
  // Lấy tất cả categories (danh sách phẳng)
  async findAll() {
    const [categories] = await pool.execute(
      'SELECT * FROM categories ORDER BY category_id ASC'
    );
    return categories;
  },
  
  // Lấy category theo ID
  async findById(id) {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE category_id = ?',
      [id]
    );
    return categories.length > 0 ? categories[0] : null;
  },
  
  // Lấy category theo slug
  async findBySlug(slug) {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ?',
      [slug]
    );
    return categories.length > 0 ? categories[0] : null;
  },
  
  // Tạo category mới
  async create(categoryData) {
    const { name, slug, parent_id, description } = categoryData;
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, parent_id, description) VALUES (?, ?, ?, ?)',
      [name, slug, parent_id || null, description || null]
    );
    return this.findById(result.insertId);
  },
  
  // Cập nhật category
  async update(id, categoryData) {
    const { name, slug, parent_id, description } = categoryData;
    await pool.execute(
      'UPDATE categories SET name = ?, slug = ?, parent_id = ?, description = ? WHERE category_id = ?',
      [name, slug, parent_id || null, description || null, id]
    );
    return this.findById(id);
  },
  
  // Xóa category
  async delete(id) {
    // Kiểm tra xem có sản phẩm nào thuộc category này không
    const [products] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );
    
    if (products[0].count > 0) {
      throw new Error('Không thể xóa danh mục đang có sản phẩm');
    }
    
    await pool.execute('DELETE FROM categories WHERE category_id = ?', [id]);
    return { message: 'Category deleted successfully' };
  },
  
  
  // Lấy categories kèm số lượng sản phẩm
  async getCategoriesWithCounts() {
    const [categories] = await pool.execute(`
      SELECT 
        c.category_id,
        c.name,
        c.slug,
        c.description,
        COUNT(CASE WHEN p.is_active = 1 THEN p.product_id END) as product_count
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      GROUP BY c.category_id, c.name, c.slug, c.description
      ORDER BY c.category_id ASC
    `);
    return categories;
  }
};

export default Category;