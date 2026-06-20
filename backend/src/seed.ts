import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Category, Product } from './models';
import { UserRole } from './types';
import { hashPassword } from './utils/password';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionhub');
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const adminPassword = await hashPassword('Admin@123');
  await User.create({
    name: 'Admin User',
    email: 'admin@fashionhub.com',
    password: adminPassword,
    role: UserRole.ADMIN,
  });

  const customerPassword = await hashPassword('Customer@123');
  await User.create({
    name: 'John Doe',
    email: 'customer@fashionhub.com',
    password: customerPassword,
    role: UserRole.CUSTOMER,
  });

  const categories = await Category.insertMany([
    { name: 'Silk Sarees', slug: 'silk-sarees', description: 'Premium silk sarees for special occasions' },
    { name: 'Cotton Sarees', slug: 'cotton-sarees', description: 'Comfortable daily wear cotton sarees' },
    { name: 'Georgette Sarees', slug: 'georgette-sarees', description: 'Lightweight and flowy georgette sarees' },
    { name: 'Banarasi Sarees', slug: 'banarasi-sarees', description: 'Rich traditional Banarasi sarees' },
    { name: 'Men', slug: 'men', description: 'Men\'s clothing and accessories' },
    { name: 'Women', slug: 'women', description: 'Women\'s clothing and accessories' },
    { name: 'Kids', slug: 'kids', description: 'Kids clothing' },
    { name: 'Accessories', slug: 'accessories', description: 'Bags, belts, and more' },
  ]);

  const products = [
    {
      title: 'Classic White T-Shirt',
      description: 'Premium cotton classic fit t-shirt. Perfect for everyday wear.',
      price: 29.99,
      compareAtPrice: 39.99,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
      category: categories[0]._id,
      stock: 100,
      rating: 4.5,
      reviewCount: 12,
      isFeatured: true,
    },
    {
      title: 'Slim Fit Denim Jeans',
      description: 'Modern slim fit jeans with stretch comfort. Dark wash finish.',
      price: 79.99,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
      category: categories[0]._id,
      stock: 50,
      rating: 4.2,
      reviewCount: 8,
      isFeatured: true,
    },
    {
      title: 'Floral Summer Dress',
      description: 'Lightweight floral print dress perfect for summer occasions.',
      price: 89.99,
      compareAtPrice: 119.99,
      images: ['https://images.unsplash.com/photo-1595777457583-95e059ec5813?w=600'],
      category: categories[1]._id,
      stock: 35,
      rating: 4.8,
      reviewCount: 24,
      isFeatured: true,
    },
    {
      title: 'Leather Crossbody Bag',
      description: 'Genuine leather crossbody bag with adjustable strap.',
      price: 129.99,
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
      category: categories[3]._id,
      stock: 25,
      rating: 4.6,
      reviewCount: 15,
      isFeatured: true,
    },
    {
      title: 'Kids Hoodie',
      description: 'Cozy fleece hoodie for kids. Available in multiple colors.',
      price: 39.99,
      images: ['https://images.unsplash.com/photo-1519238263530-95c2a4e2d2f?w=600'],
      category: categories[2]._id,
      stock: 60,
      rating: 4.3,
      reviewCount: 6,
    },
    {
      title: 'Wool Blend Coat',
      description: 'Elegant wool blend overcoat for the colder months.',
      price: 199.99,
      compareAtPrice: 249.99,
      images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600'],
      category: categories[1]._id,
      stock: 20,
      rating: 4.7,
      reviewCount: 18,
      isFeatured: true,
    },
    {
      title: 'Running Sneakers',
      description: 'Lightweight running shoes with cushioned sole.',
      price: 99.99,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
      category: categories[0]._id,
      stock: 45,
      rating: 4.4,
      reviewCount: 32,
    },
    {
      title: 'Silk Scarf',
      description: 'Luxurious silk scarf with elegant pattern.',
      price: 49.99,
      images: ['https://images.unsplash.com/photo-1601924994987-69f26d08c32d?w=600'],
      category: categories[3]._id,
      stock: 40,
      rating: 4.1,
      reviewCount: 9,
    },
  ];

  await Product.insertMany(products);

  console.log('Seed data created successfully');
  console.log('Admin: admin@fashionhub.com / Admin@123');
  console.log('Customer: customer@fashionhub.com / Customer@123');

  await mongoose.disconnect();
};

seed().catch(console.error);
