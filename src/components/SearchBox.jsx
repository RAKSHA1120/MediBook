import { Search, X } from "lucide-react";
import "./SearchBox.css";

function SearchBox({
  value = "",
  onChange,
  placeholder = "Search doctors, specialties, or hospitals...",
  disabled = false,
  shortcut = "",
  className = "",
  id = "search-input"
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className={`search-box-wrapper ${className}`}>
      <Search size={18} className="search-box-icon" />

      <input
        id={id}
        type="text"
        className="search-box-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
      />

      {value ? (
        <button
          type="button"
          className="search-box-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      ) : shortcut ? (
        <span className="search-box-shortcut">{shortcut}</span>
      ) : null}
    </div>
  );
}

export default SearchBox;
