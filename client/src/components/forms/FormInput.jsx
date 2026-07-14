function FormInput({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    required = false,
    ...otherProps
}) {
    const inputId = `field-${name}`;

    return (
        <div className="mb-3">
            <label
                htmlFor={inputId}
                className="form-label"
            >
                {label}

                {required && (
                    <span className="required-mark">
                        {" "}*
                    </span>
                )}
            </label>

            <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`form-control eventore-input ${
                    error ? "is-invalid" : ""
                }`}
                {...otherProps}
            />

            {error && (
                <div className="invalid-feedback">
                    {error}
                </div>
            )}
        </div>
    );
}

export default FormInput;