import { Search, FolderOpen } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import "./EmptyState.css";

function EmptyState({
  title = "No items found",
  description = "There are no records to display at this time.",
  icon: IconComponent = FolderOpen,
  action,
  actionLabel,
  onAction,
  className = ""
}) {
  return (
    <div className={`empty-state-card ${className}`}>
      <div className="empty-state-icon-box">
        {IconComponent ? <IconComponent size={32} /> : <FolderOpen size={32} />}
      </div>

      <h3 className="empty-state-title">{title}</h3>

      {description && <p className="empty-state-desc">{description}</p>}

      {(action || (actionLabel && onAction)) && (
        <div className="empty-state-action-wrap">
          {action || (
            <PrimaryButton onClick={onAction}>
              {actionLabel}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
