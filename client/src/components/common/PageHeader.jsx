function PageHeader({
    label,
    title,
    description,
    action
}) {
    return (
        <header className="page-header">
            <div>
                {label && (
                    <p className="eventore-label mb-2">
                        {label}
                    </p>
                )}

                <h1 className="page-title">
                    {title}
                </h1>

                {description && (
                    <p className="page-description">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="page-header-action">
                    {action}
                </div>
            )}
        </header>
    );
}

export default PageHeader;