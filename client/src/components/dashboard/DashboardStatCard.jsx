function DashboardStatCard({
    label,
    value,
    description
}) {
    return (
        <article className="dashboard-stat-card">
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{description}</span>
        </article>
    );
}

export default DashboardStatCard;