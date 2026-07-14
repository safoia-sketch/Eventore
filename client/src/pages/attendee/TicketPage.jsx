import { Link, useParams } from "react-router-dom";

import StatusBadge from "../../components/common/StatusBadge";
import sampleEvents from "../../data/sampleEvents";

function TicketPage() {
    const { id } = useParams();

    const event = sampleEvents[0];

    const ticket = {
        id,
        ticketCode: "EVT-2026-KCC-0001",
        attendeeName: "Sample Attendee",
        ticketType: "General Admission",
        status: "active"
    };

    return (
        <main className="digital-ticket-page">
            <div className="container py-5">
                <div className="ticket-page-heading">
                    <div>
                        <p className="eventore-label">
                            DIGITAL TICKET
                        </p>

                        <h1>Your ticket is ready.</h1>

                        <p>
                            Present this ticket when checking in
                            at the event.
                        </p>
                    </div>

                    <StatusBadge status={ticket.status} />
                </div>

                <article className="digital-ticket">
                    <div className="digital-ticket-main">
                        <div className="digital-ticket-brand">
                            EVENTORE
                        </div>

                        <p className="eventore-label">
                            {event.category}
                        </p>

                        <h2>{event.name}</h2>

                        <dl className="digital-ticket-details">
                            <div>
                                <dt>Attendee</dt>
                                <dd>{ticket.attendeeName}</dd>
                            </div>

                            <div>
                                <dt>Ticket type</dt>
                                <dd>{ticket.ticketType}</dd>
                            </div>

                            <div>
                                <dt>Date</dt>
                                <dd>{event.date}</dd>
                            </div>

                            <div>
                                <dt>Venue</dt>
                                <dd>
                                    {event.venue},{" "}
                                    {event.location}
                                </dd>
                            </div>
                        </dl>

                        <div className="ticket-code">
                            <span>Ticket code</span>
                            <strong>
                                {ticket.ticketCode}
                            </strong>
                        </div>
                    </div>

                    <div className="digital-ticket-qr-section">
                        <div
                            className="qr-placeholder"
                            aria-label="QR-code placeholder"
                        >
                            <span>QR</span>
                        </div>

                        <p>
                            Scan at event entrance
                        </p>

                        <small>
                            A secure QR code will be generated
                            by the server on Day 4.
                        </small>
                    </div>
                </article>

                <div className="ticket-actions">
                    <Link
                        to="/attendee/tickets"
                        className="btn btn-eventore-outline"
                    >
                        My tickets
                    </Link>

                    <Link
                        to="/events"
                        className="btn btn-eventore"
                    >
                        Explore more events
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default TicketPage;