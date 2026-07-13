function HomePage() {
    return (
        <main className="min-vh-100 d-flex align-items-center">
            <div className="container py-5">
                <p className="eventore-label mb-2">EVENTORE</p>

                <h1 className="display-3 fw-bold mb-3">
                    Find events worth showing up for.
                </h1>

                <p className="lead text-secondary mb-4">
                    Discover experiences, reserve your ticket, and keep
                    everything you need in one place.
                </p>

                <div className="d-flex flex-wrap gap-3">
                    <button className="btn btn-eventore">
                        Explore Events
                    </button>

                    <button className="btn btn-eventore-outline">
                        Create an Event
                    </button>
                </div>
            </div>
        </main>
    );
}

export default HomePage;