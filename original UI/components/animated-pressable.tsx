import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle, Animated as RNAnimated } from "react-native";

const RNAnimatedPressable = RNAnimated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, "children"> {
  children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  scaleTo?: number;
  style?: StyleProp<ViewStyle> | any;
}

export function AnimatedPressable({ children, scaleTo = 0.96, style, onPressIn, onPressOut, ...rest }: AnimatedPressableProps) {
  const [isPressed, setIsPressed] = React.useState(false);
  const scale = React.useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = (e: any) => {
    setIsPressed(true);
    RNAnimated.spring(scale, { toValue: scaleTo, friction: 5, tension: 300, useNativeDriver: true }).start();
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    setIsPressed(false);
    RNAnimated.spring(scale, { toValue: 1, friction: 5, tension: 300, useNativeDriver: true }).start();
    if (onPressOut) onPressOut(e);
  };

  const resolvedStyle = typeof style === "function" ? style({ pressed: isPressed, hovered: false, focused: false }) : style;

  return (
    <RNAnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[resolvedStyle, { transform: [{ scale }] }]}
    >
      {typeof children === "function" ? children({ pressed: isPressed }) : children}
    </RNAnimatedPressable>
  );
}
