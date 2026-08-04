import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

/**
 * Premium Fashion E-Commerce Notification Theme System
 * Inspired by Myntra, Zara, Nike, and Amazon
 */

export const TOAST_THEMES = {
  success: {
    bg: "bg-[#ECFDF3] dark:bg-[#052E16]",
    border: "border-[#BBF7D0] dark:border-[#14532D]",
    textTitle: "text-[#166534] dark:text-[#BBF7D0]",
    textDesc: "text-[#15803D]/90 dark:text-[#86EFAC]/90",
    iconColor: "text-[#16A34A] dark:text-[#4ADE80]",
    iconBg: "bg-[#DCFCE7] dark:bg-[#14532D]/60",
    Icon: FiCheckCircle,
    label: "Success",
  },
  error: {
    bg: "bg-[#FEF2F2] dark:bg-[#450A0A]",
    border: "border-[#FECACA] dark:border-[#7F1D1D]",
    textTitle: "text-[#991B1B] dark:text-[#FCA5A5]",
    textDesc: "text-[#B91C1C]/90 dark:text-[#F87171]/90",
    iconColor: "text-[#DC2626] dark:text-[#F87171]",
    iconBg: "bg-[#FEE2E2] dark:bg-[#7F1D1D]/60",
    Icon: FiXCircle,
    label: "Error",
  },
  warning: {
    bg: "bg-[#FFFBEB] dark:bg-[#451A03]",
    border: "border-[#FDE68A] dark:border-[#78350F]",
    textTitle: "text-[#92400E] dark:text-[#FDE68A]",
    textDesc: "text-[#B45309]/90 dark:text-[#FCD34D]/90",
    iconColor: "text-[#D97706] dark:text-[#FBBF24]",
    iconBg: "bg-[#FEF3C7] dark:bg-[#78350F]/60",
    Icon: FiAlertTriangle,
    label: "Warning",
  },
  info: {
    bg: "bg-[#EFF6FF] dark:bg-[#172554]",
    border: "border-[#BFDBFE] dark:border-[#1E3A8A]",
    textTitle: "text-[#1E40AF] dark:text-[#BFDBFE]",
    textDesc: "text-[#1D4ED8]/90 dark:text-[#93C5FD]/90",
    iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
    iconBg: "bg-[#DBEAFE] dark:bg-[#1E3A8A]/60",
    Icon: FiInfo,
    label: "Info",
  },
};

export default TOAST_THEMES;
