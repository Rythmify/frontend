import axiosInstance from "../axiosInstance";

export type SubscriptionPlanName = "free" | "premium";

export interface SubscriptionPlan {
  subscription_plan_id: string;
  name: SubscriptionPlanName;
  price: string;
  duration_days: number | null;
  track_limit: number | null;
  playlist_limit: number | null;
}

export interface SubscriptionUsage {
  tracks_uploaded: number;
  track_limit: number | null;
  playlists_created: number;
  playlist_limit: number | null;
  can_upload_track: boolean;
  can_create_playlist: boolean;
  offline_listening_enabled: boolean;
}

export interface MySubscription {
  user_subscription_id: string;
  user_id: string;
  status: "pending" | "active" | "canceled" | "expired";
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  plan: SubscriptionPlan;
  usage: SubscriptionUsage;
}

export interface CheckoutResponse {
  transaction_id: string;
  user_subscription_id: string;
  payment_url: string;
  checkout_status: string;
}

/** GET /subscriptions/me — get the authenticated user's current subscription & plan */
export async function getMySubscription() {
  const res = await axiosInstance.get<{
    data: MySubscription;
    message: string;
  }>("/subscriptions/me");

  return res.data;
}

/** GET /subscriptions/plans — list all available subscription plans */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await axiosInstance.get<{
    data: { items: SubscriptionPlan[] };
    message: string;
  }>("/subscriptions/plans");
  return res.data.data.items;
}

/** POST /subscriptions/checkout — create a pending checkout session */
export async function checkoutSubscription(planId: string): Promise<CheckoutResponse> {
  const res = await axiosInstance.post<{
    data: CheckoutResponse;
    message: string;
  }>("/subscriptions/checkout", { subscription_plan_id: planId });
  return res.data.data;
}

/** POST /subscriptions/mock-confirm/{transactionId} — confirm mocked payment and activate subscription */
export async function confirmMockPayment(transactionId: string): Promise<void> {
  await axiosInstance.post(`/subscriptions/mock-confirm/${transactionId}`);
}

/** POST /subscriptions/cancel — disable auto-renew on the active subscription */
export async function cancelSubscription(): Promise<void> {
  await axiosInstance.post("/subscriptions/cancel");
}

export interface SubscriptionTransaction {
  transaction_id: string;
  user_subscription_id: string;
  amount: string;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
}

/** GET /subscriptions/transactions — list the authenticated user's payment transactions */
export async function getMyTransactions(): Promise<SubscriptionTransaction[]> {
  const res = await axiosInstance.get<{
    data: SubscriptionTransaction[];
    message: string;
    pagination: { limit: number; offset: number; total: number };
  }>("/subscriptions/transactions");
  return res.data.data;
}
