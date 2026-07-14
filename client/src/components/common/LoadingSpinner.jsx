function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div
            className="loading-state"
            role="status"
            aria-live="polite"
        >
            <div className="spinner-border eventore-spinner">
                <span className="visually-hidden">
                    Loading
                </span>
            </div>

            <p className="mb-0">{message}</p>
        </div>
    );
}

export default LoadingSpinner;