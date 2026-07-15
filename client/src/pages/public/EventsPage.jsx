import {
    useEffect,
    useState
} from "react";

import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import EventCard from "../../components/events/EventCard";
import FilterPanel from "../../components/events/FilterPanel";
import SearchBar from "../../components/events/SearchBar";
import { eventApi } from "../../services/api";


function EventsPage() {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [priceType, setPriceType] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load categories
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        const loadCategories = async () => {
            try {
                const data =
                    await eventApi.getCategories();

                if (active) {
                    setCategories(
                        data.categories || []
                    );
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message
                        || "Unable to load categories."
                    );
                }
            }
        };

        loadCategories();

        return () => {
            active = false;
        };
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Load published events whenever filters change
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        const timer = window.setTimeout(
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const data =
                        await eventApi.getPublicEvents({
                            search:
                                searchTerm.trim(),

                            category,

                            location:
                                location.trim(),

                            pricing: priceType
                        });

                    if (active) {
                        setEvents(data.events || []);
                    }
                } catch (requestError) {
                    if (active) {
                        setError(
                            requestError.message
                            || "Unable to load events."
                        );

                        setEvents([]);
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            },
            350
        );

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [
        searchTerm,
        category,
        location,
        priceType
    ]);


    /*
    |--------------------------------------------------------------------------
    | Reset filters
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setSearchTerm("");
        setCategory("");
        setLocation("");
        setPriceType("");
    };


    return (
        <main className="events-page">
            <div className="container py-5">
                <PageHeader
                    label="DISCOVER"
                    title="Explore events"
                    description="Search and discover experiences happening around you."
                />

                <section className="event-discovery-controls">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />

                    <FilterPanel
                        category={category}
                        location={location}
                        priceType={priceType}
                        categories={categories}
                        onCategoryChange={
                            setCategory
                        }
                        onLocationChange={
                            setLocation
                        }
                        onPriceTypeChange={
                            setPriceType
                        }
                        onReset={resetFilters}
                    />
                </section>

                {error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="events-results-heading">
                    <p>
                        <strong>{events.length}</strong>
                        {" "}
                        {events.length === 1
                            ? "event found"
                            : "events found"}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border"
                            role="status"
                            aria-label="Loading events"
                        />

                        <p className="mt-3">
                            Loading published events...
                        </p>
                    </div>
                ) : events.length > 0 ? (
                    <div className="row g-4">
                        {events.map((eventRecord) => (
                            <div
                                key={
                                    eventRecord.event_id
                                }
                                className="col-md-6 col-lg-4"
                            >
                                <EventCard
                                    event={eventRecord}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No events found"
                        description="Try changing your search or resetting the filters."
                        action={
                            <button
                                type="button"
                                className="btn btn-eventore"
                                onClick={resetFilters}
                            >
                                Reset filters
                            </button>
                        }
                    />
                )}
            </div>
        </main>
    );
}

export default EventsPage;