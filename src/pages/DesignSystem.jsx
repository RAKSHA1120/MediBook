import { useState } from "react";
import FormField from "../components/FormField";
import Tooltip from "../components/Tooltip";
import Tabs from "../components/Tabs";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import Select from "../components/Select";
import Radio from "../components/Radio";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
function DesignSystem() {
    const [showToast, setShowToast] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRadio, setSelectedRadio] = useState("option1");
    const [checked, setChecked] = useState(true);
    return (
        <>
            <div className="app-layout">
                <Sidebar />

                <div className="app-content">
                    <Navbar />

                    <main className="design-system">
                        <header className="design-system-header">
                            <p className="design-system-label">
                                MEDIBOOK DESIGN SYSTEM
                            </p>

                            <h1>Design System Preview</h1>

                            <p>
                                Common typography, colors, buttons, inputs and cards.
                            </p>
                        </header>

                        {/* Typography */}

                        <section className="design-section">
                            <h2>Typography</h2>

                            <h3>IBM Plex Serif — Heading</h3>

                            <p>
                                Inter — This is the standard body text used throughout
                                MediBook.
                            </p>
                        </section>

                        {/* Colors */}

                        <section className="design-section">
                            <h2>Colors</h2>

                            <div className="color-grid">
                                <div className="color-box primary">
                                    <span>Primary</span>
                                    <small>#2F6FA3</small>
                                </div>

                                <div className="color-box light-blue">
                                    <span>Light Blue</span>
                                    <small>#6EC0FF</small>
                                </div>

                                <div className="color-box soft-blue">
                                    <span>Soft Blue</span>
                                    <small>#ABE1FF</small>
                                </div>

                                <div className="color-box dark">
                                    <span>Dark Navy</span>
                                    <small>#172033</small>
                                </div>
                            </div>
                        </section>
                        {/* Foundations */}

                        <section className="design-section">
                            <h2>Foundations</h2>

                            <div className="foundation-grid">

                                <div className="foundation-card">
                                    <h3>Spacing</h3>

                                    <p>XS — 4px</p>
                                    <p>SM — 8px</p>
                                    <p>MD — 16px</p>
                                    <p>LG — 24px</p>
                                    <p>XL — 32px</p>
                                    <p>2XL — 40px</p>
                                </div>

                                <div className="foundation-card">
                                    <h3>Border Radius</h3>

                                    <p>Small — 6px</p>
                                    <p>Medium — 10px</p>
                                    <p>Large — 16px</p>
                                </div>

                                <div className="foundation-card">
                                    <h3>Icons</h3>

                                    <p>Style — Outline</p>
                                    <p>Small — 16px</p>
                                    <p>Default — 20px</p>
                                    <p>Large — 24px</p>
                                    <p>Stroke — 2px</p>
                                </div>

                                <div className="foundation-card">
                                    <h3>Responsive</h3>

                                    <p>Desktop — Full layout</p>
                                    <p>Tablet — 2 columns</p>
                                    <p>Mobile — 1 column</p>
                                    <p>Sidebar — Collapse</p>
                                    <p>Cards — Full width</p>
                                </div>

                            </div>
                        </section>
                        {/* Buttons */}

                        <section className="design-section">
                            <h2>Buttons</h2>

                            <div className="component-row">
                                <Button>
                                    Primary Button
                                </Button>

                                <Button variant="secondary">
                                    Secondary Button
                                </Button>

                                <Button variant="outline">
                                    Outline Button
                                </Button>

                                <Button disabled>
                                    Disabled
                                </Button>
                            </div>
                        </section>

                        {/* Inputs */}

                        <section className="design-section">
                            <h2>Inputs</h2>

                            <div className="input-preview">
                                <Input
                                    type="text"
                                    placeholder="Enter patient name"
                                />

                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                />

                                <Input
                                    type="text"
                                    placeholder="Disabled input"
                                    disabled
                                />
                            </div>
                        </section>
                        {/* Radio Buttons */}

                        <section className="design-section">
                            <h2>Radio Buttons</h2>

                            <div className="component-row">
                                <Radio
                                    label="Option 1"
                                    name="demo"
                                    value="option1"
                                    checked={selectedRadio === "option1"}
                                    onChange={(e) => setSelectedRadio(e.target.value)}
                                />

                                <Radio
                                    label="Option 2"
                                    name="demo"
                                    value="option2"
                                    checked={selectedRadio === "option2"}
                                    onChange={(e) => setSelectedRadio(e.target.value)}
                                />

                                <Radio
                                    label="Disabled"
                                    name="disabled"
                                    value="disabled"
                                    disabled
                                />
                            </div>
                        </section>


                        {/* Checkboxes */}

                        <section className="design-section">
                            <h2>Checkboxes</h2>

                            <div className="component-row">
                                <Checkbox
                                    label="Remember me"
                                    checked={checked}
                                    onChange={(e) => setChecked(e.target.checked)}
                                />

                                <Checkbox
                                    label="Notifications"
                                    checked={false}
                                    onChange={() => { }}
                                />

                                <Checkbox
                                    label="Disabled"
                                    checked={false}
                                    onChange={() => { }}
                                    disabled
                                />
                            </div>
                        </section>

                        {/* Select / Dropdown */}

                        <section className="design-section">
                            <h2>Select / Dropdown</h2>

                            <div className="component-row">

                                <Select
                                    placeholder="Select department"
                                    options={[
                                        {
                                            value: "general",
                                            label: "General Medicine",
                                        },
                                        {
                                            value: "cardiology",
                                            label: "Cardiology",
                                        },
                                        {
                                            value: "pediatrics",
                                            label: "Pediatrics",
                                        },
                                        {
                                            value: "laboratory",
                                            label: "Laboratory",
                                        },
                                    ]}
                                />

                                <Select
                                    value=""
                                    onChange={() => { }}
                                    placeholder="Disabled select"
                                    disabled
                                    options={[
                                        {
                                            value: "disabled",
                                            label: "Disabled",
                                        },
                                    ]}
                                />

                            </div>
                        </section>

                        {/* Modal / Dialog */}

                        <section className="design-section">
                            <h2>Modal / Dialog</h2>

                            <div className="component-row">
                                <Button onClick={() => setIsModalOpen(true)}>
                                    Open Modal
                                </Button>
                            </div>
                        </section>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Patient Information"
                            footer={
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button onClick={() => setIsModalOpen(false)}>
                                        Save Patient
                                    </Button>
                                </>
                            }
                        >
                            <p>
                                Add or update patient information using this dialog.
                            </p>

                            <div className="input-preview">
                                <Input
                                    type="text"
                                    placeholder="Enter patient name"
                                />

                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </Modal>

                        {/* Toast / Notifications */}

                        <section className="design-section">
                            <h2>Toast / Notifications</h2>

                            <div className="component-row">
                                <Button onClick={() => setShowToast(true)}>
                                    Show Success Toast
                                </Button>
                            </div>

                            {showToast && (
                                <div className="toast-preview">
                                    <Toast
                                        type="success"
                                        title="Patient added successfully"
                                        message="The patient details have been saved."
                                        onClose={() => setShowToast(false)}
                                    />
                                </div>
                            )}
                        </section>

                        {/* Tabs */}

                        <section className="design-section">
                            <h2>Tabs</h2>

                            <Tabs
                                tabs={[
                                    {
                                        label: "Overview",
                                        content: "Patient overview information goes here.",
                                    },
                                    {
                                        label: "Appointments",
                                        content: "Patient appointment information goes here.",
                                    },
                                    {
                                        label: "Medical Records",
                                        content: "Patient medical records go here.",
                                    },
                                    {
                                        label: "Billing",
                                        content: "Patient billing information goes here.",
                                    },
                                    {
                                        label: "Disabled",
                                        disabled: true,
                                        content: "",
                                    },
                                ]}
                            />
                        </section>

                        {/* Tooltips */}

                        <section className="design-section">
                            <h2>Tooltips</h2>

                            <div className="component-row tooltip-preview">

                                <Tooltip text="Dashboard">
                                    <button className="tooltip-demo-button">
                                        🏠
                                    </button>
                                </Tooltip>

                                <Tooltip text="Settings">
                                    <button className="tooltip-demo-button">
                                        ⚙
                                    </button>
                                </Tooltip>

                                <Tooltip text="Notifications">
                                    <button className="tooltip-demo-button">
                                        🔔
                                    </button>
                                </Tooltip>

                            </div>
                        </section>

                        {/* Form / Validation States */}

                        <section className="design-section">
                            <h2>Form / Validation States</h2>

                            <div className="form-state-grid">

                                <FormField
                                    label="Patient Name"
                                    placeholder="Enter patient name"
                                    required
                                />

                                <FormField
                                    label="Email Address"
                                    placeholder="Enter email address"
                                />

                                <FormField
                                    label="Patient ID"
                                    placeholder="Enter patient ID"
                                    error="Patient ID is required"
                                    required
                                />

                                <FormField
                                    label="Department"
                                    placeholder="Department cannot be changed"
                                    disabled
                                />

                            </div>
                        </section>

                        {/* Cards */}

                        <section className="design-section">
                            <h2>Cards</h2>

                            <div className="card-grid">
                                <Card>
                                    <h3>Patient Information</h3>

                                    <p>
                                        Common card component used throughout MediBook.
                                    </p>
                                </Card>

                                <Card>
                                    <h3>Appointment</h3>

                                    <p>
                                        Card spacing, border radius and shadow remain
                                        consistent.
                                    </p>
                                </Card>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}

export default DesignSystem;