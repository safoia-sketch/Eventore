import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import EmptyState from "../../components/common/EmptyState";
import sampleEvents from "../../data/sampleEvents";

function CheckoutPage() {
    const { eventId } = useParams();

    const event = sampleEvents.find(
        (item) => item.id === Number(eventId)
    );

    const [ticketType, setTicketType] =
        useState("general");

    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");

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

    const ticketOptions =
        event.price === 0
            ? {
                  general: {
                      name: "General Admission",
                      price: 0
                  }
              }
            : {
                  general: {
                      name: "General Admission",
                      price: event.price
                  },
                  vip: {
                      name: "VIP",
                      price: event.price * 2
                  }
              };

    const selectedTicket =
        ticketOptions[ticketType];

    const total =
        selectedTicket.price * quantity;

    function handleTicketChange(event) {
        setTicketType(event.target.value);
        setMessage("");
    }

    function handleQuantityChange(event) {
        const nextQuantity = Number(event.target.value);

        setQuantity(
            Math.min(
                5,
                Math.max(1, nextQuantity)
            )
        );

        setMessage("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        setMessage(
            "Checkout structure is ready. The secure booking transaction will be connected on Day 4."
        );
    }

    return (
        <main className="checkout-page">
            <div className="container py-5">
                <Link
                    to={`/events/${event.id}`}
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
                                Choose a ticket type and quantity
                                for {event.name}.
                            </p>

                            {message && (
                                <div
                                    className="alert eventore-success-alert"
                                    role="status"
                                >
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <fieldset className="mb-4">
                                    <legend>
                                        Ticket type
                                    </legend>

                                    <div className="ticket-option-list">
                                        {Object.entries(
                                            ticketOptions
                                        ).map(
                                            ([
                                                key,
                                                ticket
                                            ]) => (
                                                <label
                                                    key={key}
                                                    className={`ticket-option ${
                                                        ticketType ===
                                                        key
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="ticketType"
                                                        value={key}
                                                        checked={
                                                            ticketType ===
                                                            key
                                                        }
                                                        onChange={
                                                            handleTicketChange
                                                        }
                                                    />

                                                    <span>
                                                        <strong>
                                                            {
                                                                ticket.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            Maximum
                                                            five per
                                                            booking
                                                        </small>
                                                    </span>

                                                    <b>
                                                        {ticket.price ===
                                                        0
                                                            ? "Free"
                                                            : `UGX ${ticket.price.toLocaleString()}`}
                                                    </b>
                                                </label>
                                            )
                                        )}
                                    </div>
                                </fieldset>

                                <div className="mb-4">
                                    <label
                                        htmlFor="ticket-quantity"
                                        className="form-label"
                                    >
                                        Quantity
                                    </label>

                                    <input
                                        id="ticket-quantity"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={quantity}
                                        onChange={
                                            handleQuantityChange
                                        }
                                        className="form-control eventore-input checkout-quantity"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-eventore w-100"
                                >
                                    Continue to test payment
                                </button>
                            </form>
                        </section>
                    </div>

                    <div className="col-lg-5">
                        <aside className="order-summary">
                            <p className="eventore-label">
                                ORDER SUMMARY
                            </p>

                            <h2>{event.name}</h2>

                            <dl>
                                <div>
                                    <dt>Date</dt>
                                    <dd>{event.date}</dd>
                                </div>

                                <div>
                                    <dt>Venue</dt>
                                    <dd>{event.venue}</dd>
                                </div>

                                <div>
                                    <dt>Ticket</dt>
                                    <dd>
                                        {selectedTicket.name}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Quantity</dt>
                                    <dd>{quantity}</dd>
                                </div>
                            </dl>

                            <div className="order-total">
                                <span>Total</span>

                                <strong>
                                    {total === 0
                                        ? "Free"
                                        : `UGX ${total.toLocaleString()}`}
                                </strong>
                            </div>

                            <p className="order-security-note">
                                Final prices and availability will
                                always be verified by the Eventore
                                server before confirming a booking.
                            </p>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default CheckoutPage;