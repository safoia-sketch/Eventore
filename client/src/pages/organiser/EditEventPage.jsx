import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import FormInput from "../../components/forms/FormInput";
import { eventApi } from "../../services/api";

const initialFormData = {
    event_name: "",
    category_id: "",
    description: "",
    image_url: "",
    venue_name: "",
    address: "",
    city: "",
    event_date: "",
    start_time: "",
    end_time: "",
    capacity: "",
    refund_deadline: "",
    refund_policy: "",
    contact_email: ""
};

function EditEventPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] =
        useState(initialFormData);

    const [categories, setCategories] = useState([]);
    const [eventStatus, setEventStatus] = useState("draft");
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const minimumDate = new Date()
        .toISOString()
        .split("T")[0];

    useEffect(() => {
        let active = true;

        const loadPageData = async () => {
            try {
                setLoading(true);
                setGeneralError("");

                const [
                    eventResponse,
                    categoryResponse
                ] = await Promise.all([
                    eventApi.getMyEventById(eventId),
                    eventApi.getCategories()
                ]);

                if (!active) {
                    return;
                }

                const eventRecord = eventResponse.event;

                setCategories(
                    categoryResponse.categories || []
                );

                setEventStatus(eventRecord.status);

                setFormData({
                    event_name:
                        eventRecord.event_name || "",

                    category_id:
                        String(eventRecord.category_id || ""),

                    description:
                        eventRecord.description || "",

                    image_url:
                        eventRecord.image_url || "",

                    venue_name:
                        eventRecord.venue_name || "",

                    address:
                        eventRecord.address || "",

                    city:
                        eventRecord.city || "",

                    event_date:
                        eventRecord.event_date
                            ? eventRecord.event_date.slice(0, 10)
                            : "",

                    start_time:
                        eventRecord.start_time
                            ? eventRecord.start_time.slice(0, 5)
                            : "",

                    end_time:
                        eventRecord.end_time
                            ? eventRecord.end_time.slice(0, 5)
                            : "",

                    capacity:
                        String(eventRecord.capacity || ""),

                    refund_deadline:
                        eventRecord.refund_deadline
                            ? eventRecord.refund_deadline.slice(
                                0,
                                16
                            )
                            : "",

                    refund_policy:
                        eventRecord.refund_policy || "",

                    contact_email:
                        eventRecord.contact_email || ""
                });
            } catch (error) {
                if (active) {
                    setGeneralError(
                        error.message
                        || "Unable to load the event."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadPageData();

        return () => {
            active = false;
        };
    }, [eventId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));

        setFieldErrors((currentErrors) => ({
            ...currentErrors,
            [name]: undefined
        }));

        setGeneralError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setFieldErrors({});
        setGeneralError("");

        try {
            const eventData = {
                ...formData,
                category_id: Number(formData.category_id),
                capacity: Number(formData.capacity),
                image_url: formData.image_url || null,
                refund_deadline:
                    formData.refund_deadline || null,
                refund_policy:
                    formData.refund_policy || null
            };

            await eventApi.updateEvent(
                eventId,
                eventData
            );

            navigate("/organiser/events");
        } catch (error) {
            setGeneralError(
                error.message || "Unable to update the event."
            );

            if (
                error.errors
                && typeof error.errors === "object"
            ) {
                setFieldErrors(error.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div
                    className="spinner-border"
                    role="status"
                    aria-label="Loading event"
                />

                <p className="mt-3">Loading event...</p>
            </div>
        );
    }

    if (generalError && !formData.event_name) {
        return (
            <div>
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {generalError}
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

    if (eventStatus !== "draft") {
        return (
            <div>
                <PageHeader
                    label="ORGANISER"
                    title="Event cannot be edited"
                    description="Only draft events can be edited."
                    action={
                        <StatusBadge status={eventStatus} />
                    }
                />

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
                title="Edit event"
                description="Update the information for your draft event."
                action={
                    <StatusBadge status={eventStatus} />
                }
            />

            {generalError && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {generalError}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="event-form"
                noValidate
            >
                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>01</span>

                        <div>
                            <h2>Basic information</h2>

                            <p>
                                Update the event’s public
                                information.
                            </p>
                        </div>
                    </div>

                    <FormInput
                        label="Event name"
                        name="event_name"
                        value={formData.event_name}
                        onChange={handleChange}
                        error={fieldErrors.event_name}
                        required
                    />

                    <div className="mb-3">
                        <label
                            htmlFor="edit-category"
                            className="form-label"
                        >
                            Category *
                        </label>

                        <select
                            id="edit-category"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className={`form-select eventore-input ${
                                fieldErrors.category_id
                                    ? "is-invalid"
                                    : ""
                            }`}
                            required
                        >
                            <option value="">
                                Select a category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.category_id}
                                    value={category.category_id}
                                >
                                    {category.category_name}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.category_id && (
                            <div className="invalid-feedback">
                                {fieldErrors.category_id}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="edit-description"
                            className="form-label"
                        >
                            Description *
                        </label>

                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`form-control eventore-textarea ${
                                fieldErrors.description
                                    ? "is-invalid"
                                    : ""
                            }`}
                            rows="6"
                            required
                        />

                        {fieldErrors.description && (
                            <div className="invalid-feedback">
                                {fieldErrors.description}
                            </div>
                        )}
                    </div>

                    <FormInput
                        label="Event image URL"
                        name="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={handleChange}
                        error={fieldErrors.image_url}
                    />
                </section>

                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>02</span>

                        <div>
                            <h2>Venue and location</h2>

                            <p>
                                Update where the event takes place.
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                label="Venue name"
                                name="venue_name"
                                value={formData.venue_name}
                                onChange={handleChange}
                                error={fieldErrors.venue_name}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={fieldErrors.city}
                                required
                            />
                        </div>
                    </div>

                    <FormInput
                        label="Full address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={fieldErrors.address}
                        required
                    />
                </section>

                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>03</span>

                        <div>
                            <h2>Date and capacity</h2>

                            <p>
                                Update the schedule and attendance
                                limit.
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <FormInput
                                label="Event date"
                                name="event_date"
                                type="date"
                                value={formData.event_date}
                                onChange={handleChange}
                                min={minimumDate}
                                error={fieldErrors.event_date}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <FormInput
                                label="Start time"
                                name="start_time"
                                type="time"
                                value={formData.start_time}
                                onChange={handleChange}
                                error={fieldErrors.start_time}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <FormInput
                                label="End time"
                                name="end_time"
                                type="time"
                                value={formData.end_time}
                                onChange={handleChange}
                                error={fieldErrors.end_time}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                label="Event capacity"
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                error={fieldErrors.capacity}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="Refund deadline"
                                name="refund_deadline"
                                type="datetime-local"
                                value={formData.refund_deadline}
                                onChange={handleChange}
                                error={
                                    fieldErrors.refund_deadline
                                }
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="edit-refund-policy"
                            className="form-label"
                        >
                            Refund policy
                        </label>

                        <textarea
                            id="edit-refund-policy"
                            name="refund_policy"
                            value={formData.refund_policy}
                            onChange={handleChange}
                            className="form-control eventore-textarea"
                            rows="4"
                        />
                    </div>
                </section>

                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>04</span>

                        <div>
                            <h2>Contact information</h2>

                            <p>
                                Update the attendee contact email.
                            </p>
                        </div>
                    </div>

                    <FormInput
                        label="Contact email"
                        name="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        error={fieldErrors.contact_email}
                        required
                    />
                </section>

                <div className="event-form-actions">
                    <Link
                        to="/organiser/events"
                        className="btn btn-eventore-outline"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="btn btn-eventore"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Saving changes..."
                            : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditEventPage;