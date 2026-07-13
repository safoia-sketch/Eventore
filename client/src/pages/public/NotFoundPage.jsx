import { Link } from "react-router";

function NotFoundPage() {
    return (
        <main className="container py-5 text-center">
            <p className="eventore-label">ERROR 404</p>
            <h1 className="display-4 fw-bold">Page not found</h1>
            <p className="text-secondary">
                The page you requested does not exist.
            </p>

            <Link to="/" className="btn btn-eventore mt-3">
                Return Home
            </Link>
        </main>
    );
}

export default NotFoundPage;