import {
    useCallback,
    useEffect,
    useState
} from "react";

import PageHeader from "../../components/common/PageHeader";
import { adminApi } from "../../services/api";


function AdminUsersPage() {
    const [organisers, setOrganisers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] =
        useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | Load pending organisers
    |--------------------------------------------------------------------------
    */

    const loadPendingOrganisers = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await adminApi.getPendingOrganisers();

                setOrganisers(data.organisers || []);
            } catch (requestError) {
                setError(
                    requestError.message
                    || "Unable to load pending organisers."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        loadPendingOrganisers();
    }, [loadPendingOrganisers]);


    /*
    |--------------------------------------------------------------------------
    | Approve organiser
    |--------------------------------------------------------------------------
    */

    const handleApprove = async (organiser) => {
        const confirmed = window.confirm(
            `Approve ${organiser.full_name} as an Eventore organiser?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setApprovingId(organiser.user_id);
            setError("");
            setSuccessMessage("");

            const data =
                await adminApi.approveOrganiser(
                    organiser.user_id
                );

            setOrganisers((currentOrganisers) =>
                currentOrganisers.filter(
                    (item) =>
                        item.user_id
                        !== organiser.user_id
                )
            );

            setSuccessMessage(data.message);
        } catch (requestError) {
            setError(
                requestError.message
                || "Unable to approve the organiser."
            );
        } finally {
            setApprovingId(null);
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
                month: "long",
                year: "numeric",
                timeZone: "Africa/Kampala"
            }
        ).format(new Date(dateValue));
    };


    return (
        <div>
            <PageHeader
                label="ADMINISTRATOR"
                title="Organiser approvals"
                description="Review and approve organiser accounts."
                action={
                    <span className="badge text-bg-dark">
                        {organisers.length} pending
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
                        aria-label="Loading pending organisers"
                    />

                    <p className="mt-3">
                        Loading pending organisers...
                    </p>
                </div>
            )}

            {!loading && organisers.length === 0 && (
                <div className="glass-card p-5 text-center">
                    <h2>No pending organisers</h2>

                    <p className="text-secondary mb-0">
                        All organiser applications have been
                        reviewed.
                    </p>
                </div>
            )}

            {!loading && organisers.length > 0 && (
                <div className="row g-4">
                    {organisers.map((organiser) => (
                        <div
                            className="col-12 col-lg-6"
                            key={organiser.user_id}
                        >
                            <article className="glass-card p-4 h-100">
                                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                    <div>
                                        <p className="text-uppercase small text-secondary mb-2">
                                            Organiser application
                                        </p>

                                        <h2 className="h4 mb-1">
                                            {
                                                organiser.full_name
                                            }
                                        </h2>

                                        <p className="text-secondary mb-0">
                                            {organiser.email}
                                        </p>
                                    </div>

                                    <span className="badge text-bg-warning">
                                        Pending
                                    </span>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <span className="small text-secondary d-block">
                                            User ID
                                        </span>

                                        <strong>
                                            {organiser.user_id}
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="small text-secondary d-block">
                                            Registered
                                        </span>

                                        <strong>
                                            {formatDate(
                                                organiser.created_at
                                            )}
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="small text-secondary d-block">
                                            Account
                                        </span>

                                        <strong>
                                            {
                                                organiser.account_status
                                            }
                                        </strong>
                                    </div>

                                    <div className="col-6">
                                        <span className="small text-secondary d-block">
                                            Role
                                        </span>

                                        <strong>
                                            {organiser.role}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-eventore"
                                    onClick={() =>
                                        handleApprove(
                                            organiser
                                        )
                                    }
                                    disabled={
                                        approvingId
                                        === organiser.user_id
                                    }
                                >
                                    {approvingId
                                    === organiser.user_id
                                        ? "Approving..."
                                        : "Approve organiser"}
                                </button>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminUsersPage;