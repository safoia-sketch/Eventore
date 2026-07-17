import {
    useEffect,
    useState
} from "react";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { organiserApi } from "../../services/api";

function OrganiserDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [sales, setSales] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await organiserApi.getDashboard();

                if (!ignore) {
                    setMetrics(data.metrics);
                    setSales(
                        data.sales_by_ticket_type
                        || []
                    );
                }
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
                    Loading organiser dashboard...
                </p>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                label="ORGANISER"
                title="Dashboard"
                description="Monitor your events, bookings, ticket sales and attendance."
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
                            label="Total events"
                            value={metrics.total_events}
                            description="Across all statuses"
                        />

                        <DashboardStatCard
                            label="Confirmed bookings"
                            value={
                                metrics.confirmed_bookings
                            }
                            description="Active confirmed orders"
                        />

                        <DashboardStatCard
                            label="Tickets sold"
                            value={metrics.tickets_sold}
                            description={`${metrics.tickets_remaining} tickets remaining`}
                        />

                        <DashboardStatCard
                            label="Gross revenue"
                            value={formatMoney(
                                metrics.gross_revenue
                            )}
                            description="From confirmed bookings"
                        />

                        <DashboardStatCard
                            label="Cancelled bookings"
                            value={
                                metrics.cancelled_bookings
                            }
                            description="Attendee cancellations"
                        />

                        <DashboardStatCard
                            label="Checked in"
                            value={metrics.checked_in}
                            description={`${metrics.check_in_rate}% check-in rate`}
                        />
                    </div>

                    <section className="dashboard-panel mt-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                            <div>
                                <p className="eventore-label mb-2">
                                    SALES REPORT
                                </p>

                                <h2 className="mb-1">
                                    Sales by ticket type
                                </h2>

                                <p className="text-muted mb-0">
                                    Confirmed quantities,
                                    remaining inventory and
                                    revenue.
                                </p>
                            </div>
                        </div>

                        {sales.length === 0 ? (
                            <EmptyState
                                title="No ticket data yet"
                                description="Create events and ticket types to see sales information here."
                            />
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Ticket type</th>
                                            <th>Price</th>
                                            <th>Sold</th>
                                            <th>Remaining</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {sales.map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.ticket_type_id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            item.event_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.ticket_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            item.price
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantity_sold
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantity_remaining
                                                        }
                                                        {" / "}
                                                        {
                                                            item.quantity_total
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            item.confirmed_revenue
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default OrganiserDashboard;