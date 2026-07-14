import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";

function AttendeeDashboard() {
    return (
        <div>
            <PageHeader
                label="ATTENDEE"
                title="Your dashboard"
                description="Manage your bookings and digital tickets."
            />

            <div className="dashboard-stat-grid">
                <DashboardStatCard
                    label="Upcoming events"
                    value="3"
                    description="Confirmed bookings"
                />

                <DashboardStatCard
                    label="Active tickets"
                    value="4"
                    description="Ready for check-in"
                />

                <DashboardStatCard
                    label="Past events"
                    value="7"
                    description="Completed experiences"
                />
            </div>

            <section className="dashboard-panel">
                <h2>Next event</h2>

                <p>
                    Your next confirmed event will appear here.
                </p>
            </section>
        </div>
    );
}

export default AttendeeDashboard;