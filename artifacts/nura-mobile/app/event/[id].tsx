import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useGetProfile, useListEvents } from '@workspace/api-client-react';
import { Card, ErrorState, Header, LoadingState, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function EventDetailScreen() {
  const colors = useColors();
  const { id, profileId } = useLocalSearchParams<{ id: string; profileId: string }>();
  const eventId = Number(id);
  const memberId = Number(profileId);
  const profile = useGetProfile(memberId);
  const events = useListEvents(memberId);

  if (profile.isLoading || events.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profile.isError || events.isError || !profile.data || !events.data) return <Screen scroll={false}><ErrorState onRetry={() => { void profile.refetch(); void events.refetch(); }} /></Screen>;
  const event = events.data.find((item) => item.id === eventId);
  if (!event) return <Screen><Text style={[styles.notFound, { color: colors.mutedForeground }]}>This health memory is no longer available.</Text></Screen>;

  const testResult = event.tags.find((tag) => tag.startsWith('test:'))?.slice(5);
  const reportName = event.tags.find((tag) => tag.startsWith('report:'))?.slice(7);
  return (
    <Screen>
      <Header eyebrow={`${profile.data.name} · ${event.type}`} title={event.title} subtitle={formatDate(event.date)} />
      <Card style={[styles.summary, { backgroundColor: colors.softBlue }]}><Feather name="heart" size={18} color={colors.primary} /><Text style={[styles.summaryText, { color: colors.inkSoft }]}>This memory is part of {profile.data.name}’s connected health history.</Text></Card>
      <View style={styles.section}>
        <SectionTitle title="Visit details" />
        <DetailRow label="Doctor or provider" value={event.provider || 'Not added'} colors={colors} />
        <DetailRow label="Visit reason" value={event.title} colors={colors} />
        <DetailRow label="Notes" value={event.description} colors={colors} />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Medication" />
        {event.medications.length ? event.medications.map((medication) => <Card key={medication} style={styles.detailCard}><Feather name="clock" size={16} color={colors.primary} /><Text style={[styles.detailValue, { color: colors.foreground }]}>{medication}</Text></Card>) : <Text style={[styles.empty, { color: colors.mutedForeground }]}>No medication was added.</Text>}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Test" />
        <DetailRow label="Result" value={testResult || 'No test result was added.'} colors={colors} />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Uploaded report" />
        <Card style={styles.detailCard}><Feather name="file-text" size={16} color={colors.primary} /><Text style={[styles.detailValue, { color: colors.foreground }]}>{reportName || 'No report attached.'}</Text></Card>
      </View>
      <View style={styles.section}>
        <SectionTitle title="Follow-up" />
        <DetailRow label="Next step" value={event.followUp ? formatDate(event.followUp) : 'No follow-up scheduled.'} colors={colors} />
      </View>
    </Screen>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  notFound: { fontFamily: 'Inter_400Regular', fontSize: 15 },
  summary: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  summaryText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 19 },
  section: { gap: 12 },
  detailRow: { gap: 4 },
  detailLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  detailValue: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  detailCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 14 },
});