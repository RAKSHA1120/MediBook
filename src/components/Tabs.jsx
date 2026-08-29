import { useState } from "react";

function Tabs({ tabs = [], defaultTab = 0, activeTab, onChange }) {
    const [internalTab, setInternalTab] = useState(defaultTab);
    
    const isControlled = activeTab !== undefined;

    const getCurrentIndex = () => {
        if (isControlled) {
            if (typeof activeTab === 'string') {
                const idx = tabs.findIndex(t => t.id === activeTab || t.label === activeTab);
                return Math.max(0, idx);
            }
            return activeTab;
        }
        return internalTab;
    };
    
    const currentIndex = getCurrentIndex();

    return (
        <div className="tabs">
            <div className="tabs-list">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id || tab.label || index}
                        className={`tab ${currentIndex === index ? "tab-active" : ""} ${tab.disabled ? "tab-disabled" : ""}`}
                        onClick={() => {
                            if (!tab.disabled) {
                                if (onChange) {
                                    onChange(tab.id || tab.label || index);
                                }
                                if (!isControlled) {
                                    setInternalTab(index);
                                }
                            }
                        }}
                        disabled={tab.disabled}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {tabs[currentIndex]?.content}
            </div>
        </div>
    );
}

export default Tabs;