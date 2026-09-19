import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, Header, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

export default function AboutScreen() {
  const colors = useColors();
  return (
    <Screen>
      <Header eyebrow="Nura" title="About Nura" subtitle="Your family's health, remembered." />
      <Card style={[styles.brandCard, { backgroundColor: colors.softBlue }]}>
        <View style={[styles.brandMark, { backgroundColor: colors.card }]}><Feather name="heart" size={22} color={colors.primary} /></View>
        <Text style={[styles.brandTitle, { color: colors.foreground }]}>Nura</Text>
        <Text style={[styles.brandText, { color: colors.inkSoft }]}>Nura helps families remember the health details that are easy to lose — visits, medications, tests, follow-ups, and health journeys.</Text>
      </Card>
      <View style={styles.section}>
        <SectionTitle title="App information" />
        <InfoRow label="Version" value="1.0" colors={colors} />
        <InfoRow label="Terms" value="Available in the full release" colors={colors} />
        <InfoRow label="Support" value="Help & support in Profile" colors={colors} />
      </View>
    </Screen>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.infoRow}><Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.value, { color: colors.foreground }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  brandCard: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  brandMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  brandText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  section: { gap: 12 },
  infoRow: { gap: 4, paddingVertical: 4 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  value: { fontFamily: 'Inter_400Regular', fontSize: 15 },
});