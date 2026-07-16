import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import EmptyState from "../../components/common/EmptyState";
import {
    bookingApi,
    eventApi
} from "../../services/api";

function CheckoutPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [quantities, setQuantities] = useState({});

    const [simulatedOutcome, setSimulatedOutcome] =
        useState("successful");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        const loadCheckout = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await eventApi.getPublicEventById(
                        eventId
                    );

                if (ignore) {
                    return;
                }

                setEvent(data.event);
                setTicketTypes(data.ticket_types || []);

                const initialQuantities = {};

                for (const ticket of data.ticket_types || []) {
                    initialQuantities[
                        ticket.ticket_type_id
                    ] = 0;
                }

                setQuantities(initialQuantities);
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

        loadCheckout();

        return () => {
            ignore = true;
        };
    }, [eventId]);

    function isTicketAvailable(ticket) {
        const now = new Date();

        const saleHasStarted =
            !ticket.sale_start
            || new Date(ticket.sale_start) <= now;

        const saleHasNotEnded =
            !ticket.sale_end
            || new Date(ticket.sale_end) >= now;

        return (
            Number(ticket.quantity_remaining) > 0
            && saleHasStarted
            && saleHasNotEnded
        );
    }

    function getMaximumQuantity(ticket) {
        return Math.min(
            Number(ticket.maximum_per_customer),
            Number(ticket.quantity_remaining)
        );
    }

    function handleQuantityChange(
        ticket,
        nextValue
    ) {
        const maximum = getMaximumQuantity(ticket);

        const normalizedQuantity = Math.min(
            maximum,
            Math.max(0, Number(nextValue) || 0)
        );

        setQuantities((currentQuantities) => ({
            ...currentQuantities,
            [ticket.ticket_type_id]:
                normalizedQuantity
        }));

        setError("");
        setMessage("");
    }

    const selectedItems = useMemo(() => {
        return ticketTypes
            .map((ticket) => {
                const quantity =
                    quantities[
                        ticket.ticket_type_id
                    ] || 0;

                const unitPrice = Number(ticket.price);

                return {
                    ...ticket,
                    quantity,
                    unitPrice,
                    subtotal: unitPrice * quantity
                };
            })
            .filter((ticket) => ticket.quantity > 0);
    }, [ticketTypes, quantities]);

    const displayTotal = useMemo(() => {
        return selectedItems.reduce(
            (total, ticket) =>
                total + ticket.subtotal,
            0
        );
    }, [selectedItems]);

    const selectedQuantity = useMemo(() => {
        return selectedItems.reduce(
            (total, ticket) =>
                total + ticket.quantity,
            0
        );
    }, [selectedItems]);

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

    function getAvailabilityMessage(ticket) {
        if (Number(ticket.quantity_remaining) <= 0) {
            return "Sold out";
        }

        const now = new Date();

        if (
            ticket.sale_start
            && new Date(ticket.sale_start) > now
        ) {
            return "Sales have not started";
        }

        if (
            ticket.sale_end
            && new Date(ticket.sale_end) < now
        ) {
            return "Sales have ended";
        }

        return `${ticket.quantity_remaining} remaining`;
    }

    async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    if (selectedItems.length === 0) {
        setError(
            "Select at least one ticket before continuing."
        );

        return;
    }

    const storageKey =
        `eventore-checkout-${event.event_id}`;

    let idempotencyKey =
        sessionStorage.getItem(storageKey);

    if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();

        sessionStorage.setItem(
            storageKey,
            idempotencyKey
        );
    }

    try {
        setSubmitting(true);
        setError("");
        setMessage("");

        const result =
            await bookingApi.createBooking({
                event_id: event.event_id,

                items: selectedItems.map(
                    (ticket) => ({
                        ticket_type_id:
                            ticket.ticket_type_id,

                        quantity: ticket.quantity
                    })
                ),

                idempotency_key: idempotencyKey,

                simulated_outcome:
                    displayTotal === 0
                        ? "successful"
                        : simulatedOutcome
            });

        if (
            result.payment_status === "failed"
        ) {
            /*
             * A failed payment may be retried using a new
             * checkout request key.
             */
            sessionStorage.removeItem(storageKey);

            setMessage(result.message);

            return;
        }

        sessionStorage.removeItem(storageKey);

        navigate(
        `/bookings/${result.booking.booking_id}/confirmation`,
        {
        replace: true
        }
        ); 
        /*
         * Keep the key while this page remains open.
         * A second click will return the same booking.
         */
    } catch (requestError) {
        setError(requestError.message);
    } finally {
        setSubmitting(false);
    }
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
                        Loading checkout...
                    </p>
                </div>
            </main>
        );
    }

    if (error && !event) {
        return (
            <main className="container py-5">
                <EmptyState
                    title="Unable to open checkout"
                    description={error}
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

    if (!event) {
        return (
            <main className="container py-5">
                <EmptyState
                    title="Event not found"
                    description="The event for this checkout could not be found."
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
        <main className="checkout-page">
            <div className="container py-5">
                <Link
                    to={`/events/${event.event_id}`}
                    className="event-back-link checkout-back-link"
                >
                    ← Return to event
                </Link>

                <div className="row g-5">
                    <div className="col-lg-7">
                        <section className="checkout-card">
                            <p className="eventore-label">
                                CHECKOUT
                            </p>

                            <h1>Select your tickets</h1>

                            <p className="checkout-description">
                                Choose ticket quantities for{" "}
                                {event.event_name}.
                            </p>

                            {error && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div
                                    className="alert eventore-success-alert"
                                    role="status"
                                >
                                    {message}
                                </div>
                            )}

                            {ticketTypes.length === 0 ? (
                                <EmptyState
                                    title="No tickets available"
                                    description="This event does not currently have ticket types available for booking."
                                />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <fieldset className="mb-4">
                                        <legend>
                                            Ticket types
                                        </legend>

                                        <div className="ticket-option-list">
                                            {ticketTypes.map(
                                                (ticket) => {
                                                    const available =
                                                        isTicketAvailable(
                                                            ticket
                                                        );

                                                    const maximum =
                                                        getMaximumQuantity(
                                                            ticket
                                                        );

                                                    const quantity =
                                                        quantities[
                                                            ticket
                                                                .ticket_type_id
                                                        ] || 0;

                                                    return (
                                                        <div
                                                            key={
                                                                ticket.ticket_type_id
                                                            }
                                                            className={`ticket-option ${
                                                                quantity >
                                                                0
                                                                    ? "selected"
                                                                    : ""
                                                            } ${
                                                                !available
                                                                    ? "opacity-50"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {
                                                                        ticket.ticket_name
                                                                    }
                                                                </strong>

                                                                {ticket.description && (
                                                                    <small className="d-block">
                                                                        {
                                                                            ticket.description
                                                                        }
                                                                    </small>
                                                                )}

                                                                <small className="d-block">
                                                                    {
                                                                        getAvailabilityMessage(
                                                                            ticket
                                                                        )
                                                                    }
                                                                </small>

                                                                <small className="d-block">
                                                                    Maximum{" "}
                                                                    {
                                                                        ticket.maximum_per_customer
                                                                    }{" "}
                                                                    per
                                                                    customer
                                                                </small>
                                                            </div>

                                                            <div className="text-end">
                                                                <b className="d-block mb-2">
                                                                    {formatMoney(
                                                                        ticket.price
                                                                    )}
                                                                </b>

                                                                <label
                                                                    htmlFor={`ticket-${ticket.ticket_type_id}`}
                                                                    className="visually-hidden"
                                                                >
                                                                    Quantity
                                                                    for{" "}
                                                                    {
                                                                        ticket.ticket_name
                                                                    }
                                                                </label>

                                                                <input
                                                                    id={`ticket-${ticket.ticket_type_id}`}
                                                                    type="number"
                                                                    min="0"
                                                                    max={
                                                                        maximum
                                                                    }
                                                                    value={
                                                                        quantity
                                                                    }
                                                                    disabled={
                                                                        !available
                                                                    }
                                                                    onChange={(
                                                                        changeEvent
                                                                    ) =>
                                                                        handleQuantityChange(
                                                                            ticket,
                                                                            changeEvent
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="form-control eventore-input checkout-quantity"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </fieldset>

                                    {displayTotal > 0 && (
                                        <fieldset className="mb-4">
                                         <legend>
                                          Simulated payment outcome
                                         </legend>

                                         <label
                                            className={`ticket-option ${
                                            simulatedOutcome === "successful"
                                            ? "selected"
                                             : ""
                                             }`}
                                         >
                                        <input
                                        type="radio"
                                        name="simulatedOutcome"
                                        value="successful"
                                        checked={
                                        simulatedOutcome ===
                                         "successful"
                                    }
                onChange={(changeEvent) =>
                    setSimulatedOutcome(
                        changeEvent.target.value
                    )
                }
            />

            <span>
                <strong>
                    Successful test payment
                </strong>

                <small>
                    Simulate an approved payment.
                    No real money is charged.
                </small>
            </span>
        </label>

        <label
            className={`ticket-option ${
                simulatedOutcome === "failed"
                    ? "selected"
                    : ""
            }`}
        >
            <input
                type="radio"
                name="simulatedOutcome"
                value="failed"
                checked={
                    simulatedOutcome === "failed"
                }
                onChange={(changeEvent) =>
                    setSimulatedOutcome(
                        changeEvent.target.value
                    )
                }
            />

            <span>
                <strong>
                    Failed test payment
                </strong>

                <small>
                    Test the failure response without
                    creating tickets or reducing
                    availability.
                </small>
            </span>
        </label>
    </fieldset>
)}

                                    <button
                                        type="submit"
                                        className="btn btn-eventore w-100"
                                        disabled={
                                            submitting
                                            || selectedItems.length ===
                                                0
                                        }
                                    >
                                        {submitting
                                            ? "Processing..."
                                            : displayTotal === 0
                                              ? "Confirm free booking"
                                              : "Complete test payment"}
                                    </button>
                                </form>
                            )}
                        </section>
                    </div>

                    <div className="col-lg-5">
                        <aside className="order-summary">
                            <p className="eventore-label">
                                ORDER SUMMARY
                            </p>

                            <h2>{event.event_name}</h2>

                            <dl>
                                <div>
                                    <dt>Date</dt>

                                    <dd>
                                        {formatDate(
                                            event.event_date
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Venue</dt>

                                    <dd>
                                        {event.venue_name},{" "}
                                        {event.city}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Tickets</dt>

                                    <dd>
                                        {selectedQuantity}
                                    </dd>
                                </div>
                            </dl>

                            {selectedItems.length > 0 && (
                                <div className="mb-4">
                                    {selectedItems.map(
                                        (ticket) => (
                                            <div
                                                key={
                                                    ticket.ticket_type_id
                                                }
                                                className="d-flex justify-content-between gap-3 mb-2"
                                            >
                                                <span>
                                                    {
                                                        ticket.quantity
                                                    }{" "}
                                                    ×{" "}
                                                    {
                                                        ticket.ticket_name
                                                    }
                                                </span>

                                                <strong>
                                                    {formatMoney(
                                                        ticket.subtotal
                                                    )}
                                                </strong>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            <div className="order-total">
                                <span>Total</span>

                                <strong>
                                    {formatMoney(displayTotal)}
                                </strong>
                            </div>

                            <p className="order-security-note">
                                This displayed total is
                                informational. Eventore will verify
                                prices and availability again on the
                                server before confirming the booking.
                            </p>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default CheckoutPage;