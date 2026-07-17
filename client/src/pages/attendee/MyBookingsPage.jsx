import {
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import EmptyState from "../../components/common/EmptyState";
import { bookingApi } from "../../services/api";

function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionMessage, setActionMessage] =
    useState("");

    const [actionError, setActionError] =
    useState("");

    const [
    cancellingBookingId,
    setCancellingBookingId
    ] = useState(null);

    useEffect(() => {
        let ignore = false;

        const loadBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await bookingApi.getMyBookings();

                if (!ignore) {
                    setBookings(data.bookings || []);
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

        loadBookings();

        return () => {
            ignore = true;
        };
    }, []);
    async function handleCancelBooking(booking) {
    const confirmed = window.confirm(
        `Cancel your booking for ${booking.event_name}? Cancelled tickets cannot be used for check-in.`
    );

    if (!confirmed) {
        return;
    }

    const reason = window.prompt(
        "Optional: enter a reason for cancellation.",
        ""
    );

    /*
     * Clicking Cancel on the prompt returns null,
     * meaning the attendee stopped the action.
     */
    if (reason === null) {
        return;
    }

    try {
        setCancellingBookingId(
            booking.booking_id
        );

        setActionError("");
        setActionMessage("");

        const result =
            await bookingApi.cancelBooking(
                booking.booking_id,
                reason
            );

        setBookings((currentBookings) =>
            currentBookings.map(
                (currentBooking) =>
                    currentBooking.booking_id
                    === booking.booking_id
                        ? {
                              ...currentBooking,
                              status: "cancelled",
                              payment_status:
                                  Number(
                                      currentBooking.total_amount
                                  ) > 0
                                      ? "simulated_refund"
                                      : currentBooking.payment_status
                          }
                        : currentBooking
            )
        );

        setActionMessage(result.message);
    } catch (requestError) {
        setActionError(requestError.message);
    } finally {
        setCancellingBookingId(null);
    }
}

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
            case "confirmed":
                return "text-bg-success";

            case "pending":
                return "text-bg-warning";

            case "failed":
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
                        Loading your bookings...
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
                        My bookings
                    </h1>

                    <p className="text-muted mb-0">
                        View your booking history and
                        access confirmed digital tickets.
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
            {actionMessage && (
            <div
                  className="alert eventore-success-alert"
                  role="status"
            >
           {actionMessage}
           </div>
           )}

           {actionError && (
        <div
        className="alert alert-danger"
        role="alert"
        >
        {actionError}
        </div>
        )}

            {!error && bookings.length === 0 && (
                <EmptyState
                    title="No bookings yet"
                    description="When you book an event, it will appear here."
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

            {bookings.length > 0 && (
                <div className="row g-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.booking_id}
                            className="col-12"
                        >
                            <article className="checkout-card">
                                <div className="row g-4 align-items-center">
                                    {booking.image_url && (
                                        <div className="col-md-3">
                                            <img
                                                src={
                                                    booking.image_url
                                                }
                                                alt=""
                                                className="img-fluid rounded w-100"
                                                style={{
                                                    height: "170px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div
                                        className={
                                            booking.image_url
                                                ? "col-md-6"
                                                : "col-md-9"
                                        }
                                    >
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                            <span
                                                className={`badge ${getStatusClass(
                                                    booking.status
                                                )} text-capitalize`}
                                            >
                                                {booking.status}
                                            </span>

                                            <span className="small text-muted">
                                                {
                                                    booking.booking_reference
                                                }
                                            </span>
                                        </div>

                                        <h2 className="h4 mb-3">
                                            {
                                                booking.event_name
                                            }
                                        </h2>

                                        <div className="row g-3">
                                            <div className="col-sm-6">
                                                <small className="d-block text-muted">
                                                    Date and time
                                                </small>

                                                <strong>
                                                    {formatDate(
                                                        booking.event_date
                                                    )}
                                                </strong>

                                                <span className="d-block">
                                                    {formatTime(
                                                        booking.start_time
                                                    )}
                                                </span>
                                            </div>

                                            <div className="col-sm-6">
                                                <small className="d-block text-muted">
                                                    Venue
                                                </small>

                                                <strong>
                                                    {
                                                        booking.venue_name
                                                    }
                                                </strong>

                                                <span className="d-block">
                                                    {booking.city}
                                                </span>
                                            </div>

                                            <div className="col-sm-6">
                                                <small className="d-block text-muted">
                                                    Tickets
                                                </small>

                                                <strong>
                                                    {
                                                        booking.ticket_count
                                                    }
                                                </strong>
                                            </div>

                                            <div className="col-sm-6">
                                                <small className="d-block text-muted">
                                                    Total
                                                </small>

                                                <strong>
                                                    {formatMoney(
                                                        booking.total_amount
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="d-grid gap-2">
                                            <Link
                                                to={`/bookings/${booking.booking_id}/confirmation`}
                                                className="btn btn-eventore"
                                            >
                                                View booking
                                            </Link>
                                            {booking.status === "confirmed" && (
                                            <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                            handleCancelBooking(booking)
                                            }
                                            disabled={
                                            cancellingBookingId
                                            === booking.booking_id
                                            }
                                            >
                                            {cancellingBookingId
                                            === booking.booking_id
                                             ? "Cancelling..."
                                            : "Cancel booking"}
                                            </button>
                                            )}

                                            {booking.status ===
                                                "confirmed" && (
                                                <Link
                                                    to="/attendee/tickets"
                                                    className="btn btn-outline-dark"
                                                >
                                                    View tickets
                                                </Link>
                                            )}

                                            <Link
                                                to={`/events/${booking.event_id}`}
                                                className="btn btn-link text-dark"
                                            >
                                                View event
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default MyBookingsPage;