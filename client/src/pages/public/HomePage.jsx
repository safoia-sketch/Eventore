import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EventCard from "../../components/events/EventCard";
import sampleEvents from "../../data/sampleEvents";
import { checkApiHealth } from "../../services/api";

function HomePage() {
    const [apiStatus, setApiStatus] = useState("checking");

    useEffect(() => {
        async function connectToApi() {
            try {
                await checkApiHealth();
                setApiStatus("online");
            } catch (error) {
                console.error(error);
                setApiStatus("offline");
            }
        }

        connectToApi();
    }, []);

    return (
        <main>
            {/* Hero section */}
            <section className="home-hero">
                <div className="container">
                    <div className="row align-items-center gy-5">
                        <div className="col-lg-7">
                            <div
                                className={`api-status api-status-${apiStatus}`}
                            >
                                <span className="api-status-dot"></span>

                                {apiStatus === "checking" &&
                                    "Connecting..."}

                                {apiStatus === "online" &&
                                    "Platform online"}

                                {apiStatus === "offline" &&
                                    "Connection unavailable"}
                            </div>

                            <p className="eventore-label mb-3">
                                DISCOVER. BOOK. EXPERIENCE.
                            </p>

                            <h1 className="home-hero-title">
                                Find events worth
                                <span> showing up for.</span>
                            </h1>

                            <p className="home-hero-description">
                                Discover experiences, reserve your
                                ticket, and keep everything you need
                                in one place.
                            </p>

                            <div className="d-flex flex-wrap gap-3">
                                <Link
                                    to="/events"
                                    className="btn btn-eventore"
                                >
                                    Explore Events
                                </Link>

                                <Link
                                    to="/register"
                                    className="btn btn-eventore-outline"
                                >
                                    Create an Event
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="hero-visual">
                                <div className="hero-visual-content">
                                    <p>UPCOMING</p>

                                    <strong>
                                        {String(
                                            sampleEvents.length
                                        ).padStart(2, "0")}
                                    </strong>

                                    <span>
                                        upcoming experiences
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured events section */}
            <section className="featured-events-section">
                <div className="container">
                    <div className="section-heading">
                        <div>
                            <p className="eventore-label">
                                UPCOMING EVENTS
                            </p>

                            <h2>
                                Something to look forward to.
                            </h2>
                        </div>

                        <Link
                            to="/events"
                            className="section-link"
                        >
                            View all events →
                        </Link>
                    </div>

                    <div className="row g-4">
                        {sampleEvents
                            .slice(0, 3)
                            .map((event) => (
                                <div
                                    key={event.id}
                                    className="col-md-6 col-lg-4"
                                >
                                    <EventCard event={event} />
                                </div>
                            ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default HomePage;