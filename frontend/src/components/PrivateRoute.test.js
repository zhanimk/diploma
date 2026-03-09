import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import PrivateRoute from './PrivateRoute';

const mockStore = configureStore([]);

describe('PrivateRoute', () => {
  it('redirects unauthenticated users to the login page', () => {
    const store = mockStore({ auth: { isAuthenticated: false, loading: false } });
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path='/login' element={<div>Login Page</div>} />
            <Route path='/protected' element={<PrivateRoute><div data-testid="protected-content">Protected Content</div></PrivateRoute>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the component for authenticated users with the correct role', () => {
    const store = mockStore({ auth: { isAuthenticated: true, loading: false, user: { role: 'Admin' } } });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route path='/protected' element={<PrivateRoute role='Admin'><div data-testid="protected-content">Protected Content</div></PrivateRoute>} />
            </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects authenticated users with the incorrect role', () => {
    const store = mockStore({ auth: { isAuthenticated: true, loading: false, user: { role: 'User' } } });
    const { getByText } = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path='/' element={<div>Home Page</div>} />
                    <Route path='/protected' element={<PrivateRoute role='Admin'><div data-testid="protected-content">Protected Content</div></PrivateRoute>} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
    expect(getByText('Home Page')).toBeInTheDocument();
  });
});
