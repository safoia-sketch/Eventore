import {
    useCallback,
    useEffect,
    useState
} from "react";

import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { adminApi } from "../../services/api";


function AdminEventsPage() {
    const [events, setEvents] = useState([]);
    const [eventDetails, setEventDetails] = useState({});
    const [rejectionReasons, setRejectionReasons] =
        useState({});

    const [loading, setLoading] = useState(true);
    const [reviewingId, setReviewingId] = useState(null);
    const [approvingId, setApprovingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [openRejectionId, setOpenRejectionId] =
        useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Load pending events
    |--------------------------------------------------------------------------
    */

    const loadPendingEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminApi.getPendingEvents();

            setEvents(data.events || []);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to load pending events."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPendingEvents();
    }, [loadPendingEvents]);


    /*
    |--------------------------------------------------------------------------
    | Load event details and ticket types
    |--------------------------------------------------------------------------
    */

    const handleReview = async (eventId) => {
        if (eventDetails[eventId]) {
            setEventDetails((currentDetails) => {
                const updatedDetails = {
                    ...currentDetails
                };

                delete updatedDetails[eventId];

                return updatedDetails;
            });

            return;
        }

        try {
            setReviewingId(eventId);
            setError("");

            const data = await adminApi.getPendingEvent(
                eventId
            );

            setEventDetails((currentDetails) => ({
                ...currentDetails,
                [eventId]: data
            }));
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to load event details."
            );
        } finally {
            setReviewingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Approve and publish event
    |--------------------------------------------------------------------------
    */

    const handleApprove = async (eventRecord) => {
        const confirmed = window.confirm(
            `Approve and publish "${eventRecord.event_name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setApprovingId(eventRecord.event_id);
            setError("");
            setSuccessMessage("");

            const data = await adminApi.approveEvent(
                eventRecord.event_id
            );

            setEvents((currentEvents) =>
                currentEvents.filter(
                    (item) =>
                        item.event_id
                        !== eventRecord.event_id
                )
            );

            setSuccessMessage(data.message);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to approve the event."
            );
        } finally {
            setApprovingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Return event to draft
    |--------------------------------------------------------------------------
    */

    const handleReject = async (eventRecord) => {
        const reason =
            rejectionReasons[eventRecord.event_id]?.trim();

        if (!reason) {
            setError(
                "Enter the changes required before returning the event to draft."
            );

            return;
        }

        const confirmed = window.confirm(
            `Return "${eventRecord.event_name}" to the organiser as a draft?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setRejectingId(eventRecord.event_id);
            setError("");
            setSuccessMessage("");

            const data = await adminApi.rejectEvent(
                eventRecord.event_id,
                reason
            );

            setEvents((currentEvents) =>
                currentEvents.filter(
                    (item) =>
                        item.event_id
                        !== eventRecord.event_id
                )
            );

            setOpenRejectionId(null);
            setSuccessMessage(data.message);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to return the event to draft."
            );
        } finally {
            setRejectingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Formatting
    |--------------------------------------------------------------------------
    */

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Date unavailable";
        }

        return new Intl.DateTimeFormat(
            "en-UG",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Africa/Kampala"
            }
        ).format(new Date(dateValue));
    };

    const formatPrice = (price) => {
        const numericPrice = Number(price);

        if (numericPrice === 0) {
            return "Free";
        }

        return numericPrice.toLocaleString();
    };


    return (
        <div>
            <PageHeader
                label="ADMINISTRATOR"
                title="Event approvals"
                description="Review pending events and their ticket types before publication."
                action={
                    <span className="badge text-bg-dark">
                        {events.length} pending
                    </span>
                }
            />

            {successMessage && (
                <div
                    className="alert eventore-success-alert"
                    role="status"
                >
                    {successMessage}
                </div>
            )}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                        aria-label="Loading pending events"
                    />

                    <p className="mt-3">
                        Loading pending events...
                    </p>
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="glass-card p-5 text-center">
                    <h2>No pending events</h2>

                    <p className="text-secondary mb-0">
                        All submitted events have been reviewed.
                    </p>
                </div>
            )}

            {!loading && events.length > 0 && (
                <div className="d-grid gap-4">
                    {events.map((eventRecord) => {
                        const details =
                            eventDetails[
                                eventRecord.event_id
                            ];

                        return (
                            <article
                                className="glass-card p-4"
                                key={eventRecord.event_id}
                            >
                                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                                    <div>
                                        <p className="text-uppercase small text-secondary mb-2">
                                            {
                                                eventRecord.category_name
                                            }
                                        </p>

                                        <h2 className="h3 mb-2">
                                            {
                                                eventRecord.event_name
                                            }
                                        </h2>

                                        <p className="text-secondary mb-0">
                                            Submitted by{" "}
                                            <strong>
                                                {
                                                    eventRecord.organiser_name
                                                }
                                            </strong>
                                            {" · "}
                                            {
                                                eventRecord.organiser_email
                                            }
                                        </p>
                                    </div>

                                    <StatusBadge
                                        status={
                                            eventRecord.status
                                        }
                                    />
                                </div>

                                <p>
                                    {eventRecord.description}
                                </p>

                                <div className="row g-3 mb-4">
                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                eventRecord.event_date
                                            )}
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Location
                                        </span>

                                        <strong>
                                            {eventRecord.city}
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Capacity
                                        </span>

                                        <strong>
                                            {
                                                eventRecord.capacity
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Configured tickets
                                        </span>

                                        <strong>
                                            {
                                                eventRecord
                                                    .configured_ticket_quantity
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Venue
                                        </span>

                                        <strong>
                                            {
                                                eventRecord.venue_name
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Ticket types
                                        </span>

                                        <strong>
                                            {
                                                eventRecord.ticket_type_count
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Starting price
                                        </span>

                                        <strong>
                                            {formatPrice(
                                                eventRecord.minimum_price
                                            )}
                                        </strong>
                                    </div>

                                    <div className="col-6 col-lg-3">
                                        <span className="small text-secondary d-block">
                                            Contact
                                        </span>

                                        <strong>
                                            {
                                                eventRecord.contact_email
                                            }
                                        </strong>
                                    </div>
                                </div>

                                {details && (
                                    <div className="border-top border-bottom py-4 mb-4">
                                        <h3 className="h5">
                                            Ticket types
                                        </h3>

                                        {details.ticket_types
                                            .length === 0 ? (
                                            <p className="text-secondary mb-0">
                                                No ticket types
                                                configured.
                                            </p>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                Name
                                                            </th>

                                                            <th>
                                                                Price
                                                            </th>

                                                            <th>
                                                                Quantity
                                                            </th>

                                                            <th>
                                                                Max/customer
                                                            </th>

                                                            <th>
                                                                Refund
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {details.ticket_types.map(
                                                            (
                                                                ticket
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        ticket.ticket_type_id
                                                                    }
                                                                >
                                                                    <td>
                                                                        {
                                                                            ticket.ticket_name
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {formatPrice(
                                                                            ticket.price
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            ticket.quantity_total
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            ticket.maximum_per_customer
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        {ticket.refund_eligible
                                                                            ? "Yes"
                                                                            : "No"}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <h3 className="h5 mt-4">
                                            Refund policy
                                        </h3>

                                        <p className="mb-0">
                                            {
                                                details.event
                                                    .refund_policy
                                                || "No refund policy provided."
                                            }
                                        </p>
                                    </div>
                                )}

                                {openRejectionId
                                    === eventRecord.event_id && (
                                    <div className="mb-4">
                                        <label
                                            htmlFor={`rejection-${eventRecord.event_id}`}
                                            className="form-label"
                                        >
                                            Required changes
                                        </label>

                                        <textarea
                                            id={`rejection-${eventRecord.event_id}`}
                                            className="form-control eventore-textarea"
                                            rows="4"
                                            maxLength="1000"
                                            value={
                                                rejectionReasons[
                                                    eventRecord
                                                        .event_id
                                                ] || ""
                                            }
                                            onChange={(
                                                changeEvent
                                            ) =>
                                                setRejectionReasons(
                                                    (
                                                        currentReasons
                                                    ) => ({
                                                        ...currentReasons,
                                                        [eventRecord
                                                            .event_id]:
                                                            changeEvent
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                            placeholder="Explain what the organiser must change before submitting again."
                                        />
                                    </div>
                                )}

                                <div className="d-flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-eventore-outline"
                                        onClick={() =>
                                            handleReview(
                                                eventRecord.event_id
                                            )
                                        }
                                        disabled={
                                            reviewingId
                                            === eventRecord.event_id
                                        }
                                    >
                                        {reviewingId
                                        === eventRecord.event_id
                                            ? "Loading..."
                                            : details
                                                ? "Hide details"
                                                : "Review details"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-eventore"
                                        onClick={() =>
                                            handleApprove(
                                                eventRecord
                                            )
                                        }
                                        disabled={
                                            approvingId
                                            === eventRecord.event_id
                                        }
                                    >
                                        {approvingId
                                        === eventRecord.event_id
                                            ? "Publishing..."
                                            : "Approve and publish"}
                                    </button>

                                    {openRejectionId
                                    !== eventRecord.event_id ? (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => {
                                                setOpenRejectionId(
                                                    eventRecord.event_id
                                                );

                                                setError("");
                                            }}
                                        >
                                            Return to draft
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    handleReject(
                                                        eventRecord
                                                    )
                                                }
                                                disabled={
                                                    rejectingId
                                                    === eventRecord.event_id
                                                }
                                            >
                                                {rejectingId
                                                === eventRecord.event_id
                                                    ? "Returning..."
                                                    : "Confirm return"}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-eventore-outline"
                                                onClick={() =>
                                                    setOpenRejectionId(
                                                        null
                                                    )
                                                }
                                                disabled={
                                                    rejectingId
                                                    === eventRecord.event_id
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminEventsPage;
