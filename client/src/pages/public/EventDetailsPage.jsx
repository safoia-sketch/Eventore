import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { eventApi } from "../../services/api";


function EventDetailsPage() {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load published event
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        const loadEvent = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await eventApi.getPublicEventById(id);

                if (active) {
                    setEvent(data.event);
                    setTicketTypes(
                        data.ticket_types || []
                    );
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message
                        || "Unable to load the event."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadEvent();

        return () => {
            active = false;
        };
    }, [id]);


    /*
    |--------------------------------------------------------------------------
    | Formatting
    |--------------------------------------------------------------------------
    */

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Date unavailable";
        }

        return new Intl.DateTimeFormat(
            "en-UG",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC"
            }
        ).format(
            new Date(`${dateValue}T00:00:00Z`)
        );
    };

    const formatTime = (timeValue) => {
        if (!timeValue) {
            return "Time unavailable";
        }

        const [hours, minutes] =
            timeValue.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return new Intl.DateTimeFormat(
            "en-UG",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        ).format(date);
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "Not specified";
        }

        return new Intl.DateTimeFormat(
            "en-UG",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "Africa/Kampala"
            }
        ).format(new Date(dateValue));
    };

    const formatPrice = (priceValue) => {
        const price = Number(priceValue);

        if (price === 0) {
            return "Free";
        }

        return `UGX ${price.toLocaleString()}`;
    };


    /*
    |--------------------------------------------------------------------------
    | Ticket availability
    |--------------------------------------------------------------------------
    */

    const getTicketAvailability = (ticket) => {
        if (Number(ticket.quantity_remaining) === 0) {
            return {
                available: false,
                message: "Sold out"
            };
        }

        const now = new Date();

        if (
            ticket.sale_start
            && now < new Date(ticket.sale_start)
        ) {
            return {
                available: false,
                message: `Sales begin ${formatDateTime(
                    ticket.sale_start
                )}`
            };
        }

        if (
            ticket.sale_end
            && now > new Date(ticket.sale_end)
        ) {
            return {
                available: false,
                message: "Sales closed"
            };
        }

        return {
            available: true,
            message:
                `${ticket.quantity_remaining} remaining`
        };
    };

    const hasAvailableTickets = ticketTypes.some(
        (ticket) =>
            getTicketAvailability(ticket).available
    );


    /*
    |--------------------------------------------------------------------------
    | Loading and error states
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <main className="container py-5 text-center">
                <div
                    className="spinner-border"
                    role="status"
                    aria-label="Loading event"
                />

                <p className="mt-3">
                    Loading event details...
                </p>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="container py-5">
                {error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <EmptyState
                    title="Event not found"
                    description="The requested event does not exist, is not published, or is no longer available."
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
                                {event.category_name}
                            </p>

                            <h1 className="event-details-title">
                                {event.event_name}
                            </h1>

                            <p className="event-details-location">
                                {formatDate(event.event_date)}
                                {" · "}
                                {formatTime(event.start_time)}
                                {"–"}
                                {formatTime(event.end_time)}
                                {" · "}
                                {event.venue_name},{" "}
                                {event.city}
                            </p>
                        </div>

                        <div className="col-lg-4 text-lg-end">
                            <StatusBadge
                                status={
                                    hasAvailableTickets
                                        ? event.status
                                        : "sold_out"
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {event.image_url && (
                <section className="container pt-4">
                    <img
                        src={event.image_url}
                        alt={event.event_name}
                        className="img-fluid rounded-4 w-100"
                    />
                </section>
            )}

            <section className="event-details-content">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-7">
                            <div className="event-information-card">
                                <h2>About this event</h2>

                                <p>{event.description}</p>

                                <h3>Event information</h3>

                                <dl className="event-information-list">
                                    <div>
                                        <dt>Date</dt>

                                        <dd>
                                            {formatDate(
                                                event.event_date
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Time</dt>

                                        <dd>
                                            {formatTime(
                                                event.start_time
                                            )}
                                            {" – "}
                                            {formatTime(
                                                event.end_time
                                            )}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Venue</dt>

                                        <dd>
                                            {event.venue_name}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Address</dt>

                                        <dd>
                                            {event.address},{" "}
                                            {event.city}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Category</dt>

                                        <dd>
                                            {
                                                event.category_name
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Organiser</dt>

                                        <dd>
                                            {
                                                event.organiser_name
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Contact</dt>

                                        <dd>
                                            <a
                                                href={`mailto:${event.contact_email}`}
                                            >
                                                {
                                                    event.contact_email
                                                }
                                            </a>
                                        </dd>
                                    </div>
                                </dl>

                                <h3>Refund policy</h3>

                                <p>
                                    {event.refund_policy
                                        || "No refund policy was provided."}
                                </p>

                                {event.refund_deadline && (
                                    <p className="text-secondary">
                                        Refund deadline:{" "}
                                        {formatDateTime(
                                            event.refund_deadline
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <aside className="ticket-selection-card">
                                <p className="eventore-label">
                                    SELECT A TICKET
                                </p>

                                <h2>Available tickets</h2>

                                <div className="ticket-type-list">
                                    {ticketTypes.map(
                                        (ticket) => {
                                            const availability =
                                                getTicketAvailability(
                                                    ticket
                                                );

                                            return (
                                                <div
                                                    key={
                                                        ticket.ticket_type_id
                                                    }
                                                    className="ticket-type"
                                                >
                                                    <div>
                                                        <h3>
                                                            {
                                                                ticket.ticket_name
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                ticket.description
                                                                || "Event admission ticket."
                                                            }
                                                        </p>

                                                        <small
                                                            className={
                                                                availability.available
                                                                    ? ""
                                                                    : "text-danger"
                                                            }
                                                        >
                                                            {
                                                                availability.message
                                                            }
                                                        </small>
                                                    </div>

                                                    <strong>
                                                        {formatPrice(
                                                            ticket.price
                                                        )}
                                                    </strong>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                {hasAvailableTickets ? (
                                    <Link
                                        to={`/checkout/${event.event_id}`}
                                        className="btn btn-eventore w-100 mt-4"
                                    >
                                        Continue to tickets
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-100 mt-4"
                                        disabled
                                    >
                                        Tickets unavailable
                                    </button>
                                )}

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