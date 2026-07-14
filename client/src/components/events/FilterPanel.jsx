function FilterPanel({
    category,
    location,
    priceType,
    categories,
    locations,
    onCategoryChange,
    onLocationChange,
    onPriceTypeChange,
    onReset
}) {
    return (
        <div className="event-filter-panel">
            <div>
                <label
                    htmlFor="category-filter"
                    className="form-label"
                >
                    Category
                </label>

                <select
                    id="category-filter"
                    value={category}
                    onChange={(event) =>
                        onCategoryChange(event.target.value)
                    }
                    className="form-select eventore-input"
                >
                    <option value="all">
                        All categories
                    </option>

                    {categories.map((categoryName) => (
                        <option
                            key={categoryName}
                            value={categoryName}
                        >
                            {categoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label
                    htmlFor="location-filter"
                    className="form-label"
                >
                    Location
                </label>

                <select
                    id="location-filter"
                    value={location}
                    onChange={(event) =>
                        onLocationChange(event.target.value)
                    }
                    className="form-select eventore-input"
                >
                    <option value="all">
                        All locations
                    </option>

                    {locations.map((locationName) => (
                        <option
                            key={locationName}
                            value={locationName}
                        >
                            {locationName}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label
                    htmlFor="price-filter"
                    className="form-label"
                >
                    Price
                </label>

                <select
                    id="price-filter"
                    value={priceType}
                    onChange={(event) =>
                        onPriceTypeChange(event.target.value)
                    }
                    className="form-select eventore-input"
                >
                    <option value="all">
                        Free and paid
                    </option>

                    <option value="free">
                        Free events
                    </option>

                    <option value="paid">
                        Paid events
                    </option>
                </select>
            </div>

            <button
                type="button"
                className="btn btn-eventore-outline"
                onClick={onReset}
            >
                Reset filters
            </button>
        </div>
    );
}

export default FilterPanel;