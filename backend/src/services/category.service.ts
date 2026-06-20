import { Category } from '../models';
import { NotFoundError } from '../utils/errors';
import { ICategory } from '../models/Category';

export class CategoryService {
  async getAllCategories(includeInactive = false) {
    const query = includeInactive ? {} : { isActive: true };
    return Category.find(query).sort({ name: 1 });
  }

  async getCategoryById(id: string) {
    const category = await Category.findById(id);
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async createCategory(data: Partial<ICategory>) {
    return Category.create(data);
  }

  async updateCategory(id: string, data: Partial<ICategory>) {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new NotFoundError('Category not found');
    return category;
  }

  async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new NotFoundError('Category not found');
    return { message: 'Category deleted successfully' };
  }
}

export const categoryService = new CategoryService();
