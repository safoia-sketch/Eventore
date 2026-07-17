import {
    useEffect,
    useState
} from "react";

import EmptyState from "../../components/common/EmptyState";
import { checkInApi } from "../../services/api";

function CheckInPage() {
    const [events, setEvents] = useState([]);
    const [eventId, setEventId] = useState("");
    const [ticketCode, setTicketCode] =
        useState("");

    const [loadingEvents, setLoadingEvents] =
        useState(true);
    const [submitting, setSubmitting] =
        useState(false);

    const [loadError, setLoadError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        let ignore = false;

        const loadEvents = async () => {
            try {
                setLoadingEvents(true);
                setLoadError("");

                const data =
                    await checkInApi.getEvents();

                if (!ignore) {
                    setEvents(data.events || []);

                    if (data.events?.length === 1) {
                        setEventId(
                            String(
                                data.events[0].event_id
                            )
                        );
                    }
                }
            } catch (requestError) {
                if (!ignore) {
                    setLoadError(
                        requestError.message
                    );
                }
            } finally {
                if (!ignore) {
                    setLoadingEvents(false);
                }
            }
        };

        loadEvents();

        return () => {
            ignore = true;
        };
    }, []);

    async function handleSubmit(formEvent) {
        formEvent.preventDefault();

        if (!eventId) {
            setResult({
                success: false,
                result_code: "invalid_event",
                message:
                    "Select an event before validating the ticket."
            });

            return;
        }

        if (!ticketCode.trim()) {
            setResult({
                success: false,
                result_code: "invalid",
                message: "Enter a ticket code."
            });

            return;
        }

        try {
            setSubmitting(true);
            setResult(null);

            const data =
                await checkInApi.validateTicket({
                    event_id: Number(eventId),
                    ticket_code:
                        ticketCode.trim()
                });

            setResult({
                success: true,
                ...data
            });

            setTicketCode("");
        } catch (requestError) {
            setResult({
                success: false,
                result_code:
                    requestError.status === 404
                        ? "invalid"
                        : "error",

                message: requestError.message
            });
        } finally {
            setSubmitting(false);
        }
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

    function getResultTitle() {
        if (result?.success) {
            return "Valid ticket";
        }

        switch (result?.result_code) {
            case "already_used":
                return "Already used";

            case "cancelled":
                return "Cancelled ticket";

            case "wrong_event":
                return "Wrong event";

            case "invalid_event":
                return "Select an event";

            default:
                return "Invalid ticket";
        }
    }

    if (loadingEvents) {
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
                        Loading check-in events...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4">
            <div className="mb-4">
                <p className="eventore-label mb-2">
                    STAFF
                </p>

                <h1 className="mb-2">
                    Ticket check-in
                </h1>

                <p className="text-muted mb-0">
                    Select an event and enter the code
                    shown on the attendee’s digital
                    ticket.
                </p>
            </div>

            {loadError && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {loadError}
                </div>
            )}

            {!loadError && events.length === 0 && (
                <EmptyState
                    title="No events available"
                    description="There are currently no published upcoming events available for check-in."
                />
            )}

            {events.length > 0 && (
                <div className="row g-4">
                    <div className="col-lg-7">
                        <section className="checkout-card">
                            <h2 className="h4 mb-4">
                                Validate a ticket
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="check-in-event"
                                        className="form-label"
                                    >
                                        Event
                                    </label>

                                    <select
                                        id="check-in-event"
                                        value={eventId}
                                        onChange={(
                                            changeEvent
                                        ) => {
                                            setEventId(
                                                changeEvent
                                                    .target
                                                    .value
                                            );

                                            setResult(null);
                                        }}
                                        className="form-select eventore-input"
                                        disabled={submitting}
                                        required
                                    >
                                        <option value="">
                                            Select an event
                                        </option>

                                        {events.map(
                                            (event) => (
                                                <option
                                                    key={
                                                        event.event_id
                                                    }
                                                    value={
                                                        event.event_id
                                                    }
                                                >
                                                    {
                                                        event.event_name
                                                    }{" "}
                                                    —{" "}
                                                    {formatDate(
                                                        event.event_date
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="ticket-code"
                                        className="form-label"
                                    >
                                        Ticket code
                                    </label>

                                    <input
                                        id="ticket-code"
                                        type="text"
                                        value={ticketCode}
                                        onChange={(
                                            changeEvent
                                        ) => {
                                            setTicketCode(
                                                changeEvent
                                                    .target
                                                    .value
                                            );

                                            setResult(null);
                                        }}
                                        className="form-control eventore-input"
                                        placeholder="EVT-..."
                                        maxLength="150"
                                        autoComplete="off"
                                        disabled={submitting}
                                        required
                                    />

                                    <div className="form-text">
                                        Enter the complete code
                                        exactly as displayed on
                                        the digital ticket.
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-eventore w-100"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Validating..."
                                        : "Validate and check in"}
                                </button>
                            </form>
                        </section>
                    </div>

                    <div className="col-lg-5">
                        <aside className="order-summary h-100">
                            <p className="eventore-label">
                                VALIDATION RESULT
                            </p>

                            {!result && (
                                <p className="text-muted">
                                    The ticket result will
                                    appear here after
                                    validation.
                                </p>
                            )}

                            {result && (
                                <div
                                    className={`alert ${
                                        result.success
                                            ? "eventore-success-alert"
                                            : "alert-danger"
                                    }`}
                                    role={
                                        result.success
                                            ? "status"
                                            : "alert"
                                    }
                                >
                                    <h2 className="h5">
                                        {getResultTitle()}
                                    </h2>

                                    <p className="mb-0">
                                        {result.message}
                                    </p>
                                </div>
                            )}

                            {result?.success
                                && result.ticket && (
                                    <dl>
                                        <div className="border-bottom py-3">
                                            <dt>Attendee</dt>

                                            <dd className="mb-0">
                                                {
                                                    result.ticket
                                                        .attendee_name
                                                }
                                            </dd>
                                        </div>

                                        <div className="border-bottom py-3">
                                            <dt>Event</dt>

                                            <dd className="mb-0">
                                                {
                                                    result.ticket
                                                        .event_name
                                                }
                                            </dd>
                                        </div>

                                        <div className="border-bottom py-3">
                                            <dt>Ticket type</dt>

                                            <dd className="mb-0">
                                                {
                                                    result.ticket
                                                        .ticket_name
                                                }
                                            </dd>
                                        </div>

                                        <div className="border-bottom py-3">
                                            <dt>Ticket code</dt>

                                            <dd className="mb-0 text-break">
                                                {
                                                    result.ticket
                                                        .ticket_code
                                                }
                                            </dd>
                                        </div>

                                        <div className="py-3">
                                            <dt>Checked in</dt>

                                            <dd className="mb-0">
                                                {new Date(
                                                    result.check_in
                                                        .checked_in_at
                                                ).toLocaleString(
                                                    "en-UG"
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                )}
                        </aside>
                    </div>
                </div>
            )}

            {events.length > 0 && (
                <section className="checkout-card mt-4">
                    <h2 className="h5 mb-3">
                        Available events
                    </h2>

                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Venue</th>
                                </tr>
                            </thead>

                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.event_id}>
                                        <td>
                                            {event.event_name}
                                        </td>

                                        <td>
                                            {formatDate(
                                                event.event_date
                                            )}
                                        </td>

                                        <td>
                                            {formatTime(
                                                event.start_time
                                            )}
                                            {" – "}
                                            {formatTime(
                                                event.end_time
                                            )}
                                        </td>

                                        <td>
                                            {event.venue_name},{" "}
                                            {event.city}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </section>
    );
}

export default CheckInPage;