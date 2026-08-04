import { FiX } from "react-icons/fi";
import TOAST_THEMES from "../../utils/toastTheme";

export const CustomToast = ({ type = "success", title, subtitle, children, closeToast }) => {
  const theme = TOAST_THEMES[type] || TOAST_THEMES.success;
  const { Icon, bg, border, textTitle, textDesc, iconColor, iconBg } = theme;

  // Resolve title from explicit title prop, string children, or nested React element
  const rawTitle = title || children;
  const displayTitle = typeof rawTitle === "string" 
    ? rawTitle 
    : rawTitle?.props?.children || (typeof rawTitle === "object" ? "" : String(rawTitle || ""));

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative flex items-start gap-3.5 p-4 rounded-2xl border ${bg} ${border} shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 font-sans w-[calc(100vw-32px)] sm:w-[380px] max-w-full`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold tracking-tight ${textTitle} break-words leading-snug`}>
          {displayTitle || "Notification"}
        </p>
        {subtitle && (
          <p className={`text-xs font-normal ${textDesc} mt-0.5 line-clamp-2 leading-relaxed`}>
            {subtitle}
          </p>
        )}
      </div>

      {closeToast && (
        <button
          onClick={closeToast}
          aria-label="Close notification"
          className={`shrink-0 p-1 rounded-lg opacity-75 hover:opacity-100 transition-opacity ${textTitle}`}
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default CustomToast;
