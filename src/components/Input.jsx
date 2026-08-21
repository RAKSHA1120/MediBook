
function Input({
    type = "text",
    placeholder = "",
    value,
    onChange,
    name,
    id,
    autoComplete,
    required = false,
    icon: Icon,
    error,
    success,
}) {
    return (
        <div
            className={`input-container ${Icon ? "has-icon" : ""
                } ${error ? "has-error" : ""} ${success ? "has-success" : ""
                }`}
        >
            {Icon && (
                <Icon
                    className="input-icon"
                    size={18}
                />
            )}

            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required={required}
                className="input"
            />

            <span className="input-focus-line"></span>
        </div>
    );
}

export default Input;

