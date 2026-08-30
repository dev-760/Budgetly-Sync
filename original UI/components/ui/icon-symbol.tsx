import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

const MAPPING = {
  "house.fill": "home",
  "list.bullet": "receipt-long",
  "chart.pie.fill": "pie-chart",
  "chart.line.uptrend.xyaxis": "insights",
  "person.fill": "person",
  "plus": "add",
  "bell.fill": "notifications",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "wallet.pass.fill": "account-balance-wallet",
  "target": "track-changes",
  "gearshape.fill": "settings",
  "globe": "language",
  "arrow.up.circle.fill": "arrow-upward",
  "arrow.down.circle.fill": "arrow-downward",
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "xmark": "close",
  "pencil": "edit",
  "trash": "delete-outline",
  "calendar": "calendar-today",
  "lightbulb.fill": "lightbulb",
  "creditcard.fill": "credit-card",
  "repeat": "repeat",
} as const satisfies Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: string }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
