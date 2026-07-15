import { useState } from "react";
import {
    NavLink,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const navigationByRole = {
    attendee: [
        {
            label: "Dashboard",
            path: "/attendee"
        },
        {
            label: "My Bookings",
            path: "/attendee/bookings"
        },
        {
            label: "My Tickets",
            path: "/attendee/tickets"
        }
    ],

    organiser: [
        {
            label: "Dashboard",
            path: "/organiser"
        },
        {
            label: "My Events",
            path: "/organiser/events"
        },
        {
            label: "Create Event",
            path: "/organiser/events/new"
        }
    ],

    staff: [
        {
            label: "Dashboard",
            path: "/staff"
        },
        {
            label: "Check In",
            path: "/staff/check-in"
        }
    ],

    administrator: [
        {
            label: "Dashboard",
            path: "/admin"
        },
        {
            label: "Event Approvals",
            path: "/admin/events"
        },
        {
            label: "Manage Users",
            path: "/admin/users"
        }
    ]
};

function DashboardSidebar({ role }) {
    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    const [logoutError, setLogoutError] =
        useState("");

    const navigation =
        navigationByRole[role] || [];

    async function handleLogout() {
        try {
            setIsLoggingOut(true);
            setLogoutError("");

            await logout();

            navigate("/login", {
                replace: true
            });
        } catch (error) {
            console.error(
                "Dashboard logout error:",
                error
            );

            setLogoutError(
                "Logout failed. Please try again."
            );
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <aside className="dashboard-sidebar">
            <div>
                <p className="dashboard-logo">
                    EVENTORE
                </p>

                <p className="dashboard-role">
                    {role}
                </p>

                {user && (
                    <div className="dashboard-user">
                        <strong>
                            {user.full_name}
                        </strong>

                        <span>
                            {user.email}
                        </span>
                    </div>
                )}
            </div>

            <nav
                className="dashboard-navigation"
                aria-label={`${role} dashboard navigation`}
            >
                {navigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        className={({ isActive }) =>
                            isActive
                                ? "dashboard-link active"
                                : "dashboard-link"
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div>
                {logoutError && (
                    <p
                        className="registration-error"
                        role="alert"
                    >
                        {logoutError}
                    </p>
                )}

                <button
                    type="button"
                    className="btn btn-eventore-outline w-100"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut
                        ? "Logging out..."
                        : "Logout"}
                </button>
            </div>
        </aside>
    );
}

export default DashboardSidebar;