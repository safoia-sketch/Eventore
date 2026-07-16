import {
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import EmptyState from "../../components/common/EmptyState";
import { ticketApi } from "../../services/api";

function MyTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadTickets = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await ticketApi.getMyTickets();

                if (!ignore) {
                    setTickets(data.tickets || []);
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

        loadTickets();

        return () => {
            ignore = true;
        };
    }, []);

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Date unavailable";
        }

        return new Date(dateValue).toLocaleDateString(
            "en-UG",
            {
                weekday: "short",
                year: "numeric",
                month: "short",
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

    function getStatusClass(status) {
        switch (status) {
            case "active":
                return "text-bg-success";

            case "used":
                return "text-bg-secondary";

            case "cancelled":
                return "text-bg-danger";

            default:
                return "text-bg-secondary";
        }
    }

    if (loading) {
        return (
            <section className="py-4">
                <div
                    className="text-center py-5"
                    role="status"
                >
                    <div
                        className="spinner-border"
                        aria-hidden="true"
                    />

                    <p className="mt-3 mb-0">
                        Loading your tickets...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <p className="eventore-label mb-2">
                        ATTENDEE
                    </p>

                    <h1 className="mb-2">
                        My tickets
                    </h1>

                    <p className="text-muted mb-0">
                        Access your digital tickets,
                        ticket codes and QR codes.
                    </p>
                </div>

                <Link
                    to="/events"
                    className="btn btn-eventore"
                >
                    Explore events
                </Link>
            </div>

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {!error && tickets.length === 0 && (
                <EmptyState
                    title="No digital tickets yet"
                    description="Digital tickets appear here after a booking is successfully confirmed."
                    action={
                        <Link
                            to="/events"
                            className="btn btn-eventore"
                        >
                            Find an event
                        </Link>
                    }
                />
            )}

            {tickets.length > 0 && (
                <div className="row g-4">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.ticket_id}
                            className="col-md-6 col-xl-4"
                        >
                            <article className="checkout-card h-100">
                                {ticket.image_url && (
                                    <img
                                        src={ticket.image_url}
                                        alt=""
                                        className="img-fluid rounded w-100 mb-4"
                                        style={{
                                            height: "180px",
                                            objectFit: "cover"
                                        }}
                                    />
                                )}

                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                        <p className="eventore-label mb-2">
                                            DIGITAL TICKET
                                        </p>

                                        <h2 className="h5 mb-1">
                                            {ticket.event_name}
                                        </h2>

                                        <p className="text-muted mb-0">
                                            {ticket.ticket_name}
                                        </p>
                                    </div>

                                    <span
                                        className={`badge ${getStatusClass(
                                            ticket.ticket_status
                                        )} text-capitalize`}
                                    >
                                        {ticket.ticket_status}
                                    </span>
                                </div>

                                <div className="bg-white border rounded p-3 my-4 text-center">
                                    <QRCodeSVG
                                        value={ticket.qr_data}
                                        size={170}
                                        level="H"
                                        includeMargin
                                        title={`QR code for ticket ${ticket.ticket_code}`}
                                    />
                                </div>

                                <dl className="mb-4">
                                    <div className="d-flex justify-content-between gap-3 border-bottom py-2">
                                        <dt>Date</dt>

                                        <dd className="mb-0 text-end">
                                            {formatDate(
                                                ticket.event_date
                                            )}
                                        </dd>
                                    </div>

                                    <div className="d-flex justify-content-between gap-3 border-bottom py-2">
                                        <dt>Time</dt>

                                        <dd className="mb-0 text-end">
                                            {formatTime(
                                                ticket.start_time
                                            )}
                                        </dd>
                                    </div>

                                    <div className="d-flex justify-content-between gap-3 border-bottom py-2">
                                        <dt>Venue</dt>

                                        <dd className="mb-0 text-end">
                                            {ticket.venue_name}
                                            <br />
                                            {ticket.city}
                                        </dd>
                                    </div>
                                </dl>

                                <p className="small text-muted mb-1">
                                    Ticket code
                                </p>

                                <code className="d-block text-break mb-4">
                                    {ticket.ticket_code}
                                </code>

                                <div className="d-grid gap-2">
                                    <Link
                                        to={`/tickets/${ticket.ticket_id}`}
                                        className="btn btn-eventore"
                                    >
                                        View full ticket
                                    </Link>

                                    <Link
                                        to={`/bookings/${ticket.booking_id}/confirmation`}
                                        className="btn btn-outline-dark"
                                    >
                                        View booking
                                    </Link>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default MyTicketsPage;