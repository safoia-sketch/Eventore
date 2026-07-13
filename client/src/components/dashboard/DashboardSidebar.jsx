import { NavLink } from "react-router";

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
    const navigation = navigationByRole[role] || [];

    return (
        <aside className="dashboard-sidebar">
            <div>
                <p className="dashboard-logo">EVENTORE</p>

                <p className="dashboard-role">
                    {role}
                </p>
            </div>

            <nav className="dashboard-navigation">
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

            <button
                type="button"
                className="btn btn-eventore-outline w-100"
            >
                Logout
            </button>
        </aside>
    );
}

export default DashboardSidebar;