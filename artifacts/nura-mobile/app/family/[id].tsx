import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetProfile, useListEvents, useGetProfileSummary } from '@workspace/api-client-react';
import { Avatar, Card, ErrorState, Header, LoadingState, OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate, formatShortDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function FamilyMemberScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = Number(id);
  const profile = useGetProfile(profileId);
  const events = useListEvents(profileId);
  const summary = useGetProfileSummary(profileId);
  if (profile.isLoading || events.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profile.isError || events.isError || !profile.data || !events.data) return <Screen scroll={false}><ErrorState onRetry={() => { void profile.refetch(); void events.refetch(); }} /></Screen>;
  const item = profile.data;
  const recentTests = events.data.filter((event) => event.type === 'test');
  return (
    <Screen>
      <Header
        eyebrow={item.relationship}
        title={item.name}
        subtitle="A living health history, kept in context."
        right={<Avatar initials={item.initials} color={item.color} size={54} />}
      />
      <Card style={[styles.overview, { backgroundColor: colors.softBlue }]}>
        <Text style={[styles.overviewLabel, { color: colors.primary }]}>Health overview</Text>
        <View style={styles.overviewStats}><View><Text style={[styles.statNumber, { color: colors.foreground }]}>{events.data.length}</Text><Text style={[styles.statLabel, { color: colors.inkSoft }]}>memories</Text></View><View><Text style={[styles.statNumber, { color: colors.foreground }]}>{recentTests.length}</Text><Text style={[styles.statLabel, { color: colors.inkSoft }]}>tests saved</Text></View><View><Text style={[styles.statNumber, { color: colors.foreground }]}>{item.bloodGroup || '—'}</Text><Text style={[styles.statLabel, { color: colors.inkSoft }]}>blood group</Text></View></View>
      </Card>
      <View style={styles.section}>
        <SectionTitle title="Active health journeys" />
        <Card onPress={() => router.push({ pathname: '/journey/[id]', params: { id: String(item.id), title: events.data?.[0]?.title || 'Health journey' } })} style={styles.journeyCard}>
          <View style={[styles.journeyIcon, { backgroundColor: colors.accent }]}><Feather name="activity" size={19} color={colors.primary} /></View>
          <View style={styles.journeyCopy}><Text style={[styles.journeyTitle, { color: colors.foreground }]}>{events.data[0]?.title || 'Start a health journey'}</Text><Text style={[styles.journeyDetail, { color: colors.mutedForeground }]}>{events.data[0]?.description || 'Keep updates, tests, and doctors together.'}</Text></View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Card>
      </View>
      <View style={styles.section}>
        <SectionTitle title="Recent activity" />
        {events.data.slice(0, 4).map((event) => <View key={event.id} style={styles.activityRow}><View style={[styles.activityDot, { backgroundColor: colors.primary }]} /><View style={styles.activityCopy}><Text style={[styles.activityTitle, { color: colors.foreground }]}>{event.title}</Text><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>{formatShortDate(event.date)} · {event.description}</Text></View></View>)}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Doctor-ready summary" />
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryText, { color: colors.inkSoft }]}>{summary.data?.overview || 'A clear summary will appear here as this family member’s health history grows.'}</Text>
          <PrimaryButton label="View doctor summary" icon="arrow-up-right" onPress={() => router.push({ pathname: '/journey/[id]', params: { id: String(item.id), title: 'Doctor summary' } })} />
        </Card>
        <OutlineButton label="Add health update" icon="plus" onPress={() => router.push({ pathname: '/add-update', params: { profileId: String(item.id) } })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overview: { gap: 15 },
  overviewLabel: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  overviewStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statNumber: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  section: { gap: 12 },
  journeyCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  journeyIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  journeyCopy: { flex: 1, gap: 4 },
  journeyTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  journeyDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  activityRow: { flexDirection: 'row', gap: 12, minHeight: 54 },
  activityDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  activityCopy: { flex: 1, gap: 4 },
  activityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  activityDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  summaryCard: { gap: 15 },
  summaryText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
});