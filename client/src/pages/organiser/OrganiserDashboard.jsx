import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";

function OrganiserDashboard() {
    return (
        <div>
            <PageHeader
                label="ORGANISER"
                title="Dashboard"
                description="Monitor your events, bookings and attendance."
            />

            <div className="dashboard-stat-grid">
                <DashboardStatCard
                    label="Total events"
                    value="4"
                    description="Across all statuses"
                />

                <DashboardStatCard
                    label="Tickets sold"
                    value="186"
                    description="Confirmed tickets"
                />

                <DashboardStatCard
                    label="Gross revenue"
                    value="UGX 4.8M"
                    description="From confirmed bookings"
                />

                <DashboardStatCard
                    label="Checked in"
                    value="72"
                    description="Attendees recorded"
                />
            </div>

            <section className="dashboard-panel">
                <h2>Recent activity</h2>

                <p>
                    Event and booking activity will appear here
                    after the dashboard API is connected.
                </p>
            </section>
        </div>
    );
}

export default OrganiserDashboard;