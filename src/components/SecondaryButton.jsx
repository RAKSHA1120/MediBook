import Button from "./Button";

function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  className = ""
}) {
  return (
    <Button
      type={type}
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      loading={loading}
      className={className}
    >
      {children}
    </Button>
  );
}

export default SecondaryButton;
