import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isTabScreen = segments[0] === '(tabs)';
  const topInset = isTabScreen ? insets.top : 0;
  const bottomInset = isTabScreen ? 112 + insets.bottom : 36 + insets.bottom;
  const body = (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: 18 + topInset },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
  if (!scroll) return body;
  const { ScrollView } = require('react-native') as typeof import('react-native');
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {body}
    </ScrollView>
  );
}

export function Header({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Avatar({ initials, color, size = 52 }: { initials: string; color?: string; size?: number }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color || colors.softBlue,
        },
      ]}
    >
      <Text style={[styles.avatarText, { color: colors.primary, fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

export function Card({ children, style, onPress, testID }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string }) {
  const colors = useColors();
  const content = <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-up-right',
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{label}</Text>
      <Feather name={icon} size={18} color={colors.primaryForeground} />
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, icon = 'plus', testID }: { label: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap; testID?: string }) {
  const colors = useColors();
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.outlineButton, { borderColor: colors.border, backgroundColor: colors.card }, pressed && styles.pressed]}
    >
      <Feather name={icon} size={17} color={colors.primary} />
      <Text style={[styles.outlineButtonText, { color: colors.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionTitleText, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingState() {
  const colors = useColors();
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Loading your family’s story…</Text>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.centered}>
      <Ionicons name="cloud-offline-outline" size={32} color={colors.mutedForeground} />
      <Text style={[styles.sectionTitleText, { color: colors.foreground }]}>Couldn’t load Nura</Text>
      <Pressable onPress={onRetry}>
        <Text style={[styles.sectionAction, { color: colors.primary }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: 5 },
  eyebrow: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 36, fontFamily: 'Inter_700Bold', letterSpacing: -0.7, flexShrink: 1 },
  subtitle: { fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular', flexShrink: 1 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold' },
  primaryButton: { minHeight: 52, borderRadius: 18, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 15, flexShrink: 1, textAlign: 'center' },
  outlineButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outlineButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, flexShrink: 1, textAlign: 'center' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleText: { fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.25, flexShrink: 1 },
  sectionAction: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
});

export const uiStyles = styles;