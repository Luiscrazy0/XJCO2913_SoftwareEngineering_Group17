import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { authApi } from "../api/auth";
import { queryClient } from "../utils/queryClient";

const navigateMock = vi.hoisted(() => vi.fn());
const showToastMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../components/ToastProvider", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("../api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

function createToken(payload: Record<string, unknown>) {
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encodedPayload}.signature`;
}

function AuthConsumer() {
  const auth = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="email">{auth.user?.email ?? "none"}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <button onClick={() => auth.login("customer@example.com", "secret")}>
        login
      </button>
      <button
        onClick={() =>
          auth.register("new@example.com", "secret", true, "0123456789")
        }
      >
        register
      </button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    showToastMock.mockReset();
    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue();
    vi.spyOn(queryClient, "removeQueries").mockImplementation(() => undefined);
  });

  it("hydrates a valid stored session", async () => {
    localStorage.setItem(
      "auth_token",
      createToken({
        sub: "user-1",
        role: "CUSTOMER",
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    );
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "user-1", email: "stored@example.com", role: "CUSTOMER" }),
    );

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("email")).toHaveTextContent("stored@example.com");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
  });

  it("clears expired stored sessions", async () => {
    localStorage.setItem(
      "auth_token",
      createToken({
        sub: "user-1",
        role: "CUSTOMER",
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
    );
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "user-1", email: "expired@example.com", role: "CUSTOMER" }),
    );

    renderAuthProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("logs in, stores the decoded user, and honors redirect_path", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: createToken({ sub: "manager-1", role: "MANAGER" }),
    });
    localStorage.setItem("redirect_path", "/admin?tab=fleet");

    renderAuthProvider();

    await userEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/admin?tab=fleet", {
        replace: true,
      }),
    );
    expect(JSON.parse(localStorage.getItem("user") ?? "{}")).toEqual({
      id: "manager-1",
      email: "customer@example.com",
      role: "MANAGER",
    });
    expect(localStorage.getItem("redirect_path")).toBeNull();
  });

  it("registers and then logs in the new user", async () => {
    vi.mocked(authApi.register).mockResolvedValue(undefined);
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: createToken({ sub: "new-user", role: "CUSTOMER" }),
    });

    renderAuthProvider();

    await userEvent.click(screen.getByRole("button", { name: "register" }));

    await waitFor(() =>
      expect(authApi.register).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "secret",
        insuranceAcknowledged: true,
        emergencyContact: "0123456789",
      }),
    );
    expect(authApi.login).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "secret",
    });
    expect(navigateMock).toHaveBeenCalledWith("/scooters", { replace: true });
  });

  it("logs out, clears cached auth data, and navigates home", async () => {
    localStorage.setItem(
      "auth_token",
      createToken({ sub: "user-1", role: "CUSTOMER" }),
    );
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "user-1", email: "stored@example.com", role: "CUSTOMER" }),
    );

    renderAuthProvider();
    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "logout" }));
    });

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(queryClient.cancelQueries).toHaveBeenCalled();
    expect(queryClient.removeQueries).toHaveBeenCalledTimes(2);
    expect(showToastMock).toHaveBeenCalledWith(expect.any(String), "success");
    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
  });
});
