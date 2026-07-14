import { Route, Routes } from "react-router-dom";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Route protection
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public pages
import HomePage from "./pages/public/HomePage";
import EventsPage from "./pages/public/EventsPage";
import EventDetailsPage from "./pages/public/EventDetailsPage";
import AboutPage from "./pages/public/AboutPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Authentication pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Attendee pages
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import MyBookingsPage from "./pages/attendee/MyBookingsPage";
import MyTicketsPage from "./pages/attendee/MyTicketsPage";
import CheckoutPage from "./pages/attendee/CheckoutPage";
import TicketPage from "./pages/attendee/TicketPage";

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

// import { Route, Routes } from "react-router-dom";


function App() {
    return (
        <Routes>
            {/* Public pages */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />

                <Route
                    path="/events"
                    element={<EventsPage />}
                />

                <Route
                    path="/events/:id"
                    element={<EventDetailsPage />}
                />

                <Route
                    path="/about"
                    element={<AboutPage />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
            </Route>

            {/* Attendee-only booking pages */}
            <Route
                path="/checkout/:eventId"
                element={
                    <ProtectedRoute
                        allowedRoles={["attendee"]}
                    >
                        <CheckoutPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/tickets/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={["attendee"]}
                    >
                        <TicketPage />
                    </ProtectedRoute>
                }
            />

            {/* Attendee dashboard pages */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["attendee"]}
                    >
                        <DashboardLayout role="attendee" />
                    </ProtectedRoute>
                }
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

            {/* Organiser dashboard */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["organiser"]}
                    >
                        <DashboardLayout role="organiser" />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/organiser"
                    element={<OrganiserDashboard />}
                />

                <Route
                    path="/organiser/events"
                    element={
                        <ProtectedRoute
                            allowedRoles={["organiser"]}
                            requireApproval={true}
                        >
                            <MyEventsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/organiser/events/new"
                    element={
                        <ProtectedRoute
                            allowedRoles={["organiser"]}
                            requireApproval={true}
                        >
                            <CreateEventPage />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Staff dashboard pages */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["staff"]}
                    >
                        <DashboardLayout role="staff" />
                    </ProtectedRoute>
                }
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

            {/* Administrator dashboard pages */}
            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["administrator"]}
                    >
                        <DashboardLayout role="administrator" />
                    </ProtectedRoute>
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