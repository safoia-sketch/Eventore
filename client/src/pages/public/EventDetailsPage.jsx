import { Link, useParams } from "react-router";

import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import sampleEvents from "../../data/sampleEvents";

function EventDetailsPage() {
    const { id } = useParams();

    const event = sampleEvents.find(
        (item) => item.id === Number(id)
    );

    if (!event) {
        return (
            <main className="container py-5">
                <EmptyState
                    title="Event not found"
                    description="The requested event does not exist or is no longer available."
                    action={
                        <Link
                            to="/events"
                            className="btn btn-eventore"
                        >
                            Explore events
                        </Link>
                    }
                />
            </main>
        );
    }

    const ticketTypes =
        event.price === 0
            ? [
                  {
                      id: 1,
                      name: "General Admission",
                      description:
                          "Standard access to the event.",
                      price: 0,
                      remaining: event.availableTickets
                  }
              ]
            : [
                  {
                      id: 1,
                      name: "General Admission",
                      description:
                          "Standard access to the event.",
                      price: event.price,
                      remaining: event.availableTickets
                  },
                  {
                      id: 2,
                      name: "VIP",
                      description:
                          "Priority entry and premium event access.",
                      price: event.price * 2,
                      remaining: 20
                  }
              ];

    return (
        <main>
            <section className="event-details-hero">
                <div className="container">
                    <Link
                        to="/events"
                        className="event-back-link"
                    >
                        ← Back to events
                    </Link>

                    <div className="row align-items-end gy-4">
                        <div className="col-lg-8">
                            <p className="eventore-label">
                                {event.category}
                            </p>

                            <h1 className="event-details-title">
                                {event.name}
                            </h1>

                            <p className="event-details-location">
                                {event.date} · {event.venue},{" "}
                                {event.location}
                            </p>
                        </div>

                        <div className="col-lg-4 text-lg-end">
                            <StatusBadge status="published" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="event-details-content">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-7">
                            <div className="event-information-card">
                                <h2>About this event</h2>

                                <p>
                                    Join us for an engaging Eventore
                                    experience designed to bring people
                                    together, share ideas and create
                                    memorable connections.
                                </p>

                                <h3>Event information</h3>

                                <dl className="event-information-list">
                                    <div>
                                        <dt>Date</dt>
                                        <dd>{event.date}</dd>
                                    </div>

                                    <div>
                                        <dt>Venue</dt>
                                        <dd>{event.venue}</dd>
                                    </div>

                                    <div>
                                        <dt>Location</dt>
                                        <dd>{event.location}</dd>
                                    </div>

                                    <div>
                                        <dt>Category</dt>
                                        <dd>{event.category}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <aside className="ticket-selection-card">
                                <p className="eventore-label">
                                    SELECT A TICKET
                                </p>

                                <h2>Available tickets</h2>

                                <div className="ticket-type-list">
                                    {ticketTypes.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="ticket-type"
                                        >
                                            <div>
                                                <h3>
                                                    {ticket.name}
                                                </h3>

                                                <p>
                                                    {
                                                        ticket.description
                                                    }
                                                </p>

                                                <small>
                                                    {
                                                        ticket.remaining
                                                    }{" "}
                                                    remaining
                                                </small>
                                            </div>

                                            <strong>
                                                {ticket.price === 0
                                                    ? "Free"
                                                    : `UGX ${ticket.price.toLocaleString()}`}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to={`/checkout/${event.id}`}
                                    className="btn btn-eventore w-100 mt-4"
                                >
                                    Continue to to tickets
                                </Link>

                                <p className="ticket-login-note">
                                    You will need to log in before
                                    completing a booking.
                                </p>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default EventDetailsPage;