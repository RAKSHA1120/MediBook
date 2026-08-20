import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

function Toast({
    type = "success",
    title,
    message,
    onClose,
}) {
    const icons = {
        success: <CheckCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        error: <XCircle size={20} />,
        info: <Info size={20} />,
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                {icons[type]}
            </div>

            <div className="toast-content">
                <strong>{title}</strong>

                {message && <p>{message}</p>}
            </div>

            <button
                className="toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div>
    );
}

export default Toast;