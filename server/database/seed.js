const { pool } = require('./connection');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Hash password for admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);
    
    // Insert sample brands
    console.log('📦 Inserting brands...');
    const brands = [
      {
        name: 'Chanel',
        slug: 'chanel',
        description: 'Luxury French fashion house known for haute couture and fragrances',
        country_of_origin: 'France',
        founded_year: 1909
      },
      {
        name: 'Dior',
        slug: 'dior',
        description: 'French luxury goods company with iconic fragrances',
        country_of_origin: 'France',
        founded_year: 1946
      },
      {
        name: 'Tom Ford',
        slug: 'tom-ford',
        description: 'American fashion designer known for sophisticated fragrances',
        country_of_origin: 'United States',
        founded_year: 2006
      },
      {
        name: 'Jo Malone',
        slug: 'jo-malone',
        description: 'British fragrance house known for unique scent combinations',
        country_of_origin: 'United Kingdom',
        founded_year: 1994
      },
      {
        name: 'Byredo',
        slug: 'byredo',
        description: 'Swedish luxury house creating unique fragrances and lifestyle products',
        country_of_origin: 'Sweden',
        founded_year: 2006
      }
    ];
    
    for (const brand of brands) {
      await pool.query(`
        INSERT INTO brands (name, slug, description, country_of_origin, founded_year)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
      `, [brand.name, brand.slug, brand.description, brand.country_of_origin, brand.founded_year]);
    }
    
    // Insert sample categories
    console.log('📂 Inserting categories...');
    const categories = [
      {
        name: 'Women\'s Fragrances',
        slug: 'womens-fragrances',
        description: 'Elegant fragrances designed for women'
      },
      {
        name: 'Men\'s Fragrances',
        slug: 'mens-fragrances',
        description: 'Sophisticated fragrances designed for men'
      },
      {
        name: 'Unisex Fragrances',
        slug: 'unisex-fragrances',
        description: 'Versatile fragrances suitable for all genders'
      },
      {
        name: 'Eau de Parfum',
        slug: 'eau-de-parfum',
        description: 'Concentrated fragrances with long-lasting scent'
      },
      {
        name: 'Eau de Toilette',
        slug: 'eau-de-toilette',
        description: 'Light, refreshing fragrances perfect for daily wear'
      },
      {
        name: 'Perfume Oil',
        slug: 'perfume-oil',
        description: 'Intense, concentrated fragrance oils'
      }
    ];
    
    for (const category of categories) {
      await pool.query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO NOTHING
      `, [category.name, category.slug, category.description]);
    }
    
    // Insert sample users
    console.log('👥 Inserting users...');
    const users = [
      {
        email: 'admin@luxuryperfume.com',
        password_hash: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        is_verified: true,
        is_admin: true
      },
      {
        email: 'user@example.com',
        password_hash: userPassword,
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true
      }
    ];
    
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, is_verified, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, user.password_hash, user.first_name, user.last_name, user.is_verified, user.is_admin]);
    }
    
    // Get brand and category IDs for products
    const brandResult = await pool.query('SELECT id, slug FROM brands');
    const categoryResult = await pool.query('SELECT id, slug FROM categories');
    
    const brandsMap = brandResult.rows.reduce((acc, brand) => {
      acc[brand.slug] = brand.id;
      return acc;
    }, {});
    
    const categoriesMap = categoryResult.rows.reduce((acc, category) => {
      acc[category.slug] = category.id;
      return acc;
    }, {});
    
    // Insert sample products
    console.log('🛍️ Inserting products...');
    const products = [
      {
        name: 'Chanel N°5 Eau de Parfum',
        slug: 'chanel-no5-eau-de-parfum',
        description: 'The most famous fragrance in the world, Chanel N°5 is the epitome of luxury and femininity. A complex blend of rose, jasmine, and aldehydes.',
        short_description: 'Iconic luxury fragrance for women',
        brand_slug: 'chanel',
        category_slug: 'womens-fragrances',
        sku: 'CHN-001',
        price: 135.00,
        compare_at_price: 150.00,
        weight_grams: 50,
        volume_ml: 50,
        stock_quantity: 100,
        is_featured: true,
        is_bestseller: true,
        tags: ['luxury', 'feminine', 'classic', 'rose', 'jasmine']
      },
      {
        name: 'Dior Sauvage Eau de Parfum',
        slug: 'dior-sauvage-eau-de-parfum',
        description: 'A powerful and fresh fragrance that embodies the spirit of freedom and adventure. Notes of bergamot, ambroxan, and cedar.',
        short_description: 'Bold and masculine fragrance for men',
        brand_slug: 'dior',
        category_slug: 'mens-fragrances',
        sku: 'DIR-001',
        price: 95.00,
        compare_at_price: 110.00,
        weight_grams: 60,
        volume_ml: 60,
        stock_quantity: 150,
        is_featured: true,
        is_bestseller: true,
        tags: ['masculine', 'fresh', 'bergamot', 'cedar', 'adventure']
      },
      {
        name: 'Tom Ford Black Orchid',
        slug: 'tom-ford-black-orchid',
        description: 'A mysterious and seductive fragrance with notes of black truffle, black orchid, and patchouli. Perfect for evening wear.',
        short_description: 'Mysterious and seductive unisex fragrance',
        brand_slug: 'tom-ford',
        category_slug: 'unisex-fragrances',
        sku: 'TF-001',
        price: 180.00,
        compare_at_price: 200.00,
        weight_grams: 50,
        volume_ml: 50,
        stock_quantity: 75,
        is_featured: true,
        tags: ['unisex', 'seductive', 'mysterious', 'orchid', 'patchouli']
      },
      {
        name: 'Jo Malone Wood Sage & Sea Salt',
        slug: 'jo-malone-wood-sage-sea-salt',
        description: 'A fresh and invigorating fragrance inspired by the British coast. Notes of ambrette seeds, sea salt, and red algae.',
        short_description: 'Fresh coastal-inspired unisex fragrance',
        brand_slug: 'jo-malone',
        category_slug: 'unisex-fragrances',
        sku: 'JM-001',
        price: 68.00,
        compare_at_price: 75.00,
        weight_grams: 30,
        volume_ml: 30,
        stock_quantity: 120,
        is_new_arrival: true,
        tags: ['fresh', 'coastal', 'unisex', 'sage', 'sea salt']
      },
      {
        name: 'Byredo Gypsy Water',
        slug: 'byredo-gypsy-water',
        description: 'A free-spirited fragrance with notes of bergamot, lemon, incense, and vanilla. Inspired by the bohemian lifestyle.',
        short_description: 'Free-spirited bohemian fragrance',
        brand_slug: 'byredo',
        category_slug: 'unisex-fragrances',
        sku: 'BYR-001',
        price: 190.00,
        compare_at_price: 220.00,
        weight_grams: 50,
        volume_ml: 50,
        stock_quantity: 60,
        is_featured: true,
        tags: ['bohemian', 'free-spirited', 'incense', 'vanilla', 'bergamot']
      }
    ];
    
    for (const product of products) {
      const result = await pool.query(`
        INSERT INTO products (
          name, slug, description, short_description, brand_id, category_id, 
          sku, price, compare_at_price, weight_grams, volume_ml, 
          stock_quantity, is_featured, is_bestseller, is_new_arrival, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [
        product.name, product.slug, product.description, product.short_description,
        brandsMap[product.brand_slug], categoriesMap[product.category_slug],
        product.sku, product.price, product.compare_at_price, product.weight_grams,
        product.volume_ml, product.stock_quantity, product.is_featured,
        product.is_bestseller, product.is_new_arrival, product.tags
      ]);
      
      if (result.rows.length > 0) {
        const productId = result.rows[0].id;
        
        // Insert product images
        await pool.query(`
          INSERT INTO product_images (product_id, image_url, alt_text, is_primary)
          VALUES ($1, $2, $3, $4)
        `, [productId, `/uploads/products/${product.slug}-main.jpg`, `${product.name} - Main Image`, true]);
        
        // Insert product variants
        await pool.query(`
          INSERT INTO product_variants (product_id, variant_type, variant_value, price_adjustment, stock_quantity)
          VALUES 
            ($1, 'size', '30ml', -20.00, $2),
            ($1, 'size', '50ml', 0.00, $2),
            ($1, 'size', '100ml', 30.00, $2)
        `, [productId, product.stock_quantity]);
      }
    }
    
    // Insert sample coupons
    console.log('🎫 Inserting coupons...');
    const coupons = [
      {
        code: 'WELCOME20',
        description: 'Welcome discount for new customers',
        discount_type: 'percentage',
        discount_value: 20.00,
        minimum_order_amount: 50.00,
        usage_limit: 100
      },
      {
        code: 'FREESHIP',
        description: 'Free shipping on orders over $100',
        discount_type: 'fixed_amount',
        discount_value: 15.00,
        minimum_order_amount: 100.00,
        usage_limit: 50
      }
    ];
    
    for (const coupon of coupons) {
      await pool.query(`
        INSERT INTO coupons (
          code, description, discount_type, discount_value, 
          minimum_order_amount, usage_limit
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (code) DO NOTHING
      `, [
        coupon.code, coupon.description, coupon.discount_type,
        coupon.discount_value, coupon.minimum_order_amount, coupon.usage_limit
      ]);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Show summary
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const brandCount = await pool.query('SELECT COUNT(*) FROM brands');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
    
    console.log('\n📊 Database Summary:');
    console.log(`   Products: ${productCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Brands: ${brandCount.rows[0].count}`);
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    console.log('\n🔑 Default Login Credentials:');
    console.log('   Admin: admin@luxuryperfume.com / admin123');
    console.log('   User: user@example.com / user123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };