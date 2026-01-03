import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders the main app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/LACUNA \/\/ ENGINE/i);
  expect(headerElement).toBeInTheDocument();
});
