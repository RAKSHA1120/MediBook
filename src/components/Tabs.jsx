import { useState } from "react";

function Tabs({ tabs = [], defaultTab = 0 }) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="tabs">
            <div className="tabs-list">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.label}
                        className={`tab ${activeTab === index ? "tab-active" : ""
                            } ${tab.disabled ? "tab-disabled" : ""}`}
                        onClick={() => {
                            if (!tab.disabled) {
                                setActiveTab(index);
                            }
                        }}
                        disabled={tab.disabled}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
}

export default Tabs;