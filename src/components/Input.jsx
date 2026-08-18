function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input"
    />
  );
}

export default Input;