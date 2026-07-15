import { Link } from "react-router-dom";

function EventCard({ event }) {
    const price = Number(event.minimum_price);

    const soldOut =
        event.status === "sold_out"
        || Number(event.tickets_remaining) === 0;

    const formattedDate = event.event_date
        ? new Intl.DateTimeFormat(
            "en-UG",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC"
            }
        ).format(
            new Date(`${event.event_date}T00:00:00Z`)
        )
        : "Date unavailable";

    return (
        <article className="event-card">
            <div className="event-card-image-wrapper">
                {event.image_url ? (
                    <img
                        src={event.image_url}
                        alt={event.event_name}
                        className="event-card-image"
                    />
                ) : (
                    <div className="event-card-placeholder">
                        <span>
                            {event.category_name}
                        </span>
                    </div>
                )}

                <span className="event-card-price">
                    {price === 0
                        ? "Free"
                        : `UGX ${price.toLocaleString()}`}
                </span>

                {soldOut && (
                    <span className="badge text-bg-dark position-absolute top-0 start-0 m-3">
                        Sold out
                    </span>
                )}
            </div>

            <div className="event-card-body">
                <p className="event-card-category">
                    {event.category_name}
                </p>

                <h3 className="event-card-title">
                    {event.event_name}
                </h3>

                <div className="event-card-details">
                    <p>{formattedDate}</p>

                    <p>
                        {event.venue_name}, {event.city}
                    </p>

                    <p>
                        {soldOut
                            ? "No tickets remaining"
                            : `${event.tickets_remaining} tickets remaining`}
                    </p>
                </div>

                <Link
                    to={`/events/${event.event_id}`}
                    className="event-card-link"
                >
                    View event
                    <span aria-hidden="true"> →</span>
                </Link>
            </div>
        </article>
    );
}

export default EventCard;