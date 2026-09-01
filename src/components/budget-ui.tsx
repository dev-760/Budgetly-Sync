import React from 'react';
import { LucideIcon, Wallet } from 'lucide-react';
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
    <div className="flex items-center gap-2.5">
      <BrandMark size={compact ? 34 : 40} radius={compact ? 11 : 13} />
      <span 
        className="font-extrabold"
        style={{ 
          color: palette.foreground,
          fontSize: compact ? 18 : 22,
          letterSpacing: -0.7
        }}
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
      className={cn("", className)}
      style={{ 
        borderRadius: 22,
        padding: 16,
        backgroundColor: palette.surface, 
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: palette.border,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
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
    <div className="flex items-center justify-between" style={{ marginTop: 24, marginBottom: 12 }}>
      <h3 
        className="text-[18px] font-extrabold" 
        style={{ color: palette.foreground, letterSpacing: -0.3 }}
      >
        {title}
      </h3>
      {action && onPress ? (
        <button
          onClick={onPress}
          className="text-[12px] font-extrabold active:opacity-65 transition-opacity"
          style={{ 
            backgroundColor: '#EEF3FF',
            color: palette.primary,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12
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
      <Icon size={Math.round(size * 0.48)} color={color} strokeWidth={2} />
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
  const sign = type === "income" ? "positive" : type === "expense" ? "negative" : undefined;
  const formatted = formatMoney(amount, language, sign);
  
  let color = palette.foreground;
  if (type === "income") {
    color = palette.success;
  } else if (type === "expense") {
    color = palette.error;
  }
  
  return (
    <span 
      className={cn("font-extrabold tabular-nums", className)} 
      style={{ color, fontWeight: 800, ...style }}
    >
      {formatted}
    </span>
  );
}

// Empty state component
export function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  const { palette } = useThemeContext();
  return (
    <div className="flex flex-col items-center" style={{ paddingVertical: 32, paddingHorizontal: 28, minHeight: 120 }}>
      <RoundIcon icon={Icon} size={52} color={palette.primary} background="#EAF0FF" />
      <h3 className="mt-4 text-[17px] font-extrabold text-center" style={{ color: palette.foreground }}>
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-[22px] text-center max-w-[280px]" style={{ color: palette.muted }}>
        {body}
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
}

// Finance Board Strip component
export function FinanceBoardStrip({ 
  netWorth, 
  buckets, 
  language, 
  t,
  onPress 
}: { 
  netWorth: number; 
  buckets: Array<{ id: string; balance: number; color: string }>; 
  language: "en" | "fr";
  t: (key: string) => string;
  onPress?: () => void;
}) {
  const { palette } = useThemeContext();
  const isFrench = language === "fr";
  
  return (
    <button
      onClick={onPress}
      className="w-full text-left active:opacity-65 transition-opacity"
      style={{
        marginTop: 16,
        backgroundColor: palette.foreground,
        borderRadius: 24,
        padding: 22,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
      }}
    >
      <div className="flex flex-row justify-between items-start mb-4">
        <div>
          <p className="text-[17px] font-bold" style={{ color: '#FFFFFF' }}>
            {isFrench ? "Vue financière" : "Finance board"}
          </p>
          <p className="text-[13px] mt-1" style={{ color: '#8B94A7' }}>
            {isFrench ? "Comptes et engagements" : "Accounts & commitments"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#FFFFFF' }}>
            {isFrench ? "Valeur nette" : "Net worth"}
          </p>
          <p className="text-[19px] font-extrabold tabular-nums" style={{ color: '#FFFFFF' }}>
            {formatMoney(netWorth, language)}
          </p>
        </div>
      </div>

      <div className="flex flex-row gap-3.5 mt-4.5">
        {buckets.map((bucket) => (
          <div 
            key={bucket.id} 
            className="flex-1 flex flex-row items-center gap-3"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.06)',
              padding: 12,
              borderRadius: 16
            }}
          >
            <RoundIcon
              icon={Wallet}
              size={30}
              color={bucket.color}
              background={bucket.id === "cash" ? "rgba(22, 167, 123, 0.15)" : "rgba(26, 86, 219, 0.15)"}
            />
            <div>
              <p className="text-[13px] font-bold" style={{ color: '#DDE6FF' }}>
                {bucket.id === "cash" ? t("cash") : t("card")}
              </p>
              <p className="text-[15px] font-extrabold tabular-nums mt-0.5" style={{ color: '#FFFFFF' }}>
                {formatMoney(bucket.balance, language)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}

export const defaultIcons: Record<string, any> = {};
