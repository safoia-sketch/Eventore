import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import PageHeader from "../../components/common/PageHeader";

function AdminDashboard() {
    return (
        <div>
            <PageHeader
                label="ADMINISTRATOR"
                title="System dashboard"
                description="Review users, events and platform activity."
            />

            <div className="dashboard-stat-grid">
                <DashboardStatCard
                    label="Total users"
                    value="248"
                    description="Across all roles"
                />

                <DashboardStatCard
                    label="Pending organisers"
                    value="6"
                    description="Awaiting approval"
                />

                <DashboardStatCard
                    label="Pending events"
                    value="9"
                    description="Awaiting review"
                />

                <DashboardStatCard
                    label="Published events"
                    value="27"
                    description="Currently visible"
                />
            </div>

            <section className="dashboard-panel">
                <h2>Administrator actions</h2>

                <p>
                    Pending approvals and system activity will
                    appear here.
                </p>
            </section>
        </div>
    );
}

export default AdminDashboard;