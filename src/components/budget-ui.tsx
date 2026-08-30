import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney, formatDate } from '@/lib/budget-data';
import { useThemeContext } from '@/lib/theme-provider';

// Brand components
export function BrandMark({ size = 42, radius = 14 }: { size?: number; radius?: number }) {
  return (
    <div 
      className="bg-white flex items-center justify-center"
      style={{ 
        width: size, 
        height: size, 
        borderRadius: radius,
        backgroundImage: 'url(/budgetly-logo-mark.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    />
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const { palette } = useThemeContext();
  return (
    <div className="flex items-center gap-2">
      <BrandMark size={compact ? 34 : 40} radius={compact ? 11 : 13} />
      <span 
        className={cn(
          "font-bold",
          compact ? "text-lg" : "text-xl"
        )}
        style={{ color: palette.foreground }}
      >
        Budgetly
      </span>
    </div>
  );
}

// Card component
export function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const { palette } = useThemeContext();
  return (
    <div 
      className={cn("rounded-xl p-4 transition-all duration-300", className)}
      style={{ 
        backgroundColor: palette.surface, 
        border: `1px solid ${palette.border}`,
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.02)`,
        ...style 
      }}
    >
      {children}
    </div>
  );
}

// Section title with action
export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const { palette } = useThemeContext();
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold" style={{ color: palette.foreground }}>
        {title}
      </h3>
      {action && onPress ? (
        <button
          onClick={onPress}
          className="px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{ 
            backgroundColor: palette.primaryLight,
            color: palette.primary 
          }}
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

// Progress bar
export function ProgressBar({ value, color, trackColor }: { value: number; color?: string; trackColor?: string }) {
  const { palette } = useThemeContext();
  const activeColor = color || palette.primary;
  const activeTrack = trackColor || '#F3F4F6';
  const percentage = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div 
      className="h-1.5 rounded-full overflow-hidden"
      style={{ backgroundColor: activeTrack }}
    >
      <div 
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ 
          width: `${percentage}%`,
          backgroundImage: `linear-gradient(90deg, ${activeColor}, ${activeColor}dd)` 
        }}
      />
    </div>
  );
}

// Round icon for metrics
export function RoundIcon({ icon: Icon, size = 34, color, background }: { icon: LucideIcon; size?: number; color: string; background: string }) {
  return (
    <div 
      className="flex items-center justify-center rounded-full"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: background 
      }}
    >
      <Icon size={size * 0.5} color={color} />
    </div>
  );
}

// Money text component
export function MoneyText({ 
  amount, 
  language, 
  type,
  className, 
  style 
}: { 
  amount: number; 
  language: "en" | "fr"; 
  type?: "income" | "expense";
  className?: string; 
  style?: React.CSSProperties;
}) {
  const { palette } = useThemeContext();
  const formatted = formatMoney(amount, language);
  
  let color = palette.foreground;
  let prefix = "";
  
  if (type === "income") {
    color = palette.success;
    prefix = "+";
  } else if (type === "expense") {
    color = palette.error;
    prefix = "-";
  }
  
  return (
    <span 
      className={cn("font-semibold tabular-nums tracking-[-0.02em]", className)}
      style={{ 
        color,
        ...style 
      }}
    >
      {prefix}{formatted}
    </span>
  );
}

// Empty state component
export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  const { palette } = useThemeContext();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div 
        className="rounded-full p-4 mb-4"
        style={{ backgroundColor: palette.primaryLight }}
      >
        <Icon size={32} color={palette.primary} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: palette.foreground }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: palette.muted }}>
        {description}
      </p>
    </div>
  );
}

// Button component
export function Button({ 
  children, 
  onPress, 
  variant = "primary", 
  size = "medium",
  className,
  disabled,
  type = "button",
  form 
}: { 
  children: React.ReactNode; 
  onPress?: () => void; 
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  form?: string;
}) {
  const { palette } = useThemeContext();
  
  const baseStyles = "rounded font-medium transition-all duration-200 flex items-center justify-center";
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  const variantStyles: Record<string, { backgroundColor: string; color: string; hover: string; border?: string; boxShadow?: string }> = {
    primary: {
      backgroundColor: palette.primary,
      color: "#FFFFFF",
      hover: "opacity-90",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)"
    },
    secondary: {
      backgroundColor: palette.surface,
      color: palette.primary,
      hover: "bg-gray-50",
      border: `1px solid #E5E7EB`
    },
    outline: {
      backgroundColor: "transparent",
      color: palette.muted,
      border: `none`,
      hover: "opacity-80"
    }
  };
  
  const styles = variantStyles[variant];
  
  return (
    <button
      type={type}
      form={form}
      onClick={onPress}
      disabled={disabled}
      className={cn(baseStyles, sizeStyles[size], disabled && "opacity-50 cursor-not-allowed", className)}
      style={{ 
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        boxShadow: styles.boxShadow
      }}
    >
      {children}
    </button>
  );
}

// Input component
export function Input({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text", 
  className,
  error
}: { 
  label?: string; 
  placeholder?: string; 
  value: string; 
  onChange: (val: string) => void; 
  type?: string;
  className?: string;
  error?: string;
}) {
  const { palette } = useThemeContext();
  return (
    <div className={cn("w-full", className)}>
      {label && <label className="block text-xs font-semibold mb-1.5" style={{ color: palette.muted }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded bg-white transition-all duration-200 outline-none placeholder:text-gray-400"
        style={{ 
          color: palette.foreground,
          padding: '12px 16px',
          border: `1px solid ${error ? palette.error : '#D1D5DB'}`,
          boxShadow: `0 1px 2px rgba(0,0,0,0.05)`
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = `1px solid ${palette.primary}`;
          e.currentTarget.style.boxShadow = `0 0 0 3px #1a56db1a`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = `1px solid ${error ? palette.error : '#D1D5DB'}`;
          e.currentTarget.style.boxShadow = `0 1px 2px rgba(0,0,0,0.05)`;
        }}
      />
      {error && <span className="text-[11px] font-semibold mt-1.5 block" style={{ color: palette.error }}>{error}</span>}
    </div>
  );
}

// Formatted date component
export function FormattedDate({ date, language }: { date: string; language: "en" | "fr" }) {
  const { palette } = useThemeContext();
  return (
    <span className="text-sm" style={{ color: palette.muted }}>
      {formatDate(date, language)}
    </span>
  );
}export const defaultIcons: Record<string, any> = {};
