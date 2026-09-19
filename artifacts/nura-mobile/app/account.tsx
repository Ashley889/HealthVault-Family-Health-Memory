import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, Header, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

export default function AccountScreen() {
  const colors = useColors();
  return (
    <Screen>
      <Header eyebrow="Your Nura" title="Account information" subtitle="The basics about the person organizing this family’s care." />
      <Card style={[styles.identity, { backgroundColor: colors.softBlue }]}>
        <View style={[styles.identityMark, { backgroundColor: colors.card }]}><Text style={[styles.identityInitials, { color: colors.primary }]}>BS</Text></View>
        <View style={styles.copy}><Text style={[styles.name, { color: colors.foreground }]}>Bhuvaneswari</Text><Text style={[styles.detail, { color: colors.inkSoft }]}>Family organizer</Text></View>
      </Card>
      <View style={styles.section}>
        <SectionTitle title="Profile information" />
        <Detail label="Email" value="Not added" colors={colors} />
        <Detail label="Phone" value="Not added" colors={colors} />
        <Detail label="Role" value="Family organizer" colors={colors} />
      </View>
      <OutlineButton label="Edit profile" icon="edit-2" onPress={() => Alert.alert('Edit profile', 'Profile editing will be connected here.')} />
      <OutlineButton label="Log out" icon="log-out" onPress={() => Alert.alert('Log out', 'You are already using Nura in local preview mode.')} />
    </Screen>
  );
}

function Detail({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 18 },
  identityMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  identityInitials: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  section: { gap: 12 },
  detailRow: { gap: 4, paddingVertical: 4 },
  detailLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  detailValue: { fontFamily: 'Inter_400Regular', fontSize: 15 },
});