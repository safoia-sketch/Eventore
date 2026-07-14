import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";

function StaffDashboard() {
    return (
        <div>
            <PageHeader
                label="STAFF"
                title="Check-in dashboard"
                description="Validate tickets and monitor event arrivals."
            />

            <div className="dashboard-stat-grid">
                <DashboardStatCard
                    label="Assigned events"
                    value="2"
                    description="Available for check-in"
                />

                <DashboardStatCard
                    label="Checked in"
                    value="72"
                    description="Valid entries today"
                />

                <DashboardStatCard
                    label="Rejected"
                    value="3"
                    description="Invalid or used tickets"
                />
            </div>

            <section className="dashboard-panel">
                <h2>Check-in activity</h2>

                <p>
                    Recent ticket validations will appear here.
                </p>
            </section>
        </div>
    );
}

export default StaffDashboard;