import { Link } from "react-router-dom";

function AboutPage() {
    return (
        <main>
            <section className="container py-5">
                <div className="row align-items-center g-5 py-lg-5">
                    <div className="col-lg-7">
                        <p className="eventore-label">
                            ABOUT EVENTORE
                        </p>

                        <h1 className="display-4 fw-bold">
                            Events made easier for
                            everyone.
                        </h1>

                        <p className="lead text-muted mt-4">
                            Eventore connects attendees,
                            organisers, event staff and
                            administrators through one
                            secure event-management and
                            ticket-booking platform.
                        </p>

                        <div className="d-flex flex-wrap gap-3 mt-4">
                            <Link
                                to="/events"
                                className="btn btn-eventore"
                            >
                                Explore events
                            </Link>

                            <Link
                                to="/register"
                                className="btn btn-eventore-outline"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="checkout-card">
                            <p className="eventore-label">
                                OUR PURPOSE
                            </p>

                            <h2 className="h3">
                                One reliable event journey
                            </h2>

                            <p className="text-muted mb-0">
                                From event discovery and
                                secure booking to digital
                                tickets, check-in and
                                organiser reporting,
                                Eventore keeps the complete
                                experience connected.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-dark text-white py-5">
                <div className="container py-lg-4">
                    <div className="text-center mb-5">
                        <p className="eventore-label">
                            HOW IT WORKS
                        </p>

                        <h2>
                            Built for every event role
                        </h2>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6 col-xl-3">
                            <article className="h-100 border border-secondary rounded p-4">
                                <h3 className="h5">
                                    Attendees
                                </h3>

                                <p className="text-white-50 mb-0">
                                    Discover events, book
                                    available tickets and
                                    access secure digital QR
                                    tickets.
                                </p>
                            </article>
                        </div>

                        <div className="col-md-6 col-xl-3">
                            <article className="h-100 border border-secondary rounded p-4">
                                <h3 className="h5">
                                    Organisers
                                </h3>

                                <p className="text-white-50 mb-0">
                                    Create events, configure
                                    ticket types and monitor
                                    bookings, revenue and
                                    attendance.
                                </p>
                            </article>
                        </div>

                        <div className="col-md-6 col-xl-3">
                            <article className="h-100 border border-secondary rounded p-4">
                                <h3 className="h5">
                                    Event staff
                                </h3>

                                <p className="text-white-50 mb-0">
                                    Validate ticket codes and
                                    record each attendee’s
                                    check-in safely and only
                                    once.
                                </p>
                            </article>
                        </div>

                        <div className="col-md-6 col-xl-3">
                            <article className="h-100 border border-secondary rounded p-4">
                                <h3 className="h5">
                                    Administrators
                                </h3>

                                <p className="text-white-50 mb-0">
                                    Approve organisers and
                                    review events before they
                                    become publicly available.
                                </p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-5">
                <div className="checkout-card text-center py-5">
                    <p className="eventore-label">
                        BUILT WITH CARE
                    </p>

                    <h2>
                        Safe booking is the priority.
                    </h2>

                    <p className="text-muted mx-auto">
                        Eventore verifies prices on the
                        server, protects inventory with
                        PostgreSQL transactions, prevents
                        duplicate bookings and creates a
                        unique digital ticket for every
                        confirmed admission.
                    </p>

                    <Link
                        to="/events"
                        className="btn btn-eventore mt-3"
                    >
                        Find your next event
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default AboutPage;