const statusClasses = {
    draft: "status-draft",
    pending: "status-pending",
    published: "status-published",
    sold_out: "status-sold-out",
    cancelled: "status-cancelled",
    completed: "status-completed",
    confirmed: "status-confirmed",
    active: "status-active",
    used: "status-used",
    failed: "status-failed"
};

function StatusBadge({ status }) {
    const normalizedStatus = status
        .toLowerCase()
        .replaceAll(" ", "_");

    const statusClass =
        statusClasses[normalizedStatus] || "status-default";

    const readableStatus = normalizedStatus
        .replaceAll("_", " ");

    return (
        <span className={`status-badge ${statusClass}`}>
            {readableStatus}
        </span>
    );
}

export default StatusBadge;