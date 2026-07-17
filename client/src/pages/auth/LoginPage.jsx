import { useEffect, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import ErrorAlert from "../../components/common/ErrorAlert";
import FormInput from "../../components/forms/FormInput";
import { useAuth } from "../../context/useAuth";

const dashboardPaths = {
    attendee: "/attendee",
    organiser: "/organiser",
    staff: "/staff",
    administrator: "/admin"
};

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        user,
        loading,
        login
    } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    // Prevent logged-in users from returning to login.
    useEffect(() => {
        if (!loading && user) {
            const dashboardPath =
                dashboardPaths[user.role] || "/";

            navigate(dashboardPath, {
                replace: true
            });
        }
    }, [user, loading, navigate]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));

        setErrors((currentErrors) => ({
            ...currentErrors,
            [name]: ""
        }));

        setGeneralError("");
    }

    function validateForm() {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
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
        } else if (formData.password.length < 8) {
            newErrors.password =
                "Password must contain at least 8 characters.";
        }

        return newErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setGeneralError(
                "Please correct the highlighted fields."
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setGeneralError("");
            setErrors({});

            const data = await login({
                email: formData.email.trim(),
                password: formData.password
            });

            // If ProtectedRoute sent the user to login,
            // return them to the page they originally requested.
            const requestedPath =
                location.state?.from?.pathname;

            const dashboardPath =
                dashboardPaths[data.user.role] || "/";

            navigate(
                requestedPath || dashboardPath,
                { replace: true }
            );
        } catch (error) {
            const fieldErrors = {};

            error.errors?.forEach((validationError) => {
                const fieldName =
                    validationError.path ||
                    validationError.param;

                if (fieldName) {
                    fieldErrors[fieldName] =
                        validationError.msg;
                }
            });

            setErrors(fieldErrors);

            setGeneralError(
                error.message ||
                "Login failed. Please try again."
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
                            WELCOME BACK
                        </p>

                        <h1>
                            Your next experience is waiting.
                        </h1>

                        <p>
                            Sign in to manage your bookings,
                            tickets and events.
                        </p>

                        <div className="auth-highlight">
                            <strong>One account.</strong>

                            <span>
                                Every booking, ticket and event
                                in one place.
                            </span>
                        </div>
                    </section>

                    <section className="auth-form-card">
                        <div className="mb-4">
                            <h2>Sign in</h2>

                            <p>
                                Enter your Eventore account
                                details.
                            </p>
                        </div>

                        <ErrorAlert
                            message={generalError}
                            onClose={() =>
                                setGeneralError("")
                            }
                        />

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                        >
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

                            <FormInput
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                error={errors.password}
                                required
                                autoComplete="current-password"
                                disabled={isSubmitting}
                            />

                            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                                <label className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        disabled
                                    />

                                    <span className="form-check-label">
                                        Remember me
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    className="auth-text-button"
                                    disabled
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-eventore w-100"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Signing in..."
                                    : "Sign in"}
                            </button>
                        </form>

                        <p className="auth-switch-text">
                            Don&apos;t have an account?{" "}

                            <Link to="/register">
                                Create one
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;