import {
    Navigate,
    useLocation
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

function ProtectedRoute({
    children,
    allowedRoles = [],
    requireApproval = false
}) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/" replace />;
    }

    if (
        requireApproval &&
        user.role === "organiser" &&
        !user.organiser_approved
    ) {
        return (
            <Navigate
                to="/organiser"
                state={{
                    approvalMessage:
                        "Your organiser account is waiting for administrator approval."
                }}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;