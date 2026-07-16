import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import { QRCodeSVG } from "qrcode.react";

import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { ticketApi } from "../../services/api";

function TicketPage() {
    const { id } = useParams();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadTicket = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await ticketApi.getTicketById(id);

                if (!ignore) {
                    setTicket(data.ticket);
                }
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.message);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadTicket();

        return () => {
            ignore = true;
        };
    }, [id]);

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Date unavailable";
        }

        return new Date(dateValue).toLocaleDateString(
            "en-UG",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    }

    function formatTime(timeValue) {
        if (!timeValue) {
            return "";
        }

        return String(timeValue).slice(0, 5);
    }

    if (loading) {
        return (
            <main className="container py-5">
                <div
                    className="text-center py-5"
                    role="status"
                >
                    <div
                        className="spinner-border"
                        aria-hidden="true"
                    />

                    <p className="mt-3 mb-0">
                        Loading your digital ticket...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !ticket) {
        return (
            <main className="container py-5">
                <EmptyState
                    title="Unable to load ticket"
                    description={
                        error
                        || "The requested ticket could not be found."
                    }
                    action={
                        <Link
                            to="/attendee/tickets"
                            className="btn btn-eventore"
                        >
                            My tickets
                        </Link>
                    }
                />
            </main>
        );
    }

    return (
        <main className="digital-ticket-page">
            <div className="container py-5">
                <div className="ticket-page-heading">
                    <div>
                        <p className="eventore-label">
                            DIGITAL TICKET
                        </p>

                        <h1>
                            {ticket.ticket_status ===
                            "active"
                                ? "Your ticket is ready."
                                : "Digital ticket"}
                        </h1>

                        <p>
                            {ticket.ticket_status ===
                            "active"
                                ? "Present this QR code when checking in at the event."
                                : "This ticket is no longer available for a new check-in."}
                        </p>
                    </div>

                    <StatusBadge
                        status={ticket.ticket_status}
                    />
                </div>

                <article className="digital-ticket">
                    <div className="digital-ticket-main">
                        <div className="digital-ticket-brand">
                            EVENTORE
                        </div>

                        <p className="eventore-label">
                            {ticket.category_name}
                        </p>

                        <h2>{ticket.event_name}</h2>

                        <dl className="digital-ticket-details">
                            <div>
                                <dt>Attendee</dt>

                                <dd>
                                    {ticket.attendee_name}
                                </dd>
                            </div>

                            <div>
                                <dt>Ticket type</dt>

                                <dd>
                                    {ticket.ticket_name}
                                </dd>
                            </div>

                            <div>
                                <dt>Date</dt>

                                <dd>
                                    {formatDate(
                                        ticket.event_date
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt>Time</dt>

                                <dd>
                                    {formatTime(
                                        ticket.start_time
                                    )}
                                    {" – "}
                                    {formatTime(
                                        ticket.end_time
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt>Venue</dt>

                                <dd>
                                    {ticket.venue_name}
                                    <br />
                                    {ticket.address},{" "}
                                    {ticket.city}
                                </dd>
                            </div>

                            <div>
                                <dt>Booking reference</dt>

                                <dd>
                                    {
                                        ticket.booking_reference
                                    }
                                </dd>
                            </div>
                        </dl>

                        <div className="ticket-code">
                            <span>Ticket code</span>

                            <strong>
                                {ticket.ticket_code}
                            </strong>
                        </div>
                    </div>

                    <div className="digital-ticket-qr-section">
                        <div className="bg-white rounded p-3">
                            <QRCodeSVG
                                value={ticket.qr_data}
                                size={220}
                                level="H"
                                includeMargin
                                title={`QR code for ticket ${ticket.ticket_code}`}
                            />
                        </div>

                        <p>Scan at event entrance</p>

                        <small>
                            This QR code is unique to this
                            ticket. Do not share it publicly.
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
                        to={`/bookings/${ticket.booking_id}/confirmation`}
                        className="btn btn-outline-dark"
                    >
                        View booking
                    </Link>

                    <Link
                        to={`/events/${ticket.event_id}`}
                        className="btn btn-eventore"
                    >
                        View event
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default TicketPage;