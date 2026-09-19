import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDeleteEvent, useGetProfile, useListEvents } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ActionDialog, Card, ErrorState, Header, LoadingState, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function EventDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, profileId } = useLocalSearchParams<{ id: string; profileId: string }>();
  const eventId = Number(id);
  const memberId = Number(profileId);
  const profile = useGetProfile(memberId);
  const events = useListEvents(memberId);
  const remove = useDeleteEvent();
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  if (profile.isLoading || events.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profile.isError || events.isError || !profile.data || !events.data) return <Screen scroll={false}><ErrorState onRetry={() => { void profile.refetch(); void events.refetch(); }} /></Screen>;
  const event = events.data.find((item) => item.id === eventId);
  if (!event) {
    return (
      <Screen>
        {!deleted ? <Text style={[styles.notFound, { color: colors.mutedForeground }]}>This health memory is no longer available.</Text> : null}
        <ActionDialog visible={deleted} title="Health memory deleted" message="The health memory has been removed from your history." primaryLabel="Done" onPrimary={() => { setDeleted(false); router.replace('/history'); }} testID="health-memory-deleted-dialog" />
      </Screen>
    );
  }

  const testResult = event.tags.find((tag) => tag.startsWith('test:'))?.slice(5);
  const reportName = event.tags.find((tag) => tag.startsWith('report:'))?.slice(7);
  const hasAssociatedInformation = Boolean(event.medications.length || testResult || reportName || event.followUp);
  const confirmDelete = () => {
    setConfirmingDelete(true);
  };
  const deleteConfirmed = () => {
    remove.mutate({ eventId }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        setConfirmingDelete(false);
        setDeleted(true);
      },
      onError: () => Alert.alert('Couldn’t delete health memory', 'Please try again.'),
    });
  };
  return (
    <Screen>
      <Header eyebrow={`${profile.data.name} · ${event.type}`} title={event.title} subtitle={formatDate(event.date)} />
      <Card style={[styles.summary, { backgroundColor: colors.softBlue }]}><Feather name="heart" size={18} color={colors.primary} /><Text style={[styles.summaryText, { color: colors.inkSoft }]}>This memory is part of {profile.data.name}’s connected health history.</Text></Card>
      <View style={styles.section}>
        <SectionTitle title="What happened" />
        <DetailRow label="Doctor or hospital" value={event.provider || 'Not added'} colors={colors} />
        <DetailRow label="Reason for visit" value={event.title} colors={colors} />
        <DetailRow label="What did the doctor say?" value={event.description} colors={colors} />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Medication" />
        {event.medications.length ? event.medications.map((medication) => <Card key={medication} style={styles.detailCard}><Feather name="clock" size={16} color={colors.primary} /><Text style={[styles.detailValue, { color: colors.foreground }]}>{medication}</Text></Card>) : <Text style={[styles.empty, { color: colors.mutedForeground }]}>No medication was added.</Text>}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Tests" />
        <DetailRow label="Test result" value={testResult || 'No test was added.'} colors={colors} />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Report" />
        <Card style={styles.detailCard}><Feather name="file-text" size={16} color={colors.primary} /><Text style={[styles.detailValue, { color: colors.foreground }]}>{reportName || 'No report uploaded.'}</Text></Card>
      </View>
      <View style={styles.section}>
        <SectionTitle title="Follow-up" />
        <DetailRow label="Follow-up date" value={event.followUp ? formatDate(event.followUp) : 'No follow-up scheduled.'} colors={colors} />
      </View>
      <Pressable testID="button-delete-health-memory" disabled={remove.isPending} onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, { borderColor: colors.destructive }, pressed && styles.pressed]}><Feather name="trash-2" size={17} color={colors.destructive} /><Text style={[styles.deleteText, { color: colors.destructive }]}>{remove.isPending ? 'Deleting…' : 'Delete health memory'}</Text></Pressable>
      <ActionDialog visible={confirmingDelete} title="Delete this health memory?" message={hasAssociatedInformation ? 'This will remove the visit and the information saved with it from your history.' : 'This will remove this health memory from your history.'} primaryLabel={remove.isPending ? 'Deleting…' : 'Delete'} onPrimary={deleteConfirmed} secondaryLabel="Cancel" onSecondary={() => setConfirmingDelete(false)} destructive testID="delete-health-memory-dialog" />
      <ActionDialog visible={deleted} title="Health memory deleted" message="The health memory has been removed from your history." primaryLabel="Done" onPrimary={() => { setDeleted(false); router.replace('/history'); }} testID="health-memory-deleted-dialog" />
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
  deleteButton: { minHeight: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  pressed: { opacity: 0.72 },
});