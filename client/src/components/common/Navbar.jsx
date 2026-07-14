import { useState } from "react";
import {
    Link,
    NavLink,
    useNavigate
} from "react-router-dom";

import eventoreLogo from "../../assets/images/Eventore_logo.png";
import { useAuth } from "../../context/AuthContext";

const dashboardPaths = {
    attendee: "/attendee",
    organiser: "/organiser",
    staff: "/staff",
    administrator: "/admin"
};

function Navbar() {
    const navigate = useNavigate();

    const {
        user,
        loading,
        logout
    } = useAuth();

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    function closeMenu() {
        setMenuOpen(false);
    }

    function getNavLinkClass({ isActive }) {
        return isActive
            ? "nav-link active"
            : "nav-link";
    }

    async function handleLogout() {
        try {
            setIsLoggingOut(true);

            await logout();

            closeMenu();
            navigate("/login", {
                replace: true
            });
        } catch (error) {
            console.error(
                "Unable to log out:",
                error
            );
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <header className="eventore-header">
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <Link
                        to="/"
                        className="navbar-brand"
                        onClick={closeMenu}
                        aria-label="Eventore homepage"
                    >
                        <img
                            src={eventoreLogo}
                            alt="Eventore"
                            className="eventore-logo"
                        />
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                (current) => !current
                            )
                        }
                        aria-controls="eventore-navigation"
                        aria-expanded={menuOpen}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div
                        id="eventore-navigation"
                        className={`collapse navbar-collapse ${
                            menuOpen ? "show" : ""
                        }`}
                    >
                        <ul className="navbar-nav mx-auto gap-lg-3">
                            <li className="nav-item">
                                <NavLink
                                    to="/"
                                    end
                                    className={
                                        getNavLinkClass
                                    }
                                    onClick={closeMenu}
                                >
                                    Home
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/events"
                                    className={
                                        getNavLinkClass
                                    }
                                    onClick={closeMenu}
                                >
                                    Explore Events
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/about"
                                    className={
                                        getNavLinkClass
                                    }
                                    onClick={closeMenu}
                                >
                                    About
                                </NavLink>
                            </li>
                        </ul>

                        {!loading && (
                            <div className="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
                                {user ? (
                                    <>
                                        <Link
                                            to={
                                                dashboardPaths[
                                                    user.role
                                                ] || "/"
                                            }
                                            className="btn btn-eventore-outline btn-sm"
                                            onClick={
                                                closeMenu
                                            }
                                        >
                                            Dashboard
                                        </Link>

                                        <button
                                            type="button"
                                            className="btn btn-eventore btn-sm"
                                            onClick={
                                                handleLogout
                                            }
                                            disabled={
                                                isLoggingOut
                                            }
                                        >
                                            {isLoggingOut
                                                ? "Logging out..."
                                                : "Logout"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="btn btn-eventore-outline btn-sm"
                                            onClick={
                                                closeMenu
                                            }
                                        >
                                            Login
                                        </Link>

                                        <Link
                                            to="/register"
                                            className="btn btn-eventore btn-sm"
                                            onClick={
                                                closeMenu
                                            }
                                        >
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;