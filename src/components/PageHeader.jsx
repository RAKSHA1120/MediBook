import { ArrowLeft } from "lucide-react";
import Button from "./Button";
import "./PageHeader.css";

function PageHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  action,
  actionLabel,
  onAction,
  className = "",
  children
}) {
  return (
    <div className={`page-header-container ${className}`}>
      {onBack && (
        <button type="button" className="page-header-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </button>
      )}

      <div className="page-header-top-row">
        <div className="page-header-titles">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>

        {(action || (actionLabel && onAction) || children) && (
          <div className="page-header-action-area">
            {children}
            {!children && (action || (
              actionLabel && onAction ? (
                <Button variant="primary" onClick={onAction}>
                  {actionLabel}
                </Button>
              ) : null
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
