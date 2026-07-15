import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import FormInput from "../../components/forms/FormInput";
import { eventApi } from "../../services/api";

const initialFormData = {
    ticket_name: "",
    description: "",
    price: "0",
    quantity_total: "",
    maximum_per_customer: "10",
    sale_start: "",
    sale_end: "",
    refund_eligible: true
};

function TicketTypesPage() {
    const { eventId } = useParams();

    const [eventRecord, setEventRecord] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [formData, setFormData] =
        useState(initialFormData);

    const [editingId, setEditingId] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const loadTicketTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await eventApi.getTicketTypes(
                eventId
            );

            setEventRecord(data.event);
            setTicketTypes(data.ticket_types || []);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to load ticket types."
            );
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        loadTicketTypes();
    }, [loadTicketTypes]);

    const handleChange = (changeEvent) => {
        const {
            name,
            value,
            type,
            checked
        } = changeEvent.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: type === "checkbox"
                ? checked
                : value
        }));

        setFieldErrors((currentErrors) => ({
            ...currentErrors,
            [name]: undefined
        }));

        setError("");
        setSuccessMessage("");
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingId(null);
        setFieldErrors({});
        setError("");
    };

    const handleSubmit = async (submitEvent) => {
        submitEvent.preventDefault();

        setSubmitting(true);
        setFieldErrors({});
        setError("");
        setSuccessMessage("");

        const ticketData = {
            ...formData,
            price: Number(formData.price),
            quantity_total:
                Number(formData.quantity_total),
            maximum_per_customer:
                Number(formData.maximum_per_customer),
            sale_start: formData.sale_start || null,
            sale_end: formData.sale_end || null
        };

        try {
            let data;

            if (editingId) {
                data = await eventApi.updateTicketType(
                    editingId,
                    ticketData
                );

                setTicketTypes((currentTypes) =>
                    currentTypes.map((ticketType) =>
                        ticketType.ticket_type_id
                        === editingId
                            ? data.ticket_type
                            : ticketType
                    )
                );
            } else {
                data = await eventApi.createTicketType(
                    eventId,
                    ticketData
                );

                setTicketTypes((currentTypes) => [
                    ...currentTypes,
                    data.ticket_type
                ]);
            }

            setSuccessMessage(data.message);
            resetForm();
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to save the ticket type."
            );

            if (
                requestError.errors
                && typeof requestError.errors === "object"
            ) {
                setFieldErrors(requestError.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const beginEditing = (ticketType) => {
        setEditingId(ticketType.ticket_type_id);

        setFormData({
            ticket_name: ticketType.ticket_name || "",
            description: ticketType.description || "",
            price: String(ticketType.price ?? 0),

            quantity_total: String(
                ticketType.quantity_total || ""
            ),

            maximum_per_customer: String(
                ticketType.maximum_per_customer || ""
            ),

            sale_start: ticketType.sale_start
                ? ticketType.sale_start.slice(0, 16)
                : "",

            sale_end: ticketType.sale_end
                ? ticketType.sale_end.slice(0, 16)
                : "",

            refund_eligible:
                ticketType.refund_eligible
        });

        setFieldErrors({});
        setError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (ticketType) => {
        const confirmed = window.confirm(
            `Delete the "${ticketType.ticket_name}" ticket type?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(ticketType.ticket_type_id);
            setError("");
            setSuccessMessage("");

            const data = await eventApi.deleteTicketType(
                ticketType.ticket_type_id
            );

            setTicketTypes((currentTypes) =>
                currentTypes.filter(
                    (item) =>
                        item.ticket_type_id
                        !== ticketType.ticket_type_id
                )
            );

            if (
                editingId
                === ticketType.ticket_type_id
            ) {
                resetForm();
            }

            setSuccessMessage(data.message);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to delete the ticket type."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const configuredQuantity = ticketTypes.reduce(
        (total, ticketType) =>
            total + Number(ticketType.quantity_total),
        0
    );

    const remainingCapacity = eventRecord
        ? Number(eventRecord.capacity)
            - configuredQuantity
        : 0;

    if (loading) {
        return (
            <div className="text-center py-5">
                <div
                    className="spinner-border"
                    role="status"
                    aria-label="Loading ticket types"
                />

                <p className="mt-3">
                    Loading ticket types...
                </p>
            </div>
        );
    }

    if (!eventRecord) {
        return (
            <div>
                <div className="alert alert-danger">
                    {error || "Event not found."}
                </div>

                <Link
                    to="/organiser/events"
                    className="btn btn-eventore-outline"
                >
                    Back to my events
                </Link>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                label="ORGANISER"
                title="Ticket types"
                description={`Configure tickets for ${eventRecord.event_name}.`}
                action={
                    <StatusBadge
                        status={eventRecord.status}
                    />
                }
            />

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="glass-card p-3 h-100">
                        <span className="small text-secondary">
                            Event capacity
                        </span>

                        <strong className="d-block fs-4">
                            {eventRecord.capacity}
                        </strong>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="glass-card p-3 h-100">
                        <span className="small text-secondary">
                            Configured tickets
                        </span>

                        <strong className="d-block fs-4">
                            {configuredQuantity}
                        </strong>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="glass-card p-3 h-100">
                        <span className="small text-secondary">
                            Remaining capacity
                        </span>

                        <strong className="d-block fs-4">
                            {remainingCapacity}
                        </strong>
                    </div>
                </div>
            </div>

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

            <form
                onSubmit={handleSubmit}
                className="event-form mb-5"
                noValidate
            >
                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>01</span>

                        <div>
                            <h2>
                                {editingId
                                    ? "Edit ticket type"
                                    : "Create ticket type"}
                            </h2>

                            <p>
                                Add General Admission, Student,
                                Early Bird, VIP, or another ticket.
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                label="Ticket name"
                                name="ticket_name"
                                value={formData.ticket_name}
                                onChange={handleChange}
                                placeholder="For example: General Admission"
                                error={fieldErrors.ticket_name}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="Price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                error={fieldErrors.price}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="ticket-description"
                            className="form-label"
                        >
                            Description
                        </label>

                        <textarea
                            id="ticket-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control eventore-textarea"
                            rows="3"
                            placeholder="Explain what this ticket includes."
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                label="Total quantity"
                                name="quantity_total"
                                type="number"
                                value={formData.quantity_total}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                error={
                                    fieldErrors.quantity_total
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="Maximum per customer"
                                name="maximum_per_customer"
                                type="number"
                                value={
                                    formData.maximum_per_customer
                                }
                                onChange={handleChange}
                                min="1"
                                step="1"
                                error={
                                    fieldErrors
                                        .maximum_per_customer
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                label="Sale starts"
                                name="sale_start"
                                type="datetime-local"
                                value={formData.sale_start}
                                onChange={handleChange}
                                error={fieldErrors.sale_start}
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="Sale closes"
                                name="sale_end"
                                type="datetime-local"
                                value={formData.sale_end}
                                onChange={handleChange}
                                error={fieldErrors.sale_end}
                            />
                        </div>
                    </div>

                    <div className="form-check mb-4">
                        <input
                            id="refund-eligible"
                            name="refund_eligible"
                            type="checkbox"
                            className="form-check-input"
                            checked={
                                formData.refund_eligible
                            }
                            onChange={handleChange}
                        />

                        <label
                            htmlFor="refund-eligible"
                            className="form-check-label"
                        >
                            This ticket is eligible for a refund
                        </label>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-eventore-outline"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel editing
                            </button>
                        )}

                        <button
                            type="submit"
                            className="btn btn-eventore"
                            disabled={
                                submitting
                                || eventRecord.status !== "draft"
                            }
                        >
                            {submitting
                                ? "Saving..."
                                : editingId
                                    ? "Save changes"
                                    : "Add ticket type"}
                        </button>
                    </div>
                </section>
            </form>

            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                <h2 className="h3 mb-0">
                    Configured ticket types
                </h2>

                <span className="text-secondary">
                    {ticketTypes.length} total
                </span>
            </div>

            {ticketTypes.length === 0 ? (
                <div className="glass-card p-5 text-center">
                    <h3>No ticket types yet</h3>

                    <p className="text-secondary mb-0">
                        Add at least one ticket type before
                        submitting this event for approval.
                    </p>
                </div>
            ) : (
                <div className="row g-4">
                    {ticketTypes.map((ticketType) => (
                        <div
                            className="col-md-6"
                            key={
                                ticketType.ticket_type_id
                            }
                        >
                            <article className="glass-card p-4 h-100">
                                <div className="d-flex justify-content-between gap-3">
                                    <div>
                                        <h3 className="h5">
                                            {
                                                ticketType.ticket_name
                                            }
                                        </h3>

                                        <p className="text-secondary">
                                            {
                                                ticketType.description
                                                || "No description"
                                            }
                                        </p>
                                    </div>

                                    <strong>
                                        {Number(
                                            ticketType.price
                                        ) === 0
                                            ? "Free"
                                            : Number(
                                                ticketType.price
                                            ).toLocaleString()}
                                    </strong>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <span className="small text-secondary d-block">
                                            Quantity
                                        </span>

                                        <strong>
                                            {
                                                ticketType.quantity_total
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="small text-secondary d-block">
                                            Maximum/customer
                                        </span>

                                        <strong>
                                            {
                                                ticketType
                                                    .maximum_per_customer
                                            }
                                        </strong>
                                    </div>
                                </div>

                                {eventRecord.status === "draft" && (
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-eventore-outline"
                                            onClick={() =>
                                                beginEditing(
                                                    ticketType
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                                handleDelete(
                                                    ticketType
                                                )
                                            }
                                            disabled={
                                                deletingId
                                                === ticketType
                                                    .ticket_type_id
                                            }
                                        >
                                            {deletingId
                                            === ticketType
                                                .ticket_type_id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                )}
                            </article>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <Link
                    to="/organiser/events"
                    className="btn btn-eventore-outline"
                >
                    Back to my events
                </Link>
            </div>
        </div>
    );
}

export default TicketTypesPage;