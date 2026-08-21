function Checkbox({ label, checked, onChange, disabled = false }) {
    return (
        <label className={`checkbox ${disabled ? "checkbox-disabled" : ""}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />

            <span className="checkbox-control">✓</span>

            <span className="checkbox-label">{label}</span>
        </label>
    );
}

export default Checkbox;