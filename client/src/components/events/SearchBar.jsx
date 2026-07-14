function SearchBar({ value, onChange }) {
    return (
        <div className="event-search">
            <label
                htmlFor="event-search"
                className="visually-hidden"
            >
                Search events
            </label>

            <input
                id="event-search"
                type="search"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="form-control eventore-input"
                placeholder="Search events by name..."
            />
        </div>
    );
}

export default SearchBar;