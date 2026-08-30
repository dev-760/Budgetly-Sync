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
      className={cn("rounded-[22px] p-4 transition-all duration-300", className)}
      style={{ 
        backgroundColor: palette.surface, 
        border: `1px solid ${palette.border}`,
        boxShadow: `0 8px 24px -12px ${palette.foreground}15`,
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
  const activeTrack = trackColor || palette.border;
  const percentage = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div 
      className="h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: activeTrack }}
    >
      <div 
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: activeColor 
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
export function MoneyText({ amount, language, className, style }: { amount: number; language: "en" | "fr"; className?: string; style?: React.CSSProperties }) {
  const { palette } = useThemeContext();
  const formatted = formatMoney(amount, language);
  
  return (
    <span 
      className={cn("font-semibold tabular-nums", className)}
      style={{ 
        color: palette.foreground,
        ...style 
      }}
    >
      {formatted}
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
  
  const baseStyles = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center";
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  const variantStyles: Record<string, { backgroundColor: string; color: string; hover: string; border?: string }> = {
    primary: {
      backgroundColor: palette.primary,
      color: "#FFFFFF",
      hover: "opacity-90"
    },
    secondary: {
      backgroundColor: palette.primaryLight,
      color: palette.primary,
      hover: "opacity-80"
    },
    outline: {
      backgroundColor: "transparent",
      color: palette.foreground,
      border: `1px solid ${palette.border}`,
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
        border: styles.border
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
  className 
}: { 
  label?: string; 
  placeholder?: string; 
  value: string; 
  onChange: (value: string) => void; 
  type?: string;
  className?: string;
}) {
  const { palette } = useThemeContext();
  
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-sm font-medium" style={{ color: palette.foreground }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
        style={{ 
          backgroundColor: palette.surface,
          borderColor: palette.border,
          color: palette.foreground
        }}
      />
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
