import { useState } from "react";
import { Link, NavLink } from "react-router";

import eventoreLogo from "../../assets/images/Eventore_logo.png";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    function closeMenu() {
        setMenuOpen(false);
    }

    function getNavLinkClass({ isActive }) {
        return isActive ? "nav-link active" : "nav-link";
    }

    return (
        <header className="eventore-header">
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    {/* Logo */}
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

                    {/* Mobile menu button */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        aria-controls="eventore-navigation"
                        aria-expanded={menuOpen}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navigation links */}
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
                                    className={getNavLinkClass}
                                    onClick={closeMenu}
                                >
                                    Home
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/events"
                                    className={getNavLinkClass}
                                    onClick={closeMenu}
                                >
                                    Explore Events
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/about"
                                    className={getNavLinkClass}
                                    onClick={closeMenu}
                                >
                                    About
                                </NavLink>
                            </li>
                        </ul>

                        {/* Account buttons */}
                        <div className="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
                            <Link
                                to="/login"
                                className="btn btn-eventore-outline btn-sm"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="btn btn-eventore btn-sm"
                                onClick={closeMenu}
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;