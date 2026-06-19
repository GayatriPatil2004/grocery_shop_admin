import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard';
import { productService, categoryService, orderService } from '../shared/lib/services';

// Mock Services
vi.mock('../shared/lib/services', () => ({
  productService: {
    getProducts: vi.fn(),
  },
  categoryService: {
    getCategories: vi.fn(),
  },
  orderService: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

describe('Dashboard Component', () => {
  const mockProducts = [
    { id: '1', name: 'Apples', price: 120, category: 'Fruits' },
    { id: '2', name: 'Milk', price: 60, category: 'Dairy' },
  ];

  const mockCategories = [
    { id: 'cat1', name: 'Fruits' },
    { id: 'cat2', name: 'Dairy' },
  ];

  const mockOrders = [
    {
      id: 'ORD-1001',
      customerName: 'Alice Smith',
      mobile: '9876543210',
      address: '123 Main St',
      status: 'Pending',
      products: [{ name: 'Apples', quantity: 2, price: 120 }],
      totalAmount: 240,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    productService.getProducts.mockResolvedValue(mockProducts);
    categoryService.getCategories.mockResolvedValue(mockCategories);
    orderService.getOrders.mockResolvedValue(mockOrders);
  });

  it('displays correct summary statistics on mount', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Verify loading states disappear and totals display
    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Total Categories')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
    });

    // Check statistics values safely
    const countTwoVals = screen.getAllByText('2');
    expect(countTwoVals.length).toBeGreaterThanOrEqual(2); // One for Products, one for Categories

    const orderVals = screen.getAllByText('1');
    expect(orderVals.length).toBeGreaterThanOrEqual(2); // One for Total Orders, one for Today's Orders
  });

  it('renders recent orders table accurately', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getAllByText('ORD-1001').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('9876543210')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('opens order detail modal when view action is clicked', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Find view button
    const viewBtn = screen.getByTitle('View Order Details');
    fireEvent.click(viewBtn);

    // Verify modal elements are displayed
    expect(screen.getByText('Order Details:')).toBeInTheDocument();
    expect(screen.getAllByText('ORD-1001').length).toBeGreaterThanOrEqual(2); // In table and in modal header
    expect(screen.getByText('Customer Info')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Apples')).toBeInTheDocument();
  });
});
