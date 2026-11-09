import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { ToastProvider } from './ToastContext';
import App from './App';

test('renders the landing page', () => {
  render(
    <MemoryRouter>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </MemoryRouter>
  );
  const headingElement = screen.getByText(/Our Collection/i);
  expect(headingElement).toBeInTheDocument();
});
