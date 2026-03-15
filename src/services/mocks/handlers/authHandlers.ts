import { http, HttpResponse } from 'msw';
import type { UserSummary, AuthLoginResponseData, AuthRegisterResponseData } from '../../auth.service';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUser: UserSummary = {
  user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  display_name: 'Demo User',
  gender: 'male',
  role: 'listener',
  is_verified: true,
};

const mockTokenPayload: AuthLoginResponseData = {
  access_token: 'mock-access-token-xyz',
  token_type: 'Bearer',
  expires_in: 900,
  user: mockUser,
  is_new_user: false,
};

const mockRegisterData: AuthRegisterResponseData = {
  user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'user@example.com',
  display_name: 'Demo User',
  gender: 'male',
  role: 'listener',
  is_verified: false,
  date_of_birth: '2000-01-01',
  created_at: new Date().toISOString(),
};

// Emails treated as "existing" for the check-email stub
const EXISTING_EMAILS = ['test@test.com', 'user@rythmify.com', 'user@example.com'];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const authHandlers = [

  // POST /auth/register
  http.post('*/auth/register', async ({ request }) => {
    const body = await request.json() as { email?: string; display_name?: string; date_of_birth?: string; gender?: string };
    return HttpResponse.json(
      {
        data: {
          ...mockRegisterData,
          email: body.email ?? mockRegisterData.email,
          display_name: body.display_name ?? mockRegisterData.display_name,
          date_of_birth: body.date_of_birth ?? mockRegisterData.date_of_birth,
          gender: (body.gender ?? mockRegisterData.gender) as 'male' | 'female',
        },
        message: 'Account created. Please verify your email.',
      },
      { status: 201 }
    );
  }),

  // POST /auth/verify-email
  http.post('*/auth/verify-email', () => {
    return HttpResponse.json({
      data: {
        access_token: mockTokenPayload.access_token,
        token_type: mockTokenPayload.token_type,
        expires_in: mockTokenPayload.expires_in,
      },
      message: 'Email verified successfully.',
    });
  }),

  // POST /auth/resend-verification
  http.post('*/auth/resend-verification', () => {
    return HttpResponse.json({
      data: { success: true },
      message: 'If the email exists and is not verified, a verification link has been sent.',
    });
  }),

  // POST /auth/login
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as { identifier?: string };
    const email = body.identifier ?? mockUser.email;
    return HttpResponse.json({
      data: {
        ...mockTokenPayload,
        user: { ...mockUser, email },
      },
      message: 'Logged in successfully.',
    });
  }),

  // POST /auth/logout
  http.post('*/auth/logout', () => {
    return HttpResponse.json({
      data: { success: true },
      message: 'Logged out successfully.',
    });
  }),

  // POST /auth/refresh
  http.post('*/auth/refresh', () => {
    return HttpResponse.json({
      data: {
        access_token: 'mock-refreshed-token-xyz',
        token_type: 'Bearer',
        expires_in: 900,
      },
      message: 'Access token refreshed successfully.',
    });
  }),

  // POST /auth/forgot-password
  http.post('*/auth/forgot-password', () => {
    return HttpResponse.json({
      message: 'If the email exists, a password reset link has been sent.',
    });
  }),

  // POST /auth/reset-password
  http.post('*/auth/reset-password', () => {
    return HttpResponse.json({
      data: { success: true },
      message: 'Password reset successfully.',
    });
  }),

  // POST /auth/change-email
  http.post('*/auth/change-email', () => {
    return HttpResponse.json({
      data: { success: true },
      message: 'Verification email sent to the new address.',
    });
  }),

  // POST /auth/google
  http.post('*/auth/google', () => {
    return HttpResponse.json({
      data: mockTokenPayload,
      message: 'Logged in successfully.',
    });
  }),

  // DELETE /auth/connections/:provider
  http.delete('*/auth/connections/:provider', ({ params }) => {
    const { provider } = params;
    return HttpResponse.json({
      data: { success: true },
      message: `${provider} account disconnected.`,
    });
  }),

  // POST /auth/check-email (no real endpoint — stub for the signin flow)
  http.post('*/auth/check-email', async ({ request }) => {
    const body = await request.json() as { email?: string };
    const email = (body.email ?? '').toLowerCase().trim();
    return HttpResponse.json({
      data: { exists: EXISTING_EMAILS.includes(email) },
    });
  }),
];
