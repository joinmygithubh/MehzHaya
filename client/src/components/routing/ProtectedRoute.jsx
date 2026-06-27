import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Guards routes that require authentication.
 * Pass `adminOnly` to restrict to admin users.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
