import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGetDashboard } from '@workspace/api-client-react';
import { Avatar, Card, ErrorState, Header, LoadingState, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const dashboard = useGetDashboard();
  const [filter, setFilter] = useState('All');
  if (dashboard.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (dashboard.isError || !dashboard.data) return <Screen scroll={false}><ErrorState onRetry={() => void dashboard.refetch()} /></Screen>;
  const { profiles, recentEvents } = dashboard.data;
  const filters = ['All', ...profiles.slice(0, 4).map((profile) => profile.relationship)];
  const selectedProfileId = profiles.find((profile) => profile.relationship === filter)?.id;
  const events = useMemo(() => selectedProfileId ? recentEvents.filter((event) => event.profileId === selectedProfileId) : recentEvents, [recentEvents, selectedProfileId]);

  return (
    <Screen>
      <Header eyebrow="Family history" title="What happened over time?" subtitle="One clear view of the moments your family has saved." />
      <View style={styles.filterRow}>
        {filters.map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, { backgroundColor: filter === item ? colors.primary : colors.card, borderColor: filter === item ? colors.primary : colors.border }]}>
            <Text style={[styles.filterText, { color: filter === item ? colors.primaryForeground : colors.inkSoft }]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.timeline}>
        {events.map((event, index) => {
          const profile = profiles.find((item) => item.id === event.profileId);
          return (
            <View key={event.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                {index < events.length - 1 ? <View style={[styles.timelineLine, { backgroundColor: colors.border }]} /> : null}
              </View>
              <Card style={styles.timelineCard} onPress={() => profile && undefined}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.date, { color: colors.primary }]}>{formatDate(event.date)}</Text>
                  {profile ? <Avatar initials={profile.initials} color={profile.color} size={28} /> : null}
                </View>
                <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
                <Text style={[styles.eventDescription, { color: colors.mutedForeground }]} numberOfLines={2}>{event.description}</Text>
                {event.followUp ? <View style={styles.followUp}><Feather name="calendar" size={13} color={colors.primary} /><Text style={[styles.followUpText, { color: colors.inkSoft }]}>Follow-up {formatDate(event.followUp)}</Text></View> : null}
              </Card>
            </View>
          );
        })}
      </View>
      {!events.length ? <Card><SectionTitle title="No memories yet" /><Text style={[styles.eventDescription, { color: colors.mutedForeground }]}>Start with a small update from the home screen.</Text></Card> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filter: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineRail: { width: 16, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 22 },
  timelineLine: { width: 1, flex: 1, marginVertical: 3 },
  timelineCard: { flex: 1, marginBottom: 12, gap: 8 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  eventTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  eventDescription: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  followUp: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  followUpText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});