import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/authContext";
import { AIProvider } from "../context/aiContext";
import { CartProvider } from "../context/cartContext";
import { CourseProvider } from "../context/courseContext";
import { InstructorProvider } from "../context/instructorContext";
import { StudentProvider } from "../context/studentContext";
import { PaymentProvider } from "../context/paymentContext";
import { OrderProvider } from "../context/orderContext";

import Index from "../pages/Index";
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import LoadingPage from "../components/LoadingPage";

const AccessDenied = lazy(() => import("../components/AccessDenid"));
const LoginPage = lazy(() => import("../pages/Login"));
const SignupPage = lazy(() => import("../pages/Signup"));
const ResetPWPage = lazy(() => import("../pages/ResetPW"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));

const AppProvidersLayout = () => (
  <AIProvider>
    <CartProvider>
      <CourseProvider>
        <InstructorProvider>
          <StudentProvider>
            <PaymentProvider>
              <OrderProvider>
                <Outlet />
              </OrderProvider>
            </PaymentProvider>
          </StudentProvider>
        </InstructorProvider>
      </CourseProvider>
    </CartProvider>
  </AIProvider>
);

const AuthLayout = ({ roles }: { roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.some((r) => user.roles?.includes(r))) {
    return <AccessDenied />;
  }

  return <Outlet />;
};

export default function Router() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-pw" element={<ResetPWPage />} />

          <Route element={<AppProvidersLayout />}>
            <Route path="/" element={<Index />} />

            <Route element={<AuthLayout roles={["student", "user", "USER"]} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<AuthLayout roles={["admin", "ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
