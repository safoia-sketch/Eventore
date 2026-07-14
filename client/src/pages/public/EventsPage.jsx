import { useMemo, useState } from "react";

import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import EventCard from "../../components/events/EventCard";
import FilterPanel from "../../components/events/FilterPanel";
import SearchBar from "../../components/events/SearchBar";
import sampleEvents from "../../data/sampleEvents";

function EventsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");
    const [location, setLocation] = useState("all");
    const [priceType, setPriceType] = useState("all");

    const categories = [
        ...new Set(
            sampleEvents.map((event) => event.category)
        )
    ];

    const locations = [
        ...new Set(
            sampleEvents.map((event) => event.location)
        )
    ];

    const filteredEvents = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return sampleEvents.filter((event) => {
            const matchesSearch =
                event.name
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesCategory =
                category === "all" ||
                event.category === category;

            const matchesLocation =
                location === "all" ||
                event.location === location;

            const matchesPrice =
                priceType === "all" ||
                (priceType === "free" &&
                    event.price === 0) ||
                (priceType === "paid" &&
                    event.price > 0);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLocation &&
                matchesPrice
            );
        });
    }, [
        searchTerm,
        category,
        location,
        priceType
    ]);

    function resetFilters() {
        setSearchTerm("");
        setCategory("all");
        setLocation("all");
        setPriceType("all");
    }

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
                        locations={locations}
                        onCategoryChange={setCategory}
                        onLocationChange={setLocation}
                        onPriceTypeChange={setPriceType}
                        onReset={resetFilters}
                    />
                </section>

                <div className="events-results-heading">
                    <p>
                        <strong>{filteredEvents.length}</strong>
                        {" "}
                        {filteredEvents.length === 1
                            ? "event found"
                            : "events found"}
                    </p>
                </div>

                {filteredEvents.length > 0 ? (
                    <div className="row g-4">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="col-md-6 col-lg-4"
                            >
                                <EventCard event={event} />
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