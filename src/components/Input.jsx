import React from "react";

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
  className = "",
  ...props
}) {
  const renderIcon = () => {
    if (!Icon) return null;

    // Handle React Component passed as icon (e.g. icon={Search})
    if (typeof Icon === "function" || (typeof Icon === "object" && Icon?.render)) {
      const IconComp = Icon;
      return <IconComp className="input-icon" size={18} />;
    }

    // Handle React Element passed as icon (e.g. icon={<Search />}) or string/node
    if (React.isValidElement(Icon)) {
      return React.cloneElement(Icon, {
        className: `input-icon ${Icon.props.className || ""}`.trim()
      });
    }

    return <span className="input-icon">{Icon}</span>;
  };

  return (
    <div
      className={`input-wrapper ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, ...style }}
    >
      {label && (
        <label htmlFor={id || name} style={{ fontSize: "0.875rem", fontWeight: "500", color: "#475569" }}>
          {label}
        </label>
      )}
      <div
        className={`input-container ${Icon ? "has-icon" : ""} ${error ? "has-error" : ""} ${
          success ? "has-success" : ""
        }`}
      >
        {renderIcon()}

        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value !== undefined && value !== null ? value : ""}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className="input"
          {...props}
        />

        <span className="input-focus-line"></span>
      </div>
    </div>
  );
}

export default Input;
