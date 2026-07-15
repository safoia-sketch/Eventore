function FilterPanel({
    category,
    location,
    priceType,
    categories,
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
                        onCategoryChange(
                            event.target.value
                        )
                    }
                    className="form-select eventore-input"
                >
                    <option value="">
                        All categories
                    </option>

                    {categories.map(
                        (categoryRecord) => (
                            <option
                                key={
                                    categoryRecord.category_id
                                }
                                value={
                                    categoryRecord.category_id
                                }
                            >
                                {
                                    categoryRecord.category_name
                                }
                            </option>
                        )
                    )}
                </select>
            </div>

            <div>
                <label
                    htmlFor="location-filter"
                    className="form-label"
                >
                    Location
                </label>

                <input
                    id="location-filter"
                    type="search"
                    value={location}
                    onChange={(event) =>
                        onLocationChange(
                            event.target.value
                        )
                    }
                    className="form-control eventore-input"
                    placeholder="City, venue or address"
                />
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
                        onPriceTypeChange(
                            event.target.value
                        )
                    }
                    className="form-select eventore-input"
                >
                    <option value="">
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