import {
  getSeverityClasses,
  getSeverityLabel,
} from "../constants/medicalData";

export default function SeverityBadge({ severity, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${getSeverityClasses(
        severity,
      )} ${className}`.trim()}
    >
      {getSeverityLabel(severity)}
    </span>
  );
}
