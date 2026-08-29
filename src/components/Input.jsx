
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
  label,
  disabled = false,
  style,
}) {
  return (
    <div
      className={`input-wrapper ${disabled ? 'is-disabled' : ''}`}
      style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, ...style }}
    >
      {label && <label htmlFor={id || name} style={{ fontSize: "0.875rem", fontWeight: "500", color: "#475569" }}>{label}</label>}
      <div
        className={`input-container ${Icon ? "has-icon" : ""} ${error ? "has-error" : ""} ${success ? "has-success" : ""}`}
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
        disabled={disabled}
        className="input"
      />

      <span className="input-focus-line"></span>
      </div>
    </div>
  );
}

export default Input;

