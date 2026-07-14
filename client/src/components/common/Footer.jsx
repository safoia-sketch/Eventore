import { Link } from "react-router-dom";

import eventoreLogo from "../../assets/images/Eventore_logo.png";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="eventore-footer">
            <div className="container py-5">
                <div className="row gy-4">
                    <div className="col-lg-5">
                        <Link
                            to="/"
                            className="footer-logo-wrapper"
                            aria-label="Eventore homepage"
                        >
                            <img
                                src={eventoreLogo}
                                alt="Eventore"
                                className="footer-logo"
                            />
                        </Link>

                        <p className="footer-description mt-3">
                            Discover experiences, reserve your tickets, and
                            manage unforgettable events in one place.
                        </p>
                    </div>

                    <div className="col-6 col-lg-3">
                        <h2 className="footer-heading">Explore</h2>

                        <ul className="list-unstyled footer-links">
                            <li>
                                <Link to="/">Home</Link>
                            </li>

                            <li>
                                <Link to="/events">Events</Link>
                            </li>

                            <li>
                                <Link to="/about">About</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-6 col-lg-4">
                        <h2 className="footer-heading">Account</h2>

                        <ul className="list-unstyled footer-links">
                            <li>
                                <Link to="/login">Login</Link>
                            </li>

                            <li>
                                <Link to="/register">
                                    Create account
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom mt-5 pt-4">
                    <p className="mb-0">
                        © {currentYear} Eventore. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;