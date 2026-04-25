import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingCycle = "yearly" | "monthly";
type PaymentMethod = "apple" | "card" | "paypal" | null;

// ─── Icons ───────────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <img
      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAxOSAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik05LjUwMzA5IDBDNi4wMDUyOSAwIDMuMTY5NzYgMi44MzU1MyAzLjE2OTc2IDYuMzMzMzJWOS41SDBWMjMuMDcxNEgxOVY5LjVIMTUuODM2NFY2LjMzMzMyQzE1LjgzNjQgMi44MzU1MyAxMy4wMDA5IDAgOS41MDMwOSAwWk0xMy4xMjEyIDkuNUwxMy4xMjI4IDYuMzMzMzZDMTMuMTIyOCA0LjQ1MjIgMTEuNjg3NSAyLjkwNjI2IDkuODUyMjMgMi43MzA4OUw5LjUwMzY5IDIuNzE0MzJDNy41MDQ5NSAyLjcxNDMyIDUuODg0NjUgNC4zMzQ2MiA1Ljg4NDY1IDYuMzMzMzZMNS44ODIzNSA5LjVIMTMuMTIxMloiIGZpbGw9IiM2NjY2NjYiIGZpbGwtb3BhY2l0eT0iMC43NSIvPgo8L3N2Zz4K"
      alt=""
      className="inline-block h-5 w-4 align-middle"
    />
  );
}

function ReviewPlanLogo() {
  return (
    <img
      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDQ4IDQ4Ij4KICA8ZGVmcy8+CiAgPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMDAwIiByeD0iNCIvPgogIDxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMCkiPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQyIDI3LjI1YTUuMDMgNS4wMyAwIDAxLTUuMSA0LjcySDI0LjYzYy0uNTYgMC0xLjAxLS40Ni0xLjAxLTEuMDFWMTcuODRjLS4wMi0uNDYuMjUtLjg4LjY3LTEuMDYgMCAwIDEuMTMtLjc4IDMuNS0uNzhhOC4xIDguMSAwIDAxNy45NiA2LjRBNC45MyA0LjkzIDAgMDE0MiAyNy4yNXptLTE5LjkxLTguNThjLjM3IDQuNDUuNjMgOC41IDAgMTIuOTRhLjQuNCAwIDAxLS40LjM1LjQuNCAwIDAxLS40LS4zNWMtLjYtNC40LS4zMy04LjUzIDAtMTIuOTRhLjQuNCAwIDAxLjE5LS4zNy40LjQgMCAwMS40MiAwYy4xMy4wOC4yLjIyLjE5LjM3ek0xOS42IDMxLjYxYy0uMDMuMi0uMi4zNi0uNC4zNmEuNDIuNDIgMCAwMS0uNDItLjM2Yy0uNDQtMy43OS0uNDQtNy42MiAwLTExLjQxLjAyLS4yMS4yLS4zNy40MS0uMzcuMjIgMCAuNC4xNi40Mi4zNy41IDMuNzkuNSA3LjYzIDAgMTEuNDF6bS0yLjQ4LTExLjhjLjQgNC4wOC41OCA3LjczIDAgMTEuOGEuNC40IDAgMDEtLjQuMzkuNC40IDAgMDEtLjQtLjRjLS41Ny00LS4zOC03Ljc2IDAtMTEuNzlhLjQuNCAwIDAxLjQtLjM1Yy4yIDAgLjM4LjE1LjQuMzV6bS0yLjUgMTEuOGEuNC40IDAgMDEtLjQuMzcuNC40IDAgMDEtLjQtLjM2IDQxLjQ3IDQxLjQ3IDAgMDEwLTEwLjY2YzAtLjIyLjE4LS40LjQtLjQuMjQgMCAuNDIuMTguNDIuNC40OSAzLjU0LjQ4IDcuMTItLjAxIDEwLjY2em0tMi40OC03Ljk4Yy42MyAyLjc2LjM1IDUuMi0uMDIgOC4wMmEuMzkuMzkgMCAwMS0uMzkuMzIuMzkuMzkgMCAwMS0uMzgtLjMyYy0uMzQtMi43OC0uNjEtNS4yOC0uMDItOC4wMiAwLS4yMy4xOC0uNC40LS40LjIzIDAgLjQxLjE3LjQxLjR6bS0yLjQ4LS40MmMuNTggMi44My4zOSA1LjIyLS4wMSA4LjA3LS4wNS40MS0uNzguNDItLjgyIDAtLjM2LTIuOC0uNTMtNS4yNy0uMDEtOC4wNy4wMi0uMjIuMi0uMzguNDItLjM4LjIyIDAgLjQuMTYuNDIuMzh6bS0yLjUgMS4zN2MuNiAxLjg4LjQgMy40LS4wMyA1LjMzYS40LjQgMCAwMS0uMzkuMzUuNC40IDAgMDEtLjQtLjM1IDExLjM2IDExLjM2IDAgMDEtLjAzLTUuMzNjLjAzLS4yMS4yLS4zOC40Mi0uMzguMjIgMCAuNC4xNy40Mi4zOHoiLz4KICA8L2c+CiAgPGRlZnM+CiAgICA8Y2xpcFBhdGggaWQ9ImNsaXAwIj4KICAgICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgzNnYxNkgweiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNiAxNikiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgo8L3N2Zz4K"
      alt=""
      className="h-14 w-14 flex-shrink-0 rounded-sm object-contain"
    />
  );
}

function ApplePayIcon() {
  return (
    <img
      className="h-7 w-auto"
      src="https://checkout.sndcdn.com/apple-pay-icon-04030e66.svg"
      alt=""
    />
  );
}

function AppleContinueIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 42 35"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.4028,5.5674 C20.6008,4.0684 21.4138,2.0564 21.1998,0.0004 C19.4458,0.0874 17.3058,1.1574 16.0668,2.6564 C14.9538,3.9414 13.9688,6.0374 14.2258,8.0074 C16.1948,8.1784 18.1618,7.0244 19.4028,5.5674"></path>
      <path d="M21.1772,8.3926 C18.3182,8.2226 15.8872,10.0156 14.5212,10.0156 C13.1552,10.0156 11.0642,8.4786 8.8022,8.5196 C5.8592,8.5626 3.1282,10.2276 1.6342,12.8746 C-1.4378,18.1696 0.8232,26.0246 3.8112,30.3376 C5.2622,32.4716 7.0102,34.8206 9.3142,34.7366 C11.4912,34.6506 12.3442,33.3266 14.9902,33.3266 C17.6352,33.3266 18.4042,34.7366 20.7082,34.6936 C23.0972,34.6506 24.5922,32.5586 26.0422,30.4226 C27.7072,27.9906 28.3882,25.6426 28.4312,25.5126 C28.3882,25.4706 23.8232,23.7186 23.7812,18.4676 C23.7382,14.0706 27.3652,11.9786 27.5362,11.8496 C25.4882,8.8196 22.2872,8.4786 21.1772,8.3926"></path>
    </svg>
  );
}

function PayPalIcon() {
  return (
    <img
      className="h-7 w-auto"
      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDxwYXRoCiAgICBkPSJNMzEuMDY4IDkuMzU0aC00LjMwMmEuNjAzLjYwMyAwIDAgMC0uNTkuNTE4bC0xLjc0IDExLjMxNGEuMzY0LjM2NCAwIDAgMCAuMzU0LjQyNGgyLjA1NGMuMjk1IDAgLjU0NS0uMjE5LjU5LS41MThsLjQ3LTMuMDUxYS42MDIuNjAyIDAgMCAxIC41OS0uNTE4aDEuMzYyYzIuODM0IDAgNC40Ny0xLjQwNyA0Ljg5Ni00LjE5NC4xOTMtMS4yMi4wMDktMi4xNzctLjU0OC0yLjg0OC0uNjExLS43MzctMS42OTYtMS4xMjctMy4xMzYtMS4xMjd6bS40OTcgNC4xMzJjLS4yMzYgMS41ODQtMS40MTUgMS41ODQtMi41NTYgMS41ODRoLS42NDlsLjQ1Ni0yLjk1N2EuMzYxLjM2MSAwIDAgMSAuMzU0LS4zMWguMjk3Yy43NzcgMCAxLjUxIDAgMS44ODkuNDU0LjIyNS4yNy4yOTUuNjczLjIwOSAxLjIzek00My45MjggMTMuNDM1aC0yLjA2YS4zNjIuMzYyIDAgMCAwLS4zNTUuMzFsLS4wOS41OTItLjE0NS0uMjE0Yy0uNDQ2LS42NjQtMS40NC0uODg2LTIuNDMzLS44ODYtMi4yNzcgMC00LjIyIDEuNzY4LTQuNiA0LjI0OS0uMTk2IDEuMjM3LjA4MyAyLjQyLjc2OCAzLjI0Ni42MjguNzU4IDEuNTI2IDEuMDc0IDIuNTk1IDEuMDc0IDEuODM0IDAgMi44NTEtMS4yMSAyLjg1MS0xLjIxbC0uMDkyLjU4OGEuMzY1LjM2NSAwIDAgMCAuMzU0LjQyNmgxLjg1NWMuMjk1IDAgLjU0NC0uMjIuNTkxLS41MThsMS4xMTMtNy4yMzJhLjM2My4zNjMgMCAwIDAtLjM1Mi0uNDI1em0tMi44NzIgNC4xMTNjLS4xOTkgMS4yMDctMS4xMzMgMi4wMTctMi4zMjQgMi4wMTctLjU5OSAwLTEuMDc3LS4xOTctMS4zODQtLjU3LS4zMDQtLjM3LS40Mi0uODk3LS4zMjMtMS40ODQuMTg2LTEuMTk3IDEuMTM2LTIuMDM0IDIuMzA5LTIuMDM0LjU4NSAwIDEuMDYuMiAxLjM3My41NzYuMzE0LjM4LjQzOS45MS4zNDkgMS40OTV6TTU0LjkgMTMuNDM1aC0yLjA3MWMtLjE5OCAwLS4zODMuMTAxLS40OTUuMjdsLTIuODU1IDQuMzEzLTEuMjEtNC4xNDVhLjYwMi42MDIgMCAwIDAtLjU3NC0uNDM4SDQ1LjY2YS4zNjcuMzY3IDAgMCAwLS4zNC40ODdsMi4yOCA2Ljg2My0yLjE0MyAzLjEwNGMtLjE2OS4yNDUuMDAxLjU4LjI5Mi41OGgyLjA2OGMuMTk2IDAgLjM4LS4wOTcuNDkxLS4yNjNsNi44ODUtMTAuMTkzYy4xNjUtLjI0NC0uMDA0LS41NzgtLjI5NC0uNTc4eiIKICAgIGZpbGw9IiMyNTNCODAiCiAgLz4KICA8cGF0aAogICAgZD0iTTYxLjc1MyA5LjM1NEg1Ny40NWEuNjAyLjYwMiAwIDAgMC0uNTkuNTE4bC0xLjc0IDExLjMxNGEuMzY0LjM2NCAwIDAgMCAuMzU0LjQyNGgyLjIwOGMuMjA1IDAgLjM4LS4xNTMuNDEzLS4zNjJsLjQ5My0zLjIwN2EuNjAyLjYwMiAwIDAgMSAuNTktLjUxOGgxLjM2MmMyLjgzNCAwIDQuNDY5LTEuNDA3IDQuODk3LTQuMTk0LjE5My0xLjIyLjAwNy0yLjE3Ny0uNTUtMi44NDgtLjYxLS43MzctMS42OTQtMS4xMjctMy4xMzQtMS4xMjd6bS40OTYgNC4xMzJjLS4yMzQgMS41ODQtMS40MTQgMS41ODQtMi41NTUgMS41ODRoLS42NDhsLjQ1Ni0yLjk1N2EuMzYuMzYgMCAwIDEgLjM1My0uMzFoLjI5OGMuNzc2IDAgMS41MSAwIDEuODg4LjQ1NC4yMjYuMjcuMjk1LjY3My4yMDggMS4yM3pNNzQuNjEyIDEzLjQzNWgtMi4wNmEuMzYuMzYgMCAwIDAtLjM1My4zMWwtLjA5LjU5Mi0uMTQ2LS4yMTRjLS40NDUtLjY2NC0xLjQ0LS44ODYtMi40MzItLjg4Ni0yLjI3NiAwLTQuMjIgMS43NjgtNC41OTkgNC4yNDktLjE5NiAxLjIzNy4wODMgMi40Mi43NjcgMy4yNDYuNjI5Ljc1OCAxLjUyNiAxLjA3NCAyLjU5NSAxLjA3NCAxLjgzNCAwIDIuODUxLTEuMjEgMi44NTEtMS4yMWwtLjA5Mi41ODhhLjM2NS4zNjUgMCAwIDAgLjM1NS40MjZoMS44NTVjLjI5NCAwIC41NDQtLjIyLjU5LS41MThsMS4xMTQtNy4yMzJhLjM2NS4zNjUgMCAwIDAtLjM1NS0uNDI1em0tMi44NzIgNC4xMTNjLS4xOTcgMS4yMDctMS4xMzMgMi4wMTctMi4zMjQgMi4wMTctLjU5NyAwLTEuMDc2LS4xOTctMS4zODMtLjU3LS4zMDUtLjM3LS40Mi0uODk3LS4zMjQtMS40ODQuMTg3LTEuMTk3IDEuMTM2LTIuMDM0IDIuMzA5LTIuMDM0LjU4NSAwIDEuMDYuMiAxLjM3NC41NzYuMzE1LjM4LjQ0LjkxLjM0OCAxLjQ5NXpNNzcuMDQgOS42NjVsLTEuNzY1IDExLjUyYS4zNjQuMzY0IDAgMCAwIC4zNTMuNDI1aDEuNzc1Yy4yOTUgMCAuNTQ2LS4yMTkuNTkxLS41MThMNzkuNzM1IDkuNzhhLjM2NS4zNjUgMCAwIDAtLjM1My0uNDI1aC0xLjk4OGEuMzYyLjM2MiAwIDAgMC0uMzU0LjMxeiIKICAgIGZpbGw9IiMxNzlCRDciCiAgLz4KICA8cGF0aAogICAgZD0iTTYuNTcgMjMuODA5bC4zMy0yLjE0My0uNzMzLS4wMThoLTMuNUw1LjEgNS44MzRhLjIxLjIxIDAgMCAxIC4wNjgtLjEyNC4xOTYuMTk2IDAgMCAxIC4xMy0uMDVoNS45YzEuOTU5IDAgMy4zMS40MTkgNC4wMTYgMS4yNDQuMzMxLjM4Ny41NDIuNzkxLjY0NCAxLjIzNy4xMDcuNDY3LjEwOSAxLjAyNS4wMDQgMS43MDVsLS4wMDcuMDV2LjQzNmwuMzMuMTkzYy4yOC4xNTEuNS4zMjUuNjcuNTIzLjI4NC4zMzEuNDY3Ljc1Mi41NDQgMS4yNS4wOC41MTQuMDU0IDEuMTI0LS4wNzcgMS44MTUtLjE1MS43OTUtLjM5NSAxLjQ4Ny0uNzI1IDIuMDUzLS4zMDMuNTIyLS42OS45NTUtMS4xNDggMS4yOS0uNDM4LjMyLS45NTguNTYxLTEuNTQ2LjcxNi0uNTcuMTUzLTEuMjIuMjMtMS45MzIuMjNoLS40NmMtLjMyOCAwLS42NDcuMTItLjg5Ny4zMzhhMS40MzUgMS40MzUgMCAwIDAtLjQ2OC44NTdsLS4wMzUuMTkzLS41ODEgMy43NzctLjAyNy4xMzljLS4wMDYuMDQ0LS4wMTguMDY2LS4wMzYuMDhhLjA5Ni4wOTYgMCAwIDEtLjA2LjAyM0g2LjU3eiIKICAgIGZpbGw9IiMyNTNCODAiCiAgLz4KICA8cGF0aAogICAgZD0iTTE2LjQ5OCA5Ljk0NmMtLjAxOC4xMTYtLjAzOC4yMzQtLjA2LjM1NS0uNzc5IDQuMDk4LTMuNDQgNS41MTMtNi44NCA1LjUxM0g3Ljg2NWEuODQ4Ljg0OCAwIDAgMC0uODMuNzNsLS44ODcgNS43NjYtLjI1IDEuNjM0YS40NS40NSAwIDAgMCAuNDM2LjUyNWgzLjA3YS43NDUuNzQ1IDAgMCAwIC43My0uNjM5bC4wMy0uMTYuNTc5LTMuNzYyLjAzNy0uMjA3YS43NDQuNzQ0IDAgMCAxIC43My0uNjRoLjQ1OWMyLjk3NCAwIDUuMzAzLTEuMjM4IDUuOTg0LTQuODIzLjI4NC0xLjQ5Ny4xMzctMi43NDgtLjYxNi0zLjYyN2EyLjk0NiAyLjk0NiAwIDAgMC0uODQtLjY2NXoiCiAgICBmaWxsPSIjMTc5QkQ3IgogIC8+CiAgPHBhdGgKICAgIGQ9Ik0xNS42ODQgOS42MTRhNi4wMTMgNi4wMTMgMCAwIDAtLjc1Ny0uMTczIDkuMzc5IDkuMzc5IDAgMCAwLTEuNTI2LS4xMTRIOC43NzdhLjcyLjcyIDAgMCAwLS4zMi4wNzQuNzU1Ljc1NSAwIDAgMC0uNDEuNTY2bC0uOTgzIDYuMzkxLS4wMjkuMTg3YS44NDguODQ4IDAgMCAxIC44MzEtLjczaDEuNzMxYzMuNCAwIDYuMDYyLTEuNDE3IDYuODQtNS41MTQuMDI0LS4xMjEuMDQzLS4yNC4wNi0uMzU1YTQuMDkyIDQuMDkyIDAgMCAwLS44MTMtLjMzMnoiCiAgICBmaWxsPSIjMjIyRDY1IgogIC8+CiAgPHBhdGgKICAgIGQ9Ik04LjA0OCA5Ljk2N2EuNzUyLjc1MiAwIDAgMSAuNDEtLjU2NS43MjEuNzIxIDAgMCAxIC4zMTktLjA3NEgxMy40Yy41NDggMCAxLjA2LjAzNyAxLjUyNi4xMTRhNi4wMTMgNi4wMTMgMCAwIDEgLjkzMi4yMjhjLjIzLjA3OC40NDMuMTcuNjQuMjc2LjIzMS0xLjUxNC0uMDAyLTIuNTQ1LS44LTMuNDc4QzE0LjgxOCA1LjQ0IDEzLjIzIDUgMTEuMTk3IDVoLTUuOWEuODUuODUgMCAwIDAtLjgzNC43MzFMMi4wMDYgMjEuNzA4YS41MTYuNTE2IDAgMCAwIC41LjYwMkg2LjE1bC45MTUtNS45NTIuOTg0LTYuMzl6IgogICAgZmlsbD0iIzI1M0I4MCIKICAvPgo8L3N2Zz4="
      alt=""
    />
  );
}

// Card brand logos (simplified)
function CardBrands() {
  return (
    <div className="flex items-center gap-1">
      <img
        className="h-5 w-auto"
        src="https://checkout.sndcdn.com/2-visa-fc798215.svg"
        alt=""
      />
      <img
        className="h-5 w-auto"
        src="https://checkout.sndcdn.com/3-mastercard-7573a453.svg"
        alt=""
      />
      <img
        className="h-5 w-auto"
        src="https://checkout.sndcdn.com/4-american-express-d462b2db.svg"
        alt=""
      />
      <img
        className="h-5 w-auto"
        src="https://checkout.sndcdn.com/5-diners-club-6470c2b0.svg"
        alt=""
      />
      <img
        className="h-5 w-auto"
        src="https://checkout.sndcdn.com/6-jcb-ef963f14.svg"
        alt=""
      />
      <img
        className="h-5 w-auto"
        src="https://checkout.sndcdn.com/7-discover-34ec0e0e.svg"
        alt=""
      />
    </div>
  );
}

// ─── Radio ────────────────────────────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        selected ? "border-[#f50] bg-white" : "border-[#d1d5db] bg-white"
      }`}
    >
      {selected && <div className="h-2.5 w-2.5 rounded-full bg-[#f50]" />}
    </div>
  );
}

// ─── NEW: Shared billing country/postcode/checkbox ────────────────────────────
// Used inside both Card and PayPal expanded sections.

interface BillingExtra {
  country: string;
  postcode: string;
  addBillingAddress: boolean;
}

const COUNTRIES = [
  { value: "EG", label: "Egypt" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "United Arab Emirates" },
];

function BillingExtraFields({
  state,
  onChange,
}: {
  state: BillingExtra;
  onChange: (patch: Partial<BillingExtra>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Billing Country */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-[7px] text-[10px] font-semibold uppercase tracking-wide text-black/40">
          Billing Country
        </div>
        <select
          value={state.country}
          onChange={(e) => onChange({ country: e.target.value })}
          className="w-full appearance-none rounded-sm border border-[#e5e7eb] bg-[#f5f5f5] pb-2 pl-3 pr-8 pt-5 text-[14px] text-black outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40">
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
            <path
              d="M1 1l5 4.5L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Postcode */}
      <input
        type="text"
        placeholder="Postcode (optional)"
        value={state.postcode}
        onChange={(e) => onChange({ postcode: e.target.value })}
        className="w-full rounded-sm border border-[#e5e7eb] bg-[#f5f5f5] px-3 py-3 text-[14px] text-black placeholder:text-black/30 outline-none focus:border-black/40"
      />

      {/* Add billing address checkbox */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <div
          onClick={() =>
            onChange({ addBillingAddress: !state.addBillingAddress })
          }
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border-2 ${
            state.addBillingAddress
              ? "border-black bg-black"
              : "border-[#d1d5db] bg-white"
          }`}
        >
          {state.addBillingAddress && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path
                d="M1 3.5l2.5 2.5L8 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span
          className="text-[14px] text-black/70"
          onClick={() =>
            onChange({ addBillingAddress: !state.addBillingAddress })
          }
        >
          Add billing address (visible on invoice)
        </span>
      </label>
    </div>
  );
}

// ─── NEW: Card expanded form ──────────────────────────────────────────────────

interface CardFormState extends BillingExtra {
  firstName: string;
  lastName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface CardFieldErrors {
  firstName?: string;
  lastName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

function AlertCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0 text-[#c0392b]"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v4M12 16h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardExpandedForm({
  form,
  errors,
  onChange,
}: {
  form: CardFormState;
  errors: CardFieldErrors;
  onChange: (patch: Partial<CardFormState>) => void;
}) {
  const base =
    "w-full rounded-sm border bg-[#f5f5f5] px-3 py-3 text-[14px] text-black placeholder:text-black/30 outline-none";
  const normal = `${base} border-[#e5e7eb] focus:border-black/40`;
  const errored = `${base} border-[#c0392b]`;

  return (
    <div className="flex flex-col gap-3">
      {/* First name */}
      <div>
        <input
          type="text"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          className={errors.firstName ? errored : normal}
        />
        {errors.firstName && (
          <p className="mt-1 text-[12px] text-[#c0392b]">{errors.firstName}</p>
        )}
      </div>

      {/* Last name */}
      <div>
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          className={errors.lastName ? errored : normal}
        />
        {errors.lastName && (
          <p className="mt-1 text-[12px] text-[#c0392b]">{errors.lastName}</p>
        )}
      </div>

      {/* Card number */}
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="Card number"
            value={form.cardNumber}
            onChange={(e) =>
              onChange({
                cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16),
              })
            }
            className={`${errors.cardNumber ? errored : normal} pr-14`}
          />
          <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {errors.cardNumber && <AlertCircleIcon />}
            <svg
              width="22"
              height="16"
              viewBox="0 0 34 24"
              fill="none"
              className="opacity-25"
            >
              <rect width="34" height="24" rx="3" fill="#888" />
              <rect y="6" width="34" height="6" fill="#555" />
              <rect x="4" y="16" width="8" height="3" rx="1" fill="#aaa" />
            </svg>
          </div>
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-[12px] text-[#c0392b]">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry month / year / CVV */}
      <div className="grid grid-cols-3 gap-3">
        {/* Month */}
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Expiration month"
              value={form.expiryMonth}
              onChange={(e) =>
                onChange({
                  expiryMonth: e.target.value.replace(/\D/g, "").slice(0, 2),
                })
              }
              className={`${errors.expiryMonth ? errored : normal} pr-8`}
            />
            {errors.expiryMonth && (
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <AlertCircleIcon />
              </div>
            )}
          </div>
          {errors.expiryMonth && (
            <p className="mt-1 text-[12px] text-[#c0392b]">
              {errors.expiryMonth}
            </p>
          )}
        </div>
        {/* Year */}
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Expiration year"
              value={form.expiryYear}
              onChange={(e) =>
                onChange({
                  expiryYear: e.target.value.replace(/\D/g, "").slice(0, 4),
                })
              }
              className={`${errors.expiryYear ? errored : normal} pr-8`}
            />
            {errors.expiryYear && (
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <AlertCircleIcon />
              </div>
            )}
          </div>
          {errors.expiryYear && (
            <p className="mt-1 text-[12px] text-[#c0392b]">
              {errors.expiryYear}
            </p>
          )}
        </div>
        {/* CVV */}
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="CVV"
              value={form.cvv}
              onChange={(e) =>
                onChange({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              className={`${errors.cvv ? errored : normal} pr-8`}
            />
            {errors.cvv && (
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <AlertCircleIcon />
              </div>
            )}
          </div>
          {errors.cvv && (
            <p className="mt-1 text-[12px] text-[#c0392b]">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Billing country / postcode / checkbox */}
      <BillingExtraFields
        state={{
          country: form.country,
          postcode: form.postcode,
          addBillingAddress: form.addBillingAddress,
        }}
        onChange={(patch) => onChange(patch)}
      />
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

function PageFooter() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSignOut = () => {
    logout();
    navigate("/logout");
  };

  return (
    <footer className="mt-16 w-full px-6 py-6 text-[12px] text-slate-400 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-3">
        <p className="m-0">
          Signed in as {user?.displayName ?? user?.username ?? "User"}.{" "}
          <button
            type="button"
            onClick={handleSignOut}
            className="cursor-pointer border-0 bg-transparent p-0 text-[#ff5500] no-underline"
          >
            Sign out
          </button>
        </p>
        <div className="border-t border-[#e5e7eb] pt-3" />
        <nav className="flex flex-wrap gap-5">
          {[
            "Legal",
            "Privacy",
            "Cookies",
            "Consent Manager",
            "Imprint",
            "Help Center",
          ].map((link) => (
            <a key={link} href="#" className="text-slate-400 no-underline">
              {link}
            </a>
          ))}
        </nav>
        <select className="w-fit cursor-pointer rounded border border-[#e5e7eb] bg-transparent px-2 py-1 text-[12px] text-slate-400">
          <option>English (US)</option>
        </select>
      </div>
    </footer>
  );
}

export default function CheckoutPage() {
  const [billing, setBilling] = useState<BillingCycle>("yearly");
  const [payment, setPayment] = useState<PaymentMethod>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  // NEW: card form state
  const [cardForm, setCardForm] = useState<CardFormState>({
    firstName: "",
    lastName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    country: "EG",
    postcode: "",
    addBillingAddress: false,
  });
  const [cardErrors] = useState<CardFieldErrors>({});

  // NEW: paypal billing extra state
  const [paypalBilling, setPaypalBilling] = useState<BillingExtra>({
    country: "EG",
    postcode: "",
    addBillingAddress: false,
  });

  const yearlyTotal = "EGP 359.88";
  const monthlyTotal = "EGP 59.99/month";
  const displayTotal = billing === "yearly" ? yearlyTotal : monthlyTotal;
  const renewDate = "Apr 25, 2027";

  // NEW: CTA button label + style based on payment method
  const ctaLabel =
    payment === "apple"
      ? "Continue with"
      : payment === "paypal"
        ? "Continue with PayPal"
        : "Buy subscription";

  const ctaLegalVerb =
    payment === "apple"
      ? "Continue with Apple Pay"
      : payment === "paypal"
        ? "Continue with PayPal"
        : "Buy subscription";

  const ctaClassName = [
    "flex w-full items-center justify-center rounded-sm py-4 text-[16px] font-semibold text-white transition-opacity",
    payment === "apple"
      ? "bg-black cursor-pointer hover:opacity-80"
      : payment === "paypal"
        ? "bg-[#0070ba] cursor-pointer hover:opacity-90"
        : payment === "card"
          ? "bg-[#6b7280] cursor-pointer hover:opacity-80"
          : "bg-[#9ca3af] cursor-not-allowed",
  ].join(" ");

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1000px] px-6 pb-20 pt-12 md:px-10">
        {/* Page title */}
        <h1 className="mb-10 text-[28px] font-black tracking-[-0.03em] text-black">
          Get Artist
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* ── Left column ── */}
          <div className="flex flex-1 flex-col gap-8">
            {/* 1. Billing cycle */}
            <section>
              <h2 className="mb-4 text-[18px] font-bold text-black">
                1. Billing cycle
              </h2>

              {/* Yearly option */}
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`mb-3 flex w-full items-center gap-4 rounded-sm border-2 px-4 py-4 text-left transition-colors ${
                  billing === "yearly"
                    ? "border-[#f50]"
                    : "border-[#e5e7eb] hover:border-black/20"
                }`}
              >
                <RadioDot selected={billing === "yearly"} />
                <div className="flex flex-1 flex-col">
                  <span className="text-[16px] font-bold text-black">
                    Yearly billing
                  </span>
                  <span className="text-[14px] text-black/50">
                    EGP 359.88, that's EGP 29.99/month
                  </span>
                </div>
                <span
                  className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] ${
                    billing === "yearly"
                      ? "bg-[#f50] text-white"
                      : "bg-[#e5e7eb] text-[#6b7280]"
                  }`}
                >
                  50% YEARLY DISCOUNT
                </span>
              </button>

              {/* Monthly option */}
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`flex w-full items-center gap-4 rounded-sm border-2 px-4 py-4 text-left transition-colors ${
                  billing === "monthly"
                    ? "border-[#f50]"
                    : "border-[#e5e7eb] hover:border-black/20"
                }`}
              >
                <RadioDot selected={billing === "monthly"} />
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold text-black">
                    Monthly billing
                  </span>
                  <span className="text-[14px] text-black/50">
                    EGP 59.99/month
                  </span>
                </div>
              </button>
            </section>

            {/* 2. Payment details */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-[18px] font-bold text-black">
                2. Payment details <LockIcon />
              </h2>
              <p className="mb-3 text-[14px] font-semibold text-black">
                Add new payment methods
              </p>

              {/* Apple Pay — no expanded content */}
              <button
                type="button"
                onClick={() => setPayment("apple")}
                className={`mb-3 flex w-full items-center gap-4 rounded-sm border-2 px-4 py-4 text-left transition-colors ${
                  payment === "apple"
                    ? "border-[#f50]"
                    : "border-[#e5e7eb] hover:border-black/20"
                }`}
              >
                <RadioDot selected={payment === "apple"} />
                  <span className="flex-1 text-[16px] font-semibold text-black">
                    Apple Pay
                  </span>
                <ApplePayIcon />
              </button>

              {/* Card — expands card form below when selected */}
              <div
                className={`mb-3 rounded-sm border-2 transition-colors ${
                  payment === "card"
                    ? "border-[#f50]"
                    : "border-[#e5e7eb] hover:border-black/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPayment("card")}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left"
                >
                  <RadioDot selected={payment === "card"} />
                  <span className="flex-1 text-[16px] font-semibold text-black">
                    Card
                  </span>
                  <CardBrands />
                </button>
                {payment === "card" && (
                  <div className="border-t border-[#e5e7eb] px-4 pb-5 pt-4">
                    <CardExpandedForm
                      form={cardForm}
                      errors={cardErrors}
                      onChange={(patch) =>
                        setCardForm((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* PayPal — expands billing country/postcode/checkbox when selected */}
              <div
                className={`rounded-sm border-2 transition-colors ${
                  payment === "paypal"
                    ? "border-[#f50]"
                    : "border-[#e5e7eb] hover:border-black/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPayment("paypal")}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left"
                >
                  <RadioDot selected={payment === "paypal"} />
                  <span className="flex-1 text-[16px] font-semibold text-black">
                    PayPal
                  </span>
                  <PayPalIcon />
                </button>
                {payment === "paypal" && (
                  <div className="border-t border-[#e5e7eb] px-4 pb-5 pt-4">
                    <BillingExtraFields
                      state={paypalBilling}
                      onChange={(patch) =>
                        setPaypalBilling((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Right column ── */}
          <div className="w-full lg:w-[340px] lg:flex-shrink-0">
              <h2 className="mb-4 text-[18px] font-bold text-black">
              3. Review your purchase
            </h2>

            {/* Plan card */}
            <div className="mb-4 flex items-center gap-3">
              <ReviewPlanLogo />
                <span className="text-[17px] font-bold text-black">Artist</span>
            </div>

            {/* Coupon */}
            <div className="mb-4">
              {!couponOpen ? (
                <button
                  type="button"
                  onClick={() => setCouponOpen(true)}
                  className="cursor-pointer border-0 bg-transparent p-0 text-[14px] font-semibold text-[#0066cc] no-underline hover:underline"
                >
                  Do you have a coupon code?
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-sm border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    className="rounded-sm bg-black px-3 py-2 text-[14px] font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Summary box */}
            <div className="mb-4 rounded-sm bg-[#f7f7f7] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-semibold text-black">
                  Total
                </span>
                <span className="text-[14px] font-bold text-black">
                  {displayTotal}
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[14px] text-black/60">Billing cycle</span>
                <span className="text-[14px] font-semibold capitalize text-black">
                  {billing}
                </span>
              </div>
              <p className="m-0 text-[13px] leading-[1.55] text-black/50">
                Subscription will automatically renew at {displayTotal} every{" "}
                {billing === "yearly" ? "year" : "month"}, starting {renewDate},
                unless you cancel before the day of your next renewal in your
                subscription settings.
              </p>
              <p className="mb-0 mt-3 text-[13px] text-black/40">
                All prices in EGP
              </p>
            </div>

            {/* Buy button — label + colour change per payment method */}
            <button
              type="button"
              disabled={!payment}
              className={ctaClassName}
            >
              {payment === "apple" ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <span>{ctaLabel}</span>
                  <AppleContinueIcon />
                  <span>Pay</span>
                </span>
              ) : (
                <span>{ctaLabel}</span>
              )}
            </button>

            {/* Legal — verb matches button label */}
            <p className="mt-3 text-[12px] leading-[1.6] text-black/40">
              By submitting your payment information and clicking {ctaLegalVerb}{" "}
              you agree to the{" "}
              <a href="#" className="text-[#0066cc]">
                Terms of Use for Artist Subscriptions
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#0066cc]">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
