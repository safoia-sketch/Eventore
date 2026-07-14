import { useState } from "react";

import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import FormInput from "../../components/forms/FormInput";

const initialFormData = {
    eventName: "",
    category: "",
    description: "",
    imageUrl: "",
    venueName: "",
    address: "",
    city: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    capacity: "",
    refundDeadline: "",
    contactEmail: ""
};

const categories = [
    "Music",
    "Technology",
    "Business",
    "Education",
    "Arts and Culture",
    "Sports",
    "Community",
    "Food and Drink",
    "Health and Wellness",
    "Other"
];

function CreateEventPage() {
    const [formData, setFormData] =
        useState(initialFormData);

    const [message, setMessage] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));

        setMessage("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        console.log("Event form ready:", formData);

        setMessage(
            "The event form is ready. Database creation will be connected on Day 3."
        );
    }

    function clearForm() {
        setFormData(initialFormData);
        setMessage("");
    }

    return (
        <div>
            <PageHeader
                label="ORGANISER"
                title="Create an event"
                description="Enter the essential information for your new event."
                action={<StatusBadge status="draft" />}
            />

            {message && (
                <div
                    className="alert eventore-success-alert"
                    role="status"
                >
                    {message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="event-form"
            >
                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>01</span>

                        <div>
                            <h2>Basic information</h2>
                            <p>
                                Introduce the event to potential
                                attendees.
                            </p>
                        </div>
                    </div>

                    <FormInput
                        label="Event name"
                        name="eventName"
                        value={formData.eventName}
                        onChange={handleChange}
                        placeholder="For example: Kampala Technology Summit"
                        required
                    />

                    <div className="mb-3">
                        <label
                            htmlFor="event-category"
                            className="form-label"
                        >
                            Category
                            <span className="required-mark">
                                {" "}*
                            </span>
                        </label>

                        <select
                            id="event-category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-select eventore-input"
                            required
                        >
                            <option value="">
                                Select a category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="event-description"
                            className="form-label"
                        >
                            Description
                            <span className="required-mark">
                                {" "}*
                            </span>
                        </label>

                        <textarea
                            id="event-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control eventore-textarea"
                            rows="6"
                            placeholder="Describe the event, its purpose and what attendees can expect."
                            required
                        ></textarea>
                    </div>

                    <FormInput
                        label="Event image URL"
                        name="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/event-image.jpg"
                    />
                </section>

                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>02</span>

                        <div>
                            <h2>Venue and location</h2>
                            <p>
                                Tell attendees where the event will
                                take place.
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                label="Venue name"
                                name="venueName"
                                value={formData.venueName}
                                onChange={handleChange}
                                placeholder="For example: Innovation Village"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="For example: Kampala"
                                required
                            />
                        </div>
                    </div>

                    <FormInput
                        label="Full address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, area and venue directions"
                        required
                    />
                </section>

                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>03</span>

                        <div>
                            <h2>Date and capacity</h2>
                            <p>
                                Configure when the event happens and
                                how many people may attend.
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <FormInput
                                label="Event date"
                                name="eventDate"
                                type="date"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <FormInput
                                label="Start time"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-4">
                            <FormInput
                                label="End time"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
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
                                placeholder="For example: 300"
                                min="1"
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <FormInput
                                label="Refund deadline"
                                name="refundDeadline"
                                type="datetime-local"
                                value={formData.refundDeadline}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                <section className="event-form-section">
                    <div className="event-form-section-heading">
                        <span>04</span>

                        <div>
                            <h2>Contact information</h2>
                            <p>
                                Provide an email for attendee
                                questions.
                            </p>
                        </div>
                    </div>

                    <FormInput
                        label="Contact email"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="events@example.com"
                        required
                    />
                </section>

                <div className="event-form-actions">
                    <button
                        type="button"
                        className="btn btn-eventore-outline"
                        onClick={clearForm}
                    >
                        Clear form
                    </button>

                    <button
                        type="submit"
                        className="btn btn-eventore"
                    >
                        Save as draft
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateEventPage;