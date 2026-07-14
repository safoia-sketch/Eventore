import { Link } from "react-router-dom";

function EventCard({ event }) {
    return (
        <article className="event-card">
            <div className="event-card-image-wrapper">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.name}
                        className="event-card-image"
                    />
                ) : (
                    <div className="event-card-placeholder">
                        <span>{event.category}</span>
                    </div>
                )}

                <span className="event-card-price">
                    {event.price === 0
                        ? "Free"
                        : `UGX ${event.price.toLocaleString()}`}
                </span>
            </div>

            <div className="event-card-body">
                <p className="event-card-category">
                    {event.category}
                </p>

                <h3 className="event-card-title">
                    {event.name}
                </h3>

                <div className="event-card-details">
                    <p>{event.date}</p>
                    <p>{event.location}</p>
                </div>

                <Link
                    to={`/events/${event.id}`}
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