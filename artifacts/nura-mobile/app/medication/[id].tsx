import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useGetProfile, useListEvents } from '@workspace/api-client-react';
import { Card, ErrorState, Header, LoadingState, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function MedicationDetailScreen() {
  const colors = useColors();
  const { id, profileId, medication } = useLocalSearchParams<{ id: string; profileId: string; medication?: string }>();
  const profile = useGetProfile(Number(profileId));
  const events = useListEvents(Number(profileId));

  if (profile.isLoading || events.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profile.isError || events.isError || !profile.data || !events.data) return <Screen scroll={false}><ErrorState onRetry={() => { void profile.refetch(); void events.refetch(); }} /></Screen>;

  const event = events.data.find((item) => item.id === Number(id));
  if (!event) return <Screen scroll={false}><ErrorState onRetry={() => void events.refetch()} /></Screen>;
  const medicationName = medication || event.medications[0] || event.title;
  const statusTag = event.tags.find((tag) => ['completed', 'stopped'].includes(tag.toLowerCase()));
  const status = statusTag ? statusTag[0].toUpperCase() + statusTag.slice(1) : 'Active';

  return (
    <Screen>
      <Header eyebrow="Medication" title={medicationName} subtitle={`${profile.data.name} · medication history`} />
      <Card style={[styles.statusCard, { backgroundColor: colors.softBlue }]}>
        <View style={styles.statusLine}><View style={[styles.statusDot, { backgroundColor: status === 'Active' ? colors.success : colors.mutedForeground }]} /><Text style={[styles.status, { color: colors.foreground }]}>{status}</Text></View>
        <Text style={[styles.statusDetail, { color: colors.inkSoft }]}>{status === 'Active' ? 'Currently part of this family member’s health story.' : 'Kept in the permanent medication history.'}</Text>
      </Card>
      <View style={styles.section}>
        <SectionTitle title="Medication details" />
        <DetailRow label="Prescribed by" value={event.provider || 'Not added'} colors={colors} />
        <DetailRow label="Reason / related issue" value={event.description || 'Not added'} colors={colors} />
        <DetailRow label="Dosage and instructions" value={medicationName} colors={colors} />
        <DetailRow label="Started" value={formatDate(event.date)} colors={colors} />
        <DetailRow label="End date" value={status === 'Active' ? 'Ongoing' : formatDate(event.followUp)} colors={colors} />
        <DetailRow label="Related journey" value={event.tags.includes('long') ? 'Long-term health journey' : 'Health history'} colors={colors} />
      </View>
      {event.followUp ? <Card style={styles.followUp}><Feather name="calendar" size={17} color={colors.primary} /><Text style={[styles.followUpText, { color: colors.inkSoft }]}>Follow-up scheduled for {formatDate(event.followUp)}</Text></Card> : null}
    </Screen>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.detailRow}><Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.value, { color: colors.foreground }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  statusCard: { gap: 9 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  status: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  statusDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  section: { gap: 12 },
  detailRow: { gap: 5, paddingVertical: 4 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  value: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 21 },
  followUp: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  followUpText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 19 },
});