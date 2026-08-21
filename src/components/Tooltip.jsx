function Tooltip({ text, children, position = "top" }) {
    return (
        <div className={`tooltip-wrapper tooltip-${position}`}>
            {children}

            <span className="tooltip">
                {text}
            </span>
        </div>
    );
}

export default Tooltip;