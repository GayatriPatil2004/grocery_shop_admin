import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductList from '../features/products/components/ProductList';
import { productService, categoryService } from '../shared/lib/services';
import toast from 'react-hot-toast';

// Mock Services
vi.mock('../shared/lib/services', () => ({
  productService: {
    getProducts: vi.fn(),
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
  categoryService: {
    getCategories: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProductList Component', () => {
  const mockProducts = [
    { id: '1', name: 'Fresh Red Apples', price: 120, mrp: 150, category: 'Fruits', unit: '1 kg', status: 'In Stock', image: 'apples.jpg' },
    { id: '2', name: 'Organic Whole Milk', price: 60, mrp: 65, category: 'Dairy', unit: '1 L', status: 'Out of Stock', image: 'milk.jpg' },
  ];

  const mockCategories = [
    { id: 'cat1', name: 'Fruits' },
    { id: 'cat2', name: 'Dairy' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    productService.getProducts.mockResolvedValue(mockProducts);
    categoryService.getCategories.mockResolvedValue(mockCategories);
  });

  it('renders products and filters correctly', async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Fresh Red Apples')).toBeInTheDocument();
      expect(screen.getByText('Organic Whole Milk')).toBeInTheDocument();
      expect(screen.getByText('₹120')).toBeInTheDocument();
      expect(screen.getByText('₹60')).toBeInTheDocument();
    });
  });

  it('filters products by search input text', async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Fresh Red Apples')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'Milk' } });

    expect(screen.queryByText('Fresh Red Apples')).not.toBeInTheDocument();
    expect(screen.getByText('Organic Whole Milk')).toBeInTheDocument();
  });

  it('filters products by category dropdown selection', async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Fresh Red Apples')).toBeInTheDocument();
    });

    // Click the custom dropdown button to open it
    const filterBtn = screen.getByRole('button', { name: /All Categories/i });
    fireEvent.click(filterBtn);

    // Click on the 'Dairy' category option button in the dropdown
    const dairyOption = screen.getByRole('button', { name: /Dairy/i });
    fireEvent.click(dairyOption);

    expect(screen.queryByText('Fresh Red Apples')).not.toBeInTheDocument();
    expect(screen.getByText('Organic Whole Milk')).toBeInTheDocument();
  });

  it('toggles product stock availability status', async () => {
    productService.updateProduct.mockResolvedValueOnce();

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Fresh Red Apples')).toBeInTheDocument();
    });

    // Toggle button for availability
    const toggleBtn = screen.getByRole('button', { name: /Available/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalledWith('1', expect.objectContaining({
        id: '1',
        status: 'Out of Stock'
      }));
      expect(toast.success).toHaveBeenCalledWith('Fresh Red Apples marked as Out of Stock');
    });
  });
});
