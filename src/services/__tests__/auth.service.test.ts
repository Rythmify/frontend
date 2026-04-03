import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { authHandlers } from '../mocks/handlers/authHandlers';
import {
  login,
  register,
  verifyEmail,
  resendVerification,
  logout,
  refreshToken,
  forgotPassword,
  changeEmail,
  googleLogin,
  disconnectProvider,
  checkEmail,
} from '../auth.service';

// MSW Node Server 

const server = setupServer(...authHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

// login

describe('login()', () => {
  it('returns token and user on valid credentials', async () => {
    const result = await login('user@example.com', 'password123');
    expect(result.data.access_token).toBe('mock-access-token-xyz');
    expect(result.data.user.email).toBe('user@example.com');
  });

  it('saves token to localStorage on success', async () => {
    await login('user@example.com', 'password123');
    expect(localStorage.getItem('auth_token')).toBe('mock-access-token-xyz');
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    );
    await expect(login('bad@test.com', 'wrongpass')).rejects.toThrow();
  });
});

//  register() 

describe('register()', () => {
  it('returns new user data on success', async () => {
    const result = await register({
      email: 'newuser@example.com',
      password: 'password123',
      display_name: 'New User',
      gender: 'male',
      date_of_birth: '2000-01-01',
      captcha_token: 'mock-captcha',
    });
    expect(result.data.email).toBe('newuser@example.com');
    expect(result.data.is_verified).toBe(false);
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/register', () =>
        HttpResponse.json({ message: 'Email already in use' }, { status: 409 })
      )
    );
    await expect(
      register({
        email: 'existing@example.com',
        password: 'password123',
        display_name: 'User',
        gender: 'female',
        date_of_birth: '1999-05-15',
        captcha_token: 'mock-captcha',
      })
    ).rejects.toThrow();
  });
});

//  verifyEmail() 

describe('verifyEmail()', () => {
  it('returns access token and saves it', async () => {
    const result = await verifyEmail('valid-token');
    expect(result.data.access_token).toBe('mock-access-token-xyz');
    expect(localStorage.getItem('auth_token')).toBe('mock-access-token-xyz');
  });

  it('throws on invalid/expired token', async () => {
    server.use(
      http.post('*/auth/verify-email', () =>
        HttpResponse.json({ message: 'Token expired or invalid' }, { status: 400 })
      )
    );
    await expect(verifyEmail('bad-token')).rejects.toThrow();
  });
});

//  resendVerification

describe('resendVerification()', () => {
  it('returns success true', async () => {
    const result = await resendVerification('user@example.com', 'mock-captcha');
    expect(result.data.success).toBe(true);
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/resend-verification', () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 })
      )
    );
    await expect(
      resendVerification('user@example.com', 'mock-captcha')
    ).rejects.toThrow();
  });
});

// logout() 

describe('logout()', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', 'some-token');
  });

  it('returns success and clears token from localStorage', async () => {
    const result = await logout();
    expect(result.data.success).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('still clears token even if server errors', async () => {
    server.use(
      http.post('*/auth/logout', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );
    await expect(logout()).rejects.toThrow();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

// refreshToken() 

describe('refreshToken()', () => {
  it('returns new token and saves it', async () => {
    const result = await refreshToken();
    expect(result.data.access_token).toBe('mock-refreshed-token-xyz');
    expect(localStorage.getItem('auth_token')).toBe('mock-refreshed-token-xyz');
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/refresh', () =>
        HttpResponse.json({ message: 'Refresh token expired' }, { status: 401 })
      )
    );
    await expect(refreshToken()).rejects.toThrow();
  });
});

// forgotPassword

describe('forgotPassword()', () => {
  it('resolves with a message', async () => {
    const result = await forgotPassword('user@example.com');
    expect(result.message).toBeTruthy();
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/forgot-password', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    );
    await expect(forgotPassword('user@example.com')).rejects.toThrow();
  });
});

//  resetPassword

// describe('resetPassword()', () => {
//   it('returns success true on valid token', async () => {
//     const result = await resetPassword('valid-reset-token', 'NewPassword123');
//     expect(result.data.success).toBe(true);
//   });

//   it('throws on invalid/expired reset token', async () => {
//     server.use(
//       http.post('*/auth/reset-password', () =>
//         HttpResponse.json({ message: 'Token expired' }, { status: 400 })
//       )
//     );
//     await expect(resetPassword('bad-token', 'NewPassword123')).rejects.toThrow();
//   });
// });

// changeEmail

describe('changeEmail()', () => {
  it('returns success true', async () => {
    const result = await changeEmail('newemail@example.com');
    expect(result.data.success).toBe(true);
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/change-email', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      )
    );
    await expect(changeEmail('newemail@example.com')).rejects.toThrow();
  });
});

//  googleLogin

describe('googleLogin()', () => {
  it('returns token and saves it', async () => {
    const result = await googleLogin('mock-google-id-token');
    expect(result.data.access_token).toBe('mock-access-token-xyz');
    expect(localStorage.getItem('auth_token')).toBe('mock-access-token-xyz');
  });

  it('throws on server error', async () => {
    server.use(
      http.post('*/auth/google', () =>
        HttpResponse.json({ message: 'Invalid Google token' }, { status: 401 })
      )
    );
    await expect(googleLogin('bad-token')).rejects.toThrow();
  });
});

//  disconnectProvider

describe('disconnectProvider()', () => {
  it('returns success true for google', async () => {
    const result = await disconnectProvider('google');
    expect(result.data.success).toBe(true);
  });

  it('throws on server error', async () => {
    server.use(
      http.delete('*/auth/connections/:provider', () =>
        HttpResponse.json({ message: 'Not connected' }, { status: 404 })
      )
    );
    await expect(disconnectProvider('google')).rejects.toThrow();
  });
});


