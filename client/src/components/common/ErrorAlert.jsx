function ErrorAlert({ message, onClose }) {
    if (!message) {
        return null;
    }

    return (
        <div
            className="alert eventore-error-alert"
            role="alert"
        >
            <span>{message}</span>

            {onClose && (
                <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close error message"
                ></button>
            )}
        </div>
    );
}

export default ErrorAlert;