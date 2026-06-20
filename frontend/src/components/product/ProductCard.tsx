import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import Button from '@/components/ui/Button';
import { useAppDispatch } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const categoryName =
    typeof product.category === 'object' ? product.category.name : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
      }),
    );
  };

  return (
    <Link to={`/products/${product._id}`} className="group card overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4">
        {categoryName && (
          <p className="mb-1 text-xs uppercase tracking-wide text-muted">{categoryName}</p>
        )}
        <h3 className="mb-1 line-clamp-1 font-medium">{product.title}</h3>
        <div className="mb-2 flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-muted">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-accent">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
}
