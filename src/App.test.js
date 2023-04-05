import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

describe('App component', () => {
  test('renders login page by default', () => {
    render(
      <Router>
        <App />
      </Router>
    );

    const loginTitle = screen.getByText('STIN 2023 Banka', { selector: 'h3' });
    expect(loginTitle).toBeInTheDocument();

    const clientIdInput = screen.getByLabelText('Číslo klienta');
    expect(clientIdInput).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'Přihlásit' });
    expect(loginButton).toBeInTheDocument();
  });

  test('navigates to verify page after successful login', async () => {
    const loginCallback = jest.fn();

    render(
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={<App />}
          />
          <Route
            exact
            path="/verify"
            element={<div data-testid="verify-page" />}
          />
        </Routes>
      </Router>
    );

    const clientIdInput = screen.getByLabelText('Číslo klienta');
    const loginButton = screen.getByRole('button', { name: 'Přihlásit' });

    userEvent.type(clientIdInput, '123');
    userEvent.click(loginButton);

    // Wait for the navigation to finish
    await screen.findByTestId('verify-page');

    expect(loginCallback).toHaveBeenCalledWith(123);
  });

  test('navigates to account page after successful verification', async () => {
    const loginCode = 123;

    render(
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={<App />}
          />
          <Route
            exact
            path="/verify"
            element={<Verify loginCode={loginCode} />}
          />
          <Route
            exact
            path="/account"
            element={<div data-testid="account-page" />}
          />
        </Routes>
      </Router>
    );

    const verifyButton = screen.getByRole('button', { name: 'Ověřit' });
    userEvent.click(verifyButton);

    // Wait for the navigation to finish
    await screen.findByTestId('account-page');
  });
});
