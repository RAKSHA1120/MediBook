import Button from "./Button";

function PrimaryButton({
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
      variant="primary"
      disabled={disabled}
      loading={loading}
      className={className}
    >
      {children}
    </Button>
  );
}

export default PrimaryButton;
