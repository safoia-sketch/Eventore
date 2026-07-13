import { Route, Routes } from "react-router";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
import HomePage from "./pages/public/HomePage";
import EventsPage from "./pages/public/EventsPage";
import AboutPage from "./pages/public/AboutPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Authentication pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Attendee pages
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import MyBookingsPage from "./pages/attendee/MyBookingsPage";
import MyTicketsPage from "./pages/attendee/MyTicketsPage";

// Organiser pages
import OrganiserDashboard from "./pages/organiser/OrganiserDashboard";
import MyEventsPage from "./pages/organiser/MyEventsPage";
import CreateEventPage from "./pages/organiser/CreateEventPage";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import CheckInPage from "./pages/staff/CheckInPage";

// Administrator pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

function App() {
    return (
        <Routes>
            {/* Public pages */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Attendee pages */}
            <Route
                element={<DashboardLayout role="attendee" />}
            >
                <Route
                    path="/attendee"
                    element={<AttendeeDashboard />}
                />

                <Route
                    path="/attendee/bookings"
                    element={<MyBookingsPage />}
                />

                <Route
                    path="/attendee/tickets"
                    element={<MyTicketsPage />}
                />
            </Route>

            {/* Organiser pages */}
            <Route
                element={<DashboardLayout role="organiser" />}
            >
                <Route
                    path="/organiser"
                    element={<OrganiserDashboard />}
                />

                <Route
                    path="/organiser/events"
                    element={<MyEventsPage />}
                />

                <Route
                    path="/organiser/events/new"
                    element={<CreateEventPage />}
                />
            </Route>

            {/* Staff pages */}
            <Route
                element={<DashboardLayout role="staff" />}
            >
                <Route
                    path="/staff"
                    element={<StaffDashboard />}
                />

                <Route
                    path="/staff/check-in"
                    element={<CheckInPage />}
                />
            </Route>

            {/* Administrator pages */}
            <Route
                element={
                    <DashboardLayout role="administrator" />
                }
            >
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/events"
                    element={<AdminEventsPage />}
                />

                <Route
                    path="/admin/users"
                    element={<AdminUsersPage />}
                />
            </Route>
        </Routes>
    );
}

export default App;