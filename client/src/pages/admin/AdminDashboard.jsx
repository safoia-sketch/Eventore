import {
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { adminApi } from "../../services/api";

function AdminDashboard() {
    const [metrics, setMetrics] = useState(null);

    const [upcomingEvents, setUpcomingEvents] =
        useState([]);

    const [categoryActivity, setCategoryActivity] =
        useState([]);

    const [recentUsers, setRecentUsers] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await adminApi.getDashboard();

                if (ignore) {
                    return;
                }

                setMetrics(data.metrics);

                setUpcomingEvents(
                    data.upcoming_events || []
                );

                setCategoryActivity(
                    data.category_activity || []
                );

                setRecentUsers(
                    data.recent_users || []
                );
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.message);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            ignore = true;
        };
    }, []);

    function formatMoney(amount) {
        return `UGX ${Number(
            amount || 0
        ).toLocaleString()}`;
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Unavailable";
        }

        return new Date(dateValue).toLocaleDateString(
            "en-UG",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    function formatTime(timeValue) {
        if (!timeValue) {
            return "";
        }

        return String(timeValue).slice(0, 5);
    }

    function formatRole(role) {
        if (!role) {
            return "Unknown";
        }

        return role.charAt(0).toUpperCase()
            + role.slice(1);
    }

    function getStatusClass(status) {
        switch (status) {
            case "published":
            case "active":
                return "text-bg-success";

            case "pending":
                return "text-bg-warning";

            case "sold_out":
                return "text-bg-dark";

            case "cancelled":
            case "suspended":
                return "text-bg-danger";

            default:
                return "text-bg-secondary";
        }
    }

    if (loading) {
        return (
            <div
                className="text-center py-5"
                role="status"
            >
                <div
                    className="spinner-border"
                    aria-hidden="true"
                />

                <p className="mt-3 mb-0">
                    Loading administrator dashboard...
                </p>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                label="ADMINISTRATOR"
                title="System dashboard"
                description="Review users, events, bookings, payments and platform activity."
            />

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {!error && metrics && (
                <>
                    <div className="dashboard-stat-grid">
                        <DashboardStatCard
                            label="Total users"
                            value={metrics.total_users}
                            description={`${metrics.active_users} active accounts`}
                        />

                        <DashboardStatCard
                            label="Active organisers"
                            value={
                                metrics.active_organisers
                            }
                            description={`${metrics.pending_organisers} awaiting approval`}
                        />

                        <DashboardStatCard
                            label="Published events"
                            value={
                                metrics.published_events
                            }
                            description={`${metrics.pending_events} awaiting review`}
                        />

                        <DashboardStatCard
                            label="Total bookings"
                            value={
                                metrics.total_bookings
                            }
                            description={`${metrics.confirmed_bookings} confirmed`}
                        />

                        <DashboardStatCard
                            label="Successful payments"
                            value={
                                metrics.successful_payments
                            }
                            description="Free and test payments"
                        />

                        <DashboardStatCard
                            label="Platform revenue"
                            value={formatMoney(
                                metrics.total_revenue
                            )}
                            description="Successful paid bookings"
                        />

                        <DashboardStatCard
                            label="Cancelled bookings"
                            value={
                                metrics.cancelled_bookings
                            }
                            description="Recorded cancellations"
                        />

                        <DashboardStatCard
                            label="Total check-ins"
                            value={
                                metrics.total_check_ins
                            }
                            description="Tickets validated by staff"
                        />
                    </div>

                    <section className="dashboard-panel mt-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                            <div>
                                <p className="eventore-label mb-2">
                                    ADMINISTRATOR ACTIONS
                                </p>

                                <h2 className="mb-1">
                                    Approval queues
                                </h2>

                                <p className="text-muted mb-0">
                                    Review pending organisers
                                    and submitted events.
                                </p>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                                <Link
                                    to="/admin/users"
                                    className="btn btn-eventore-outline"
                                >
                                    Manage users
                                    {Number(
                                        metrics.pending_organisers
                                    ) > 0
                                        ? ` (${metrics.pending_organisers})`
                                        : ""}
                                </Link>

                                <Link
                                    to="/admin/events"
                                    className="btn btn-eventore"
                                >
                                    Review events
                                    {Number(
                                        metrics.pending_events
                                    ) > 0
                                        ? ` (${metrics.pending_events})`
                                        : ""}
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-panel mt-4">
                        <div className="mb-4">
                            <p className="eventore-label mb-2">
                                UPCOMING ACTIVITY
                            </p>

                            <h2 className="mb-1">
                                Upcoming events
                            </h2>

                            <p className="text-muted mb-0">
                                Published, sold-out and
                                pending future events.
                            </p>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <EmptyState
                                title="No upcoming events"
                                description="Future platform events will appear here."
                            />
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Organiser</th>
                                            <th>Date</th>
                                            <th>Venue</th>
                                            <th>Bookings</th>
                                            <th>Tickets</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {upcomingEvents.map(
                                            (event) => (
                                                <tr
                                                    key={
                                                        event.event_id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                event.event_name
                                                            }
                                                        </strong>

                                                        <small className="d-block text-muted">
                                                            {
                                                                event.category_name
                                                            }
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {
                                                            event.organiser_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            event.event_date
                                                        )}

                                                        <small className="d-block text-muted">
                                                            {formatTime(
                                                                event.start_time
                                                            )}
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {
                                                            event.venue_name
                                                        }

                                                        <small className="d-block text-muted">
                                                            {
                                                                event.city
                                                            }
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {
                                                            event.confirmed_bookings
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            event.tickets_sold
                                                        }
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${getStatusClass(
                                                                event.status
                                                            )} text-capitalize`}
                                                        >
                                                            {String(
                                                                event.status
                                                            ).replaceAll(
                                                                "_",
                                                                " "
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <div className="row g-4 mt-1">
                        <div className="col-xl-6">
                            <section className="dashboard-panel h-100">
                                <div className="mb-4">
                                    <p className="eventore-label mb-2">
                                        CATEGORIES
                                    </p>

                                    <h2 className="mb-1">
                                        Category activity
                                    </h2>
                                </div>

                                {categoryActivity.length
                                === 0 ? (
                                    <p className="text-muted mb-0">
                                        No category activity
                                        is available yet.
                                    </p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Category
                                                    </th>

                                                    <th>
                                                        Events
                                                    </th>

                                                    <th>
                                                        Bookings
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {categoryActivity.map(
                                                    (
                                                        category
                                                    ) => (
                                                        <tr
                                                            key={
                                                                category.category_id
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    category.category_name
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    category.event_count
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    category.confirmed_bookings
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="col-xl-6">
                            <section className="dashboard-panel h-100">
                                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                    <div>
                                        <p className="eventore-label mb-2">
                                            USERS
                                        </p>

                                        <h2 className="mb-1">
                                            Recent accounts
                                        </h2>
                                    </div>

                                    <Link
                                        to="/admin/users"
                                        className="btn btn-sm btn-eventore-outline"
                                    >
                                        View users
                                    </Link>
                                </div>

                                {recentUsers.length === 0 ? (
                                    <p className="text-muted mb-0">
                                        No user accounts are
                                        available.
                                    </p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {recentUsers.map(
                                                    (user) => (
                                                        <tr
                                                            key={
                                                                user.user_id
                                                            }
                                                        >
                                                            <td>
                                                                <strong>
                                                                    {
                                                                        user.full_name
                                                                    }
                                                                </strong>

                                                                <small className="d-block text-muted">
                                                                    {
                                                                        user.email
                                                                    }
                                                                </small>
                                                            </td>

                                                            <td>
                                                                {formatRole(
                                                                    user.role
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={`badge ${getStatusClass(
                                                                        user.account_status
                                                                    )} text-capitalize`}
                                                                >
                                                                    {
                                                                        user.account_status
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;