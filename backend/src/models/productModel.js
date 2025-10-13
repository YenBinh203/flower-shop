import pool from '../config/dbConfig.js';

const Product = {
  async findAll({ categoryId, page = 1, limit = 12, sortBy = 'created_at', order = 'DESC' }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;
    
    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images 
              WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1
    `;
    
    const queryParams = [];
    
    if (categoryId) {
      query += ' AND p.category_id = ?';
      queryParams.push(Number(categoryId));
    }
    
    const validSortColumns = ['name', 'price', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY p.${sortColumn} ${sortOrder} LIMIT ${limitNum} OFFSET ${offset}`;
    
    const [products] = await pool.execute(query, queryParams);
    
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = 1';
    if (categoryId) {
      countQuery += ' AND category_id = ?';
    }
    
    const [countResult] = await pool.execute(countQuery, categoryId ? [Number(categoryId)] : []);
    
    return {
      products,
      pagination: {
        total: countResult[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },
  
  async findById(id) {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ?`,
      [id]
    );
    
    if (products.length === 0) {
      return null;
    }
    
    const product = products[0];
    
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
      [id]
    );
    
    product.images = images;
    return product;
  },
  
  async create(productData, images = []) {
    const { name, slug, description, price, category_id, stock_quantity = 0, is_active = 1 } = productData;
    
    if (!slug) {
      throw new Error('Slug là bắt buộc');
    }
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, slug, description, price, category_id, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description || null, price, category_id, stock_quantity, is_active]
    );
    
    const productId = result.insertId;
    
    if (images && images.length > 0) {
      await this.addImages(productId, images);
    }
    
    return this.findById(productId);
  },
  
  async update(id, productData, images = []) {
    // Lấy thông tin sản phẩm hiện tại
    const currentProduct = await this.findById(id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }
    
    // Merge data: giữ giá trị cũ nếu không có giá trị mới
    const updatedData = {
      name: productData.name !== undefined ? productData.name : currentProduct.name,
      slug: productData.slug !== undefined ? productData.slug : currentProduct.slug,
      description: productData.description !== undefined ? productData.description : currentProduct.description,
      price: productData.price !== undefined ? productData.price : currentProduct.price,
      category_id: productData.category_id !== undefined ? productData.category_id : currentProduct.category_id,
      stock_quantity: productData.stock_quantity !== undefined ? productData.stock_quantity : currentProduct.stock_quantity,
      is_active: productData.is_active !== undefined ? productData.is_active : currentProduct.is_active
    };
    
    await pool.execute(
      `UPDATE products 
       SET name = ?, slug = ?, description = ?, price = ?, category_id = ?, 
           stock_quantity = ?, is_active = ?
       WHERE product_id = ?`,
      [updatedData.name, updatedData.slug, updatedData.description, updatedData.price, 
       updatedData.category_id, updatedData.stock_quantity, updatedData.is_active, id]
    );
    
    if (images && images.length > 0) {
      await pool.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      await this.addImages(id, images);
    }
    
    return this.findById(id);
  },
  
  // Xóa sản phẩm
  async delete(id) {
    try {
      // Xóa hình ảnh trước
      await pool.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      // Xóa sản phẩm
      await pool.execute('DELETE FROM products WHERE product_id = ?', [id]);
      return { message: 'Product deleted successfully' };
    } catch (err) {
      if (err && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451)) {
        throw new Error('Không thể xóa sản phẩm vì đang được sử dụng trong đơn hàng');
      }
      throw err;
    }
  },
  
  // Thêm hình ảnh cho sản phẩm
  async addImages(productId, images) {
    if (!images || images.length === 0) return [];
    
    for (const img of images) {
      await pool.execute(
        'INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, ?)',
        [productId, img.image_url, img.alt_text || '', img.is_primary ? 1 : 0]
      );
    }
    
    return this.getProductImages(productId);
  },
  
  // Lấy hình ảnh của sản phẩm
  async getProductImages(productId) {
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
      [productId]
    );
    return images;
  },
  
  // Tìm kiếm sản phẩm
  async search(query, { page = 1, limit = 12 } = {}) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;
    const searchTerm = `%${query}%`;
    
    const searchSql = `
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images 
              WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE (p.name LIKE ? OR p.description LIKE ?) AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const [products] = await pool.execute(searchSql, [searchTerm, searchTerm]);
    
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM products WHERE (name LIKE ? OR description LIKE ?) AND is_active = 1',
      [searchTerm, searchTerm]
    );
    
    return {
      products,
      pagination: {
        total: countResult[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },
  
  // Lấy sản phẩm liên quan
  async getRelatedProducts(productId, limit = 4) {
    const product = await this.findById(productId);
    if (!product) return [];
    
    const limitNum = Math.max(1, parseInt(limit));
    
    const [products] = await pool.execute(
      `SELECT p.*, 
              (SELECT image_url FROM product_images 
               WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = ? AND p.product_id != ? AND p.is_active = 1
       ORDER BY p.created_at DESC
       LIMIT ${limitNum}`,
      [product.category_id, productId]
    );
    
    return products;
  }
};

export default Product;