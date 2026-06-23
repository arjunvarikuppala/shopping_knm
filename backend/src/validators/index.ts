import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobile').optional().trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

export const updateProfileValidation = [
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
];

export const addressValidation = [
  body('label').trim().notEmpty().withMessage('Address label is required'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('country').optional().trim().notEmpty(),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('isDefault').optional().isBoolean(),
];

export const productValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('compareAtPrice').optional().isFloat({ min: 0 }),
  body('images').optional().isArray(),
  body('category').notEmpty().withMessage('Category is required').isMongoId(),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('isFeatured').optional().isBoolean(),
  body('isNewArrival').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

export const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('image').optional().isURL(),
  body('isActive').optional().isBoolean(),
];

export const orderValidation = [
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.fullName').trim().notEmpty(),
  body('shippingAddress.street').trim().notEmpty(),
  body('shippingAddress.city').trim().notEmpty(),
  body('shippingAddress.state').trim().notEmpty(),
  body('shippingAddress.zipCode').trim().notEmpty(),
  body('shippingAddress.country').optional().trim().notEmpty(),
  body('shippingAddress.phone').trim().notEmpty(),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'cod'])
    .withMessage('Invalid payment method'),
  body('notes').optional().trim().isLength({ max: 500 }),
];

export const reviewValidation = [
  body('productId').optional().isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Please select a rating.'),
  body('comment').trim().notEmpty().withMessage('Please enter your feedback.').isLength({ max: 250 }),
];

export const mongoIdParam = [param('id').isMongoId().withMessage('Invalid ID')];

export const productQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'rating', 'newest', 'bestselling']),
  query('featured').optional().isBoolean(),
];

export const updateOrderStatusValidation = [
  body('orderStatus')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
  body('trackingNumber').optional().trim(),
];
