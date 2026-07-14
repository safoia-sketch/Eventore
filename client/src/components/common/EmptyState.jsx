function EmptyState({
    title,
    description,
    action
}) {
    return (
        <section className="empty-state">
            <div className="empty-state-symbol">
                !
            </div>

            <h2>{title}</h2>

            <p>{description}</p>

            {action && (
                <div className="mt-3">
                    {action}
                </div>
            )}
        </section>
    );
}

export default EmptyState;