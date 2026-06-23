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
    { name: 'Silk Sarees', slug: 'silk-sarees', description: 'Premium handloomed silk sarees including Kanjivaram and Banarasi masterpieces.' },
    { name: 'Cotton Sarees', slug: 'cotton-sarees', description: 'Breathable and elegant cotton sarees for daily wear and formal occasions.' },
    { name: 'Linen Sarees', slug: 'linen-sarees', description: 'Organic linen sarees that offer comfort with contemporary design.' },
    { name: 'Georgette Sarees', slug: 'georgette-sarees', description: 'Flowy georgette sarees with delicate embellishments and prints.' },
    { name: 'Wedding Collection', slug: 'wedding-collection', description: 'Bridal drapes with rich zari borders and detailed hand embroidery.' },
    { name: 'New Arrivals', slug: 'new-arrivals', description: 'The latest weaves directly from traditional Indian artisans.' }
  ]);

  const products = [
    {
      title: 'Vibrant Crimson Kanjivaram Silk Saree',
      description: 'Handwoven in Kanchipuram, this masterpiece features a brilliant crimson body with intricate gold zari brocade. The pallu showcases traditional peacock and temple motifs, capturing absolute bridal majesty. Perfect for weddings and auspicious occasions.',
      price: 12500,
      compareAtPrice: 16500,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[0]._id, // Silk
      stock: 15,
      rating: 4.9,
      reviewCount: 36,
      isFeatured: true,
      fabric: 'Silk',
      color: 'Red',
      occasion: 'Wedding',
      workType: 'Pure Gold Zari Weaving',
      blousePiece: 'Included - Unstitched Silk Blouse (80cm)',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Imperial Royal Purple Banarasi Saree',
      description: 'Exquisite Banarasi silk saree hand-woven using fine mulberry silk and real zari threads. It displays a majestic floral jaal pattern across the body and an ornate pallu with scalloped edges. A classic heirloom drape for grand events.',
      price: 9800,
      compareAtPrice: 12999,
      images: [
        'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030470298-2c58ecb17e4f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[4]._id, // Wedding
      stock: 8,
      rating: 4.8,
      reviewCount: 14,
      isFeatured: true,
      fabric: 'Silk',
      color: 'Purple',
      occasion: 'Wedding',
      workType: 'Kadhwa Brocade Zari Weaving',
      blousePiece: 'Included - Running Brocade Blouse Piece',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Summer Sky Blue Linen Zari Saree',
      description: 'Woven from premium organic linen, this saree features a soft sky blue hue with a glittering silver zari border. Lightweight, breathable, and incredibly stylish, it transitions smoothly from office meetings to evening socials.',
      price: 2400,
      compareAtPrice: 3500,
      images: [
        'https://images.unsplash.com/photo-1590156221122-c241e7bfcda7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[2]._id, // Linen
      stock: 45,
      rating: 4.4,
      reviewCount: 22,
      isFeatured: true,
      fabric: 'Linen',
      color: 'Blue',
      occasion: 'Daily Wear',
      workType: 'Zari Border with Tassels',
      blousePiece: 'Included - Contrast Plain Linen Blouse Piece',
      washCare: 'Gentle Hand Wash'
    },
    {
      title: 'Forest Green Patola Silk Saree',
      description: 'Crafted with premium silk, this Patola style saree showcases rich geometric ikat patterns across the border and pallu. Its vibrant contrasting colors and traditional heritage design bring timeless festive vibes.',
      price: 8500,
      compareAtPrice: 11000,
      images: [
        'https://images.unsplash.com/photo-1583391733924-a7491d9d95f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[0]._id, // Silk
      stock: 12,
      rating: 4.7,
      reviewCount: 9,
      isFeatured: true,
      fabric: 'Silk',
      color: 'Green',
      occasion: 'Festive',
      workType: 'Ikat Pattern & Gold Border',
      blousePiece: 'Included - Raw Silk Blouse Piece',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Blush Pink Sequined Georgette Saree',
      description: 'Be the highlight of every soirée in this lightweight blush pink georgette saree. Adorned with delicate vertical sequin lines and an embroidered border, it flows beautifully to create an elegant, modern party silhouette.',
      price: 4900,
      compareAtPrice: 6999,
      images: [
        'https://images.unsplash.com/photo-1610030469915-d9124408ce90?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[3]._id, // Georgette
      stock: 20,
      rating: 4.6,
      reviewCount: 18,
      isFeatured: true,
      fabric: 'Georgette',
      color: 'Pink',
      occasion: 'Party Wear',
      workType: 'Vertical Sequins Embroidery',
      blousePiece: 'Included - Satin Blouse Piece with Sequin Border',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Ivory Handloom Jamdani Cotton Saree',
      description: 'Handwoven by skilled weavers using premium organic cotton, this pristine ivory saree features yellow and gold hand-loom floral motifs. A lightweight, elegant classic for warm summer days and festive mornings.',
      price: 2900,
      compareAtPrice: 3999,
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590156221122-c241e7bfcda7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[1]._id, // Cotton
      stock: 30,
      rating: 4.5,
      reviewCount: 11,
      isFeatured: false,
      fabric: 'Cotton',
      color: 'White',
      occasion: 'Daily Wear',
      workType: 'Traditional Jamdani Weaving',
      blousePiece: 'Included - Matching Unstitched Cotton Piece',
      washCare: 'Gentle Hand Wash / Dry Clean'
    },
    {
      title: 'Sunset Orange Organza Silk Saree',
      description: 'Graceful sunset orange organza saree featuring hand-painted floral blooms and gold-bordered edges. Semi-transparent, stiff yet flowing fabric ensures a royal and high-fashion ethnic look.',
      price: 5200,
      compareAtPrice: 7500,
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469915-d9124408ce90?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[5]._id, // New Arrivals (category index 5)
      stock: 14,
      rating: 4.8,
      reviewCount: 25,
      isFeatured: false,
      fabric: 'Silk',
      color: 'Pink',
      occasion: 'Festive',
      workType: 'Hand-painted Flora with Zari Gota',
      blousePiece: 'Included - Contrasting Brocade Piece',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Midnight Blue Designer Georgette Saree',
      description: 'Exquisite midnight blue georgette saree featuring a heavy designer border detailed with intricate mirrors, zari, and thread work. Designed for wedding receptions and grand evening cocktail parties.',
      price: 5900,
      compareAtPrice: 8500,
      images: [
        'https://images.unsplash.com/photo-1610030470298-2c58ecb17e4f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[3]._id, // Georgette
      stock: 25,
      rating: 4.7,
      reviewCount: 30,
      isFeatured: true,
      fabric: 'Georgette',
      color: 'Blue',
      occasion: 'Party Wear',
      workType: 'Resham Embroidery and Real Mirror Border',
      blousePiece: 'Included - Designer Chanderi Blouse Piece',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Maroon Heritage Kanjivaram Bridal Saree',
      description: 'Make your wedding day unforgettable with this crimson maroon Kanjivaram saree. Featuring a thick gold-woven temple border, geometric checks, and a grand heavy pallu featuring mythical gandaberunda and elephant motifs.',
      price: 18500,
      compareAtPrice: 24500,
      images: [
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[4]._id, // Wedding
      stock: 5,
      rating: 5.0,
      reviewCount: 42,
      isFeatured: true,
      fabric: 'Silk',
      color: 'Red',
      occasion: 'Wedding',
      workType: 'Korvai Weaving with Pure Zari',
      blousePiece: 'Included - Grand Heavy Woven Silk Blouse',
      washCare: 'Dry Clean Only'
    },
    {
      title: 'Mint Green Summer Cotton Linen Saree',
      description: 'Extremely light, highly absorbent, and elegant, this mint green cotton linen saree has delicate silver borders and geometric stripes. Excellent for hot summers, daily styling, or festive gatherings.',
      price: 1600,
      compareAtPrice: 2400,
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590156221122-c241e7bfcda7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&w=800&q=80'
      ],
      category: categories[1]._id, // Cotton
      stock: 50,
      rating: 4.3,
      reviewCount: 16,
      isFeatured: false,
      fabric: 'Linen',
      color: 'Green',
      occasion: 'Daily Wear',
      workType: 'Silver Zari Palla and Pom-Poms',
      blousePiece: 'Included - Linen Blend Running Piece',
      washCare: 'Gentle Hand Wash'
    }
  ];

  await Product.insertMany(products);

  console.log('Seed data created successfully');
  console.log('Admin: admin@fashionhub.com / Admin@123');
  console.log('Customer: customer@fashionhub.com / Customer@123');

  await mongoose.disconnect();
};

seed().catch(console.error);
