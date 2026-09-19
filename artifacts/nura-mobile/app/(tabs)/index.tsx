import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetDashboard } from '@workspace/api-client-react';
import { useListReminders } from '@workspace/api-client-react';
import { Avatar, Card, ErrorState, Header, LoadingState, OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const dashboard = useGetDashboard();
  const reminders = useListReminders();

  if (dashboard.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (dashboard.isError || !dashboard.data) return <Screen scroll={false}><ErrorState onRetry={() => void dashboard.refetch()} /></Screen>;

  const { profiles } = dashboard.data;
  const openReminders = reminders.data?.filter((item) => !item.completed) ?? [];
  return (
    <Screen>
      <Header
         eyebrow="NURA"
        title="Your family’s health, remembered."
        subtitle="Good morning. Keep the small details close."
        right={
          <Pressable testID="button-profile-tab" onPress={() => router.push('/profile')} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.inkSoft} />
          </Pressable>
        }
      />
      <Card style={[styles.hero, { backgroundColor: colors.softBlue }]}>
        <View style={styles.heroOrb} />
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>What happened?</Text>
          <Text style={[styles.heroText, { color: colors.inkSoft }]}>Save a visit, question, report, or small health update while it’s fresh.</Text>
        </View>
        <PrimaryButton label="Add health memory" icon="plus" onPress={() => router.push('/add-update')} testID="button-add-health-memory" />
      </Card>
      <View style={styles.section}>
        <SectionTitle title="Your family" />
         <Text style={[styles.sectionIntro, { color: colors.mutedForeground }]}>See each person's health memories and upcoming reminders.</Text>
        <View style={styles.peopleGrid}>
          {profiles.map((profile) => {
            const reminderCount = openReminders.filter((reminder) => reminder.profileId === profile.id).length;
            return (
              <Card key={profile.id} onPress={() => router.push({ pathname: '/family/[id]', params: { id: String(profile.id) } })} style={styles.personCard} testID={`card-family-${profile.id}`}>
                <Avatar initials={profile.initials} color={profile.color} size={42} />
                <View style={styles.personCopy}><Text numberOfLines={1} style={[styles.personName, { color: colors.foreground }]}>{profile.name}</Text><Text style={[styles.personMeta, { color: colors.mutedForeground }]}>{profile.eventCount} health {profile.eventCount === 1 ? 'memory' : 'memories'}</Text><Text style={[styles.personMeta, { color: colors.mutedForeground }]}>{reminderCount ? `${reminderCount} upcoming ${reminderCount === 1 ? 'reminder' : 'reminders'}` : 'No upcoming reminders'}</Text></View>
                <View style={styles.viewFamily}><Text style={[styles.viewFamilyText, { color: colors.primary }]}>View</Text><Feather name="chevron-right" size={16} color={colors.primary} /></View>
              </Card>
            );
          })}
        </View>
        <OutlineButton label="Add family member" icon="plus" onPress={() => router.push('/add-member')} testID="button-add-family-member" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  hero: { overflow: 'hidden', gap: 18, padding: 20, minHeight: 224 },
  heroOrb: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -58, top: -72, backgroundColor: 'rgba(255,255,255,0.65)' },
  heroCopy: { gap: 10 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.6 },
  heroText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, maxWidth: 290 },
  section: { gap: 12 },
  sectionIntro: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginTop: -5 },
  peopleGrid: { gap: 10 },
  personCard: { width: '100%', minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  personCopy: { flex: 1, minWidth: 0, gap: 4 },
  personName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  personMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  viewFamily: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewFamilyText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
});
