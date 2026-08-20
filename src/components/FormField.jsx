function FormField({
    label,
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    type = "text",
}) {
    return (
        <div className="form-field">
            <label className="form-label">
                {label}

                {required && (
                    <span className="required-mark">*</span>
                )}
            </label>

            <input
                className={`form-input ${error ? "form-input-error" : ""}`}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />

            {error && (
                <span className="form-error">
                    {error}
                </span>
            )}
        </div>
    );
}

export default FormField;