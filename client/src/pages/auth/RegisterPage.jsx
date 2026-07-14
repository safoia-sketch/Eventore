import { useEffect, useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import ErrorAlert from "../../components/common/ErrorAlert";
import FormInput from "../../components/forms/FormInput";
import { useAuth } from "../../context/AuthContext";

const initialFormData = {
    fullName: "",
    email: "",
    accountType: "attendee",
    password: "",
    confirmPassword: "",
    acceptTerms: false
};

const dashboardPaths = {
    attendee: "/attendee",
    organiser: "/organiser",
    staff: "/staff",
    administrator: "/admin"
};

function RegisterPage() {
    const navigate = useNavigate();

    const {
        user,
        loading,
        register
    } = useAuth();

    const [formData, setFormData] =
        useState(initialFormData);

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] =
        useState("");
    const [successMessage, setSuccessMessage] =
        useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    useEffect(() => {
        if (!loading && user) {
            navigate(
                dashboardPaths[user.role] || "/",
                { replace: true }
            );
        }
    }, [user, loading, navigate]);

    function handleChange(event) {
        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: ""
        }));

        setGeneralError("");
        setSuccessMessage("");
    }

    function validateForm() {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName =
                "Your full name is required.";
        } else if (
            formData.fullName.trim().length < 3
        ) {
            newErrors.fullName =
                "Enter at least three characters.";
        }

        if (!formData.email.trim()) {
            newErrors.email =
                "Email is required.";
        } else if (
            !formData.email
                .toLowerCase()
                .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ) {
            newErrors.email =
                "Enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password =
                "Password is required.";
        } else if (
            formData.password.length < 8
        ) {
            newErrors.password =
                "Password must contain at least 8 characters.";
        } else if (
            !/[a-z]/.test(formData.password)
        ) {
            newErrors.password =
                "Password must contain a lowercase letter.";
        } else if (
            !/[A-Z]/.test(formData.password)
        ) {
            newErrors.password =
                "Password must contain an uppercase letter.";
        } else if (
            !/[0-9]/.test(formData.password)
        ) {
            newErrors.password =
                "Password must contain a number.";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword =
                "Confirm your password.";
        } else if (
            formData.confirmPassword !==
            formData.password
        ) {
            newErrors.confirmPassword =
                "The passwords do not match.";
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms =
                "You must accept the terms to continue.";
        }

        return newErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors =
            validateForm();

        if (
            Object.keys(validationErrors).length > 0
        ) {
            setErrors(validationErrors);
            setGeneralError(
                "Please correct the highlighted fields."
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setErrors({});
            setGeneralError("");
            setSuccessMessage("");

            const data = await register({
                fullName:
                    formData.fullName.trim(),
                email:
                    formData.email.trim(),
                password:
                    formData.password,
                role:
                    formData.accountType
            });

            setSuccessMessage(data.message);
            setFormData(initialFormData);

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: {
                        registrationMessage:
                            data.message
                    }
                });
            }, 1500);
        } catch (error) {
            const fieldErrors = {};

            error.errors?.forEach(
                (validationError) => {
                    let fieldName =
                        validationError.path ||
                        validationError.param;

                    if (fieldName === "role") {
                        fieldName = "accountType";
                    }

                    if (fieldName) {
                        fieldErrors[fieldName] =
                            validationError.msg;
                    }
                }
            );

            setErrors(fieldErrors);

            setGeneralError(
                error.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <section className="auth-introduction">
                        <p className="eventore-label">
                            JOIN EVENTORE
                        </p>

                        <h1>
                            Experience more. Organise better.
                        </h1>

                        <p>
                            Create an account to discover
                            events, manage tickets or begin
                            organising your own experiences.
                        </p>

                        <div className="auth-highlight">
                            <strong>
                                Attendee or organiser?
                            </strong>

                            <span>
                                Choose how you want to begin.
                                Your permissions will be
                                protected by your account role.
                            </span>
                        </div>
                    </section>

                    <section className="auth-form-card">
                        <div className="mb-4">
                            <h2>Create an account</h2>

                            <p>
                                Enter your information to join
                                Eventore.
                            </p>
                        </div>

                        <ErrorAlert
                            message={generalError}
                            onClose={() =>
                                setGeneralError("")
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

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <FormInput
                                label="Full name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                error={errors.fullName}
                                required
                                autoComplete="name"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Email address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                error={errors.email}
                                required
                                autoComplete="email"
                                disabled={isSubmitting}
                            />

                            <div className="mb-3">
                                <label
                                    htmlFor="account-type"
                                    className="form-label"
                                >
                                    Account type
                                </label>

                                <select
                                    id="account-type"
                                    name="accountType"
                                    value={
                                        formData.accountType
                                    }
                                    onChange={handleChange}
                                    className="form-select eventore-input"
                                    disabled={isSubmitting}
                                >
                                    <option value="attendee">
                                        Attendee
                                    </option>

                                    <option value="organiser">
                                        Event organiser
                                    </option>
                                </select>

                                {formData.accountType ===
                                    "organiser" && (
                                    <p className="form-help-text">
                                        Organiser accounts
                                        require administrator
                                        approval before creating
                                        events.
                                    </p>
                                )}
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <FormInput
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="At least 8 characters"
                                        error={
                                            errors.password
                                        }
                                        required
                                        autoComplete="new-password"
                                        disabled={
                                            isSubmitting
                                        }
                                    />
                                </div>

                                <div className="col-md-6">
                                    <FormInput
                                        label="Confirm password"
                                        name="confirmPassword"
                                        type="password"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Repeat password"
                                        error={
                                            errors.confirmPassword
                                        }
                                        required
                                        autoComplete="new-password"
                                        disabled={
                                            isSubmitting
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-check">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={
                                            formData.acceptTerms
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                        className={`form-check-input ${
                                            errors.acceptTerms
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                    />

                                    <span className="form-check-label">
                                        I accept the Eventore
                                        terms and privacy policy.
                                    </span>
                                </label>

                                {errors.acceptTerms && (
                                    <div className="registration-error">
                                        {
                                            errors.acceptTerms
                                        }
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-eventore w-100"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <p className="auth-switch-text">
                            Already have an account?{" "}

                            <Link to="/login">
                                Sign in
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;