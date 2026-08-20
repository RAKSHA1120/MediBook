function Radio({ label, name, value, checked, onChange, disabled = false }) {
    return (
        <label className={`radio ${disabled ? "radio-disabled" : ""}`}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />

            <span className="radio-control"></span>

            <span className="radio-label">{label}</span>
        </label>
    );
}

export default Radio;