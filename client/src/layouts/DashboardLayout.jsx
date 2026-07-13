import { Outlet } from "react-router";

import DashboardSidebar from "../components/dashboard/DashboardSidebar";

function DashboardLayout({ role }) {
    return (
        <div className="dashboard-shell">
            <DashboardSidebar role={role} />

            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;