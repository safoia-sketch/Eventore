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
import { bookingApi } from "../../services/api";

function BookingConfirmationPage() {
    const { bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [bookingItems, setBookingItems] =
        useState([]);
    const [tickets, setTickets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadBooking = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await bookingApi.getBookingById(
                        bookingId
                    );

                if (ignore) {
                    return;
                }

                setBooking(data.booking);
                setBookingItems(
                    data.booking_items || []
                );
                setTickets(data.tickets || []);
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

        loadBooking();

        return () => {
            ignore = true;
        };
    }, [bookingId]);

    function formatMoney(amount) {
        const numericAmount = Number(amount);

        if (numericAmount === 0) {
            return "Free";
        }

        return `UGX ${numericAmount.toLocaleString()}`;
    }

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
                        Loading your booking...
                    </p>
                </div>
            </main>
        );
    }

    if (error || !booking) {
        return (
            <main className="container py-5">
                <EmptyState
                    title="Unable to load booking"
                    description={
                        error
                        || "The booking could not be found."
                    }
                    action={
                        <Link
                            to="/attendee/bookings"
                            className="btn btn-eventore"
                        >
                            View my bookings
                        </Link>
                    }
                />
            </main>
        );
    }

    const isConfirmed =
        booking.status === "confirmed";

    return (
        <main className="booking-confirmation-page">
            <div className="container py-5">
                <section className="checkout-card mb-4">
                    <p className="eventore-label">
                        {isConfirmed
                            ? "BOOKING CONFIRMED"
                            : "BOOKING RESULT"}
                    </p>

                    <h1>
                        {isConfirmed
                            ? "Your tickets are ready"
                            : "Booking not confirmed"}
                    </h1>

                    <p className="checkout-description">
                        {isConfirmed
                            ? `Your booking for ${booking.event_name} was completed successfully.`
                            : "This booking did not create active tickets."}
                    </p>

                    <div
                        className={`alert ${
                            isConfirmed
                                ? "eventore-success-alert"
                                : "alert-danger"
                        }`}
                        role="status"
                    >
                        Booking reference:{" "}
                        <strong>
                            {booking.booking_reference}
                        </strong>
                    </div>
                </section>

                <div className="row g-4">
                    <div className="col-lg-7">
                        <section className="checkout-card h-100">
                            <p className="eventore-label">
                                EVENT DETAILS
                            </p>

                            <h2>{booking.event_name}</h2>

                            <dl className="mt-4">
                                <div className="d-flex justify-content-between gap-3 border-bottom py-3">
                                    <dt>Date</dt>

                                    <dd className="mb-0 text-end">
                                        {formatDate(
                                            booking.event_date
                                        )}
                                    </dd>
                                </div>

                                <div className="d-flex justify-content-between gap-3 border-bottom py-3">
                                    <dt>Time</dt>

                                    <dd className="mb-0 text-end">
                                        {formatTime(
                                            booking.start_time
                                        )}
                                        {" – "}
                                        {formatTime(
                                            booking.end_time
                                        )}
                                    </dd>
                                </div>

                                <div className="d-flex justify-content-between gap-3 border-bottom py-3">
                                    <dt>Venue</dt>

                                    <dd className="mb-0 text-end">
                                        {booking.venue_name}
                                        <br />
                                        {booking.address},{" "}
                                        {booking.city}
                                    </dd>
                                </div>

                                <div className="d-flex justify-content-between gap-3 border-bottom py-3">
                                    <dt>Attendee</dt>

                                    <dd className="mb-0 text-end">
                                        {
                                            booking.attendee_name
                                        }
                                        <br />
                                        {
                                            booking.attendee_email
                                        }
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </div>

                    <div className="col-lg-5">
                        <aside className="order-summary h-100">
                            <p className="eventore-label">
                                ORDER SUMMARY
                            </p>

                            {bookingItems.map((item) => (
                                <div
                                    key={
                                        item.booking_item_id
                                    }
                                    className="d-flex justify-content-between gap-3 border-bottom py-3"
                                >
                                    <span>
                                        {item.quantity} ×{" "}
                                        {item.ticket_name}
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            item.subtotal
                                        )}
                                    </strong>
                                </div>
                            ))}

                            <div className="order-total mt-3">
                                <span>Total</span>

                                <strong>
                                    {formatMoney(
                                        booking.total_amount
                                    )}
                                </strong>
                            </div>

                            <div className="mt-4">
                                <p className="mb-1">
                                    Payment status
                                </p>

                                <strong className="text-capitalize">
                                    {String(
                                        booking.payment_status
                                        || "unknown"
                                    ).replaceAll("_", " ")}
                                </strong>
                            </div>
                        </aside>
                    </div>
                </div>

                {isConfirmed && tickets.length > 0 && (
                    <section className="mt-5">
                        <p className="eventore-label">
                            DIGITAL TICKETS
                        </p>

                        <h2 className="mb-4">
                            Your tickets
                        </h2>

                        <div className="row g-4">
                            {tickets.map(
                                (ticket, index) => (
                                    <div
                                        key={ticket.ticket_id}
                                        className="col-md-6 col-xl-4"
                                    >
                                        <article className="checkout-card h-100">
                                            <div className="d-flex justify-content-between gap-3">
                                                <div>
                                                    <p className="eventore-label mb-2">
                                                        TICKET{" "}
                                                        {index + 1}
                                                    </p>

                                                    <h3 className="h5">
                                                        {
                                                            ticket.ticket_name
                                                        }
                                                    </h3>
                                                </div>

                                                <span className="badge text-bg-success align-self-start text-capitalize">
                                                    {
                                                        ticket.ticket_status
                                                    }
                                                </span>
                                            </div>

                                            <div className="bg-white border rounded p-3 my-4 text-center">
                                                <QRCodeSVG
                                                    value={
                                                        ticket.qr_data
                                                    }
                                                    size={180}
                                                    level="H"
                                                    includeMargin
                                                    title={`QR code for ticket ${ticket.ticket_code}`}
                                                />
                                            </div>

                                            <p className="small text-muted mb-2">
                                                Ticket code
                                            </p>

                                            <code className="d-block text-break">
                                                {
                                                    ticket.ticket_code
                                                }
                                            </code>

                                            <Link
                                                to={`/tickets/${ticket.ticket_id}`}
                                                className="btn btn-outline-dark w-100 mt-4"
                                            >
                                                View ticket
                                            </Link>
                                        </article>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                )}

                <div className="d-flex flex-wrap gap-3 mt-5">
                    <Link
                        to="/attendee/bookings"
                        className="btn btn-eventore"
                    >
                        View my bookings
                    </Link>

                    <Link
                        to="/events"
                        className="btn btn-outline-dark"
                    >
                        Explore more events
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default BookingConfirmationPage;