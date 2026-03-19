import axiosInstance from "../axiosInstance";

export type SubscriptionPlanName = "free" | "premium";

export interface SubscriptionPlan {
  subscription_plan_id: number;
  name: SubscriptionPlanName;
  price: string;
  duration_days: number | null;
  track_limit: number | null; // null = unlimited (premium)
  playlist_limit: number | null;
}

export interface MySubscription {
  user_subscription_id: number;
  user_id: string;
  status: "pending" | "active" | "canceled" | "expired";
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  plan: SubscriptionPlan;
}

/** GET /subscriptions/me — get the authenticated user's current subscription & plan */
export async function getMySubscription() {
  const res = await axiosInstance.get<{
    data: MySubscription;
    message: string;
  }>("/subscriptions/me");

  return res.data;
}
