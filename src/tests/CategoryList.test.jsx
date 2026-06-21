import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryList from '../features/categories/components/CategoryList';
import { categoryService } from '../shared/lib/services';
import toast from 'react-hot-toast';

// Mock Services
vi.mock('../shared/lib/services', () => ({
  categoryService: {
    getCategories: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CategoryList Component', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Fruits', description: 'Fresh orchard fruits', image: 'fruits.jpg' },
    { id: 'cat2', name: 'Dairy', description: 'Organic farm dairy', image: 'dairy.jpg' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.getCategories.mockResolvedValue(mockCategories);
  });

  it('renders categories successfully', async () => {
    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Fresh orchard fruits')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Organic farm dairy')).toBeInTheDocument();
    });
  });

  it('filters categories based on search input', async () => {
    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search categories...');
    fireEvent.change(searchInput, { target: { value: 'Dairy' } });

    expect(screen.queryByText('Fruits')).not.toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
  });

  it('opens CategoryFormModal when Add Category button is clicked', async () => {
    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(addBtn);

    // Verify form fields in modal are rendered via placeholder
    expect(screen.getByText('Create New Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Groceries, Ice Cream, Beverages')).toBeInTheDocument();
    expect(screen.getByText(/Upload Image/i)).toBeInTheDocument();
  });

  it('triggers delete confirmation modal and removes category on confirm', async () => {
    categoryService.deleteCategory.mockResolvedValueOnce();

    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
    });

    // Click delete on the Fruits category
    const deleteButtons = screen.getAllByTitle('Delete Category');
    fireEvent.click(deleteButtons[0]);

    // Verify deletion modal opens
    expect(screen.getByText('Delete Category')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this category/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat1');
      expect(toast.success).toHaveBeenCalledWith('Category removed successfully');
    });
  });
});
