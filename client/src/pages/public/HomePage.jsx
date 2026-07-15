import {
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import EventCard from "../../components/events/EventCard";

import {
    checkApiHealth,
    eventApi
} from "../../services/api";


function HomePage() {
    const [apiStatus, setApiStatus] =
        useState("checking");

    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] =
        useState(true);

    const [eventsError, setEventsError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Check API connection
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        const connectToApi = async () => {
            try {
                await checkApiHealth();

                if (active) {
                    setApiStatus("online");
                }
            } catch (error) {
                console.error(error);

                if (active) {
                    setApiStatus("offline");
                }
            }
        };

        connectToApi();

        return () => {
            active = false;
        };
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Load published events
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        const loadPublishedEvents = async () => {
            try {
                setLoadingEvents(true);
                setEventsError("");

                const data =
                    await eventApi.getPublicEvents();

                if (active) {
                    setEvents(data.events || []);
                }
            } catch (error) {
                if (active) {
                    setEventsError(
                        error.message
                        || "Unable to load upcoming events."
                    );
                }
            } finally {
                if (active) {
                    setLoadingEvents(false);
                }
            }
        };

        loadPublishedEvents();

        return () => {
            active = false;
        };
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
                                <span className="api-status-dot" />

                                {apiStatus === "checking"
                                    && "Connecting..."}

                                {apiStatus === "online"
                                    && "Platform online"}

                                {apiStatus === "offline"
                                    && "Connection unavailable"}
                            </div>

                            <p className="eventore-label mb-3">
                                DISCOVER. BOOK. EXPERIENCE.
                            </p>

                            <h1 className="home-hero-title">
                                Find events worth
                                <span>
                                    {" "}showing up for.
                                </span>
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
                                        {loadingEvents
                                            ? "--"
                                            : String(
                                                events.length
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
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

                    {eventsError && (
                        <div
                            className="alert alert-danger"
                            role="alert"
                        >
                            {eventsError}
                        </div>
                    )}

                    {loadingEvents && (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border"
                                role="status"
                                aria-label="Loading upcoming events"
                            />

                            <p className="mt-3">
                                Loading upcoming events...
                            </p>
                        </div>
                    )}

                    {!loadingEvents
                    && events.length === 0 && (
                        <div className="glass-card p-5 text-center">
                            <h3>No upcoming events</h3>

                            <p className="text-secondary mb-0">
                                Published events will appear here.
                            </p>
                        </div>
                    )}

                    {!loadingEvents
                    && events.length > 0 && (
                        <div className="row g-4">
                            {events
                                .slice(0, 3)
                                .map((eventRecord) => (
                                    <div
                                        key={
                                            eventRecord.event_id
                                        }
                                        className="col-md-6 col-lg-4"
                                    >
                                        <EventCard
                                            event={
                                                eventRecord
                                            }
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default HomePage;