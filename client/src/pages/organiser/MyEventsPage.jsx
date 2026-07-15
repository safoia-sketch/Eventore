import {
    useCallback,
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { eventApi } from "../../services/api";


function MyEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [deletingId, setDeletingId] =
        useState(null);

    const [submittingId, setSubmittingId] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | Load organiser events
    |--------------------------------------------------------------------------
    */

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await eventApi.getMyEvents();

            setEvents(data.events || []);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to load your events."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);


    /*
    |--------------------------------------------------------------------------
    | Submit event for administrator approval
    |--------------------------------------------------------------------------
    */

    const handleSubmitForApproval = async (
        eventRecord
    ) => {
        const confirmed = window.confirm(
            `Submit "${eventRecord.event_name}" for administrator approval? You will not be able to edit it while it is pending.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubmittingId(eventRecord.event_id);
            setError("");
            setSuccessMessage("");

            const data = await eventApi.submitEvent(
                eventRecord.event_id
            );

            setEvents((currentEvents) =>
                currentEvents.map((item) =>
                    item.event_id
                    === eventRecord.event_id
                        ? {
                            ...item,
                            ...data.event
                        }
                        : item
                )
            );

            setSuccessMessage(data.message);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to submit the event."
            );
        } finally {
            setSubmittingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Delete draft event
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (eventRecord) => {
        const confirmed = window.confirm(
            `Delete "${eventRecord.event_name}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(eventRecord.event_id);
            setError("");
            setSuccessMessage("");

            const data = await eventApi.deleteEvent(
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
                || "Unable to delete the event."
            );
        } finally {
            setDeletingId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Format date
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
                month: "short",
                year: "numeric",
                timeZone: "UTC"
            }
        ).format(new Date(dateValue));
    };


    return (
        <div>
            <PageHeader
                label="ORGANISER"
                title="My events"
                description="Create, review and manage your events."
                action={
                    <Link
                        to="/organiser/events/new"
                        className="btn btn-eventore"
                    >
                        Create event
                    </Link>
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
                        aria-label="Loading events"
                    />

                    <p className="mt-3 mb-0">
                        Loading your events...
                    </p>
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="glass-card text-center p-5">
                    <h2>No events yet</h2>

                    <p className="text-secondary">
                        Create your first event to begin
                        configuring tickets.
                    </p>

                    <Link
                        to="/organiser/events/new"
                        className="btn btn-eventore"
                    >
                        Create your first event
                    </Link>
                </div>
            )}

            {!loading && events.length > 0 && (
                <div className="row g-4">
                    {events.map((eventRecord) => (
                        <div
                            className="col-12 col-xl-6"
                            key={eventRecord.event_id}
                        >
                            <article className="glass-card h-100 p-4">
                                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                    <div>
                                        <p className="text-uppercase small text-secondary mb-2">
                                            {
                                                eventRecord.category_name
                                            }
                                        </p>

                                        <h2 className="h4 mb-0">
                                            {
                                                eventRecord.event_name
                                            }
                                        </h2>
                                    </div>

                                    <StatusBadge
                                        status={
                                            eventRecord.status
                                        }
                                    />
                                </div>

                                <p className="text-secondary">
                                    {
                                        eventRecord.description
                                    }
                                </p>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <span className="d-block small text-secondary">
                                            Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                eventRecord.event_date
                                            )}
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="d-block small text-secondary">
                                            Location
                                        </span>

                                        <strong>
                                            {eventRecord.city}
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="d-block small text-secondary">
                                            Capacity
                                        </span>

                                        <strong>
                                            {
                                                eventRecord.capacity
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="d-block small text-secondary">
                                            Ticket types
                                        </span>

                                        <strong>
                                            {
                                                eventRecord.ticket_type_count
                                            }
                                        </strong>
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    {eventRecord.status ===
                                        "draft" && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-eventore"
                                                onClick={() =>
                                                    handleSubmitForApproval(
                                                        eventRecord
                                                    )
                                                }
                                                disabled={
                                                    submittingId
                                                    === eventRecord.event_id
                                                }
                                            >
                                                {submittingId
                                                === eventRecord.event_id
                                                    ? "Submitting..."
                                                    : "Submit for approval"}
                                            </button>

                                            <Link
                                                to={`/organiser/events/${eventRecord.event_id}/tickets`}
                                                className="btn btn-eventore-outline"
                                            >
                                                Manage tickets
                                            </Link>

                                            <Link
                                                to={`/organiser/events/${eventRecord.event_id}/edit`}
                                                className="btn btn-eventore-outline"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(
                                                        eventRecord
                                                    )
                                                }
                                                disabled={
                                                    deletingId
                                                    === eventRecord.event_id
                                                }
                                            >
                                                {deletingId
                                                === eventRecord.event_id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </>
                                    )}

                                    {eventRecord.status ===
                                        "pending" && (
                                        <span className="text-secondary">
                                            Waiting for administrator
                                            approval
                                        </span>
                                    )}

                                    {eventRecord.status ===
                                        "published" && (
                                        <span className="text-success">
                                            This event is published
                                            and visible to the public.
                                        </span>
                                    )}

                                    {eventRecord.status ===
                                        "cancelled" && (
                                        <span className="text-danger">
                                            This event has been
                                            cancelled.
                                        </span>
                                    )}
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyEventsPage;