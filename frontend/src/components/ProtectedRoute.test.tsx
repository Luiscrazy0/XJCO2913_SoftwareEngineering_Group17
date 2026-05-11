import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const authMock = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    isLoading: false,
    user: null as null | { id: string; email: string; role: "CUSTOMER" | "MANAGER" },
  },
}));
const showToastMock = vi.hoisted(() => vi.fn());

vi.mock("../context/AuthContext", () => ({
  useAuth: () => authMock.state,
}));

vi.mock("./ToastProvider", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

function renderProtectedRoute(requiredRole?: "CUSTOMER" | "MANAGER") {
  return render(
    <MemoryRouter initialEntries={["/admin?tab=fleet"]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>login page</div>} />
        <Route path="/403" element={<div>forbidden page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    showToastMock.mockReset();
    authMock.state = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
    };
  });

  it("shows a loading indicator while auth state is loading", () => {
    authMock.state = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
    };

    renderProtectedRoute();

    expect(screen.getByLabelText("loading")).toBeInTheDocument();
  });

  it("redirects unauthenticated users and stores the attempted path", async () => {
    renderProtectedRoute();

    await waitFor(() => expect(screen.getByText("login page")).toBeInTheDocument());
    expect(localStorage.getItem("redirect_path")).toBe("/admin?tab=fleet");
  });

  it("allows guest mode for routes without a required role", () => {
    sessionStorage.setItem("guest_mode", "true");

    renderProtectedRoute();

    expect(screen.getByText("protected content")).toBeInTheDocument();
  });

  it("redirects authenticated users with the wrong role", async () => {
    authMock.state = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: "user-1", email: "user@example.com", role: "CUSTOMER" },
    };

    renderProtectedRoute("MANAGER");

    await waitFor(() =>
      expect(screen.getByText("forbidden page")).toBeInTheDocument(),
    );
    expect(showToastMock).toHaveBeenCalledWith(expect.any(String), "error");
  });

  it("renders children for authenticated users with the required role", () => {
    authMock.state = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: "manager-1", email: "manager@example.com", role: "MANAGER" },
    };

    renderProtectedRoute("MANAGER");

    expect(screen.getByText("protected content")).toBeInTheDocument();
  });
});
