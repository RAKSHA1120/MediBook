import React from "react";
import { Check, X } from "lucide-react";
import "./PasswordStrengthIndicator.css";

export function checkPasswordRules(password = "") {
  const pwd = password || "";
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const criteria = [
    { id: "length", label: "Minimum 8 characters", met: hasMinLength },
    { id: "upper", label: "At least 1 uppercase letter (A-Z)", met: hasUpper },
    { id: "lower", label: "At least 1 lowercase letter (a-z)", met: hasLower },
    { id: "number", label: "At least 1 number (0-9)", met: hasNumber },
    { id: "special", label: "At least 1 special character", met: hasSpecial },
  ];

  const score = criteria.filter((c) => c.met).length;
  const isStrong = score === 5;

  let strengthLabel = "Weak";
  let strengthLevel = 1; // 1: Weak, 2: Medium, 3: Strong

  if (score >= 5) {
    strengthLabel = "Strong";
    strengthLevel = 3;
  } else if (score >= 3) {
    strengthLabel = "Medium";
    strengthLevel = 2;
  } else {
    strengthLabel = "Weak";
    strengthLevel = 1;
  }

  return {
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    criteria,
    score,
    isStrong,
    strengthLabel,
    strengthLevel,
  };
}

export default function PasswordStrengthIndicator({
  password = "",
  showMeter = true,
  showChecklist = true,
  className = "",
}) {
  const { criteria, isStrong, strengthLabel, strengthLevel, score } = checkPasswordRules(password);
  const hasValue = Boolean(password && password.length > 0);

  return (
    <div className={`password-strength-container ${className}`}>
      {showMeter && (
        <div className="password-meter-wrapper">
          <div className="password-meter-header">
            <span className="password-meter-title">Password Strength</span>
            {hasValue && (
              <span
                className={`password-meter-badge strength-${strengthLabel.toLowerCase()}`}
                data-testid="password-strength-badge"
              >
                {strengthLabel}
              </span>
            )}
          </div>
          <div className="password-meter-bar" aria-label="Password strength meter">
            <div
              className={`password-meter-segment ${
                hasValue && strengthLevel >= 1 ? `active-${strengthLabel.toLowerCase()}` : ""
              }`}
            />
            <div
              className={`password-meter-segment ${
                hasValue && strengthLevel >= 2 ? `active-${strengthLabel.toLowerCase()}` : ""
              }`}
            />
            <div
              className={`password-meter-segment ${
                hasValue && strengthLevel >= 3 ? `active-${strengthLabel.toLowerCase()}` : ""
              }`}
            />
          </div>
        </div>
      )}

      {showChecklist && (
        <ul className="password-criteria-list" aria-label="Password requirements">
          {criteria.map((item) => (
            <li
              key={item.id}
              className={`password-criteria-item ${item.met ? "criteria-met" : "criteria-unmet"}`}
              data-testid={`criteria-${item.id}`}
            >
              <span className="criteria-icon">
                {item.met ? (
                  <Check size={14} strokeWidth={2.5} className="icon-check" />
                ) : (
                  <X size={14} strokeWidth={2.5} className="icon-cross" />
                )}
              </span>
              <span className="criteria-label">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
