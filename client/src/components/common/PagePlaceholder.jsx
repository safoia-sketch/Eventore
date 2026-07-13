function PagePlaceholder({ label, title, description }) {
    return (
        <main className="container py-5">
            <p className="eventore-label">{label}</p>

            <h1 className="display-5 fw-bold">
                {title}
            </h1>

            <p className="lead text-secondary">
                {description}
            </p>
        </main>
    );
}

export default PagePlaceholder;