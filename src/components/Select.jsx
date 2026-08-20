import { ChevronDown } from "lucide-react";

function Select({
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    disabled = false,
}) {
    return (
        <div className={`select-wrapper ${disabled ? "select-disabled" : ""}`}>
            <select
                className="select"
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                <option value="" disabled>
                    {placeholder}
                </option>

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown className="select-icon" size={20} />
        </div>
    );
}

export default Select;