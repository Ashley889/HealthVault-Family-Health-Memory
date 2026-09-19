import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Header, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <Screen>
      <Header eyebrow="Your Nura" title="Profile & settings" subtitle="Make Nura feel like a calm place to return to." />
      <Card style={[styles.identity, { backgroundColor: colors.softBlue }]}>
        <View style={[styles.identityMark, { backgroundColor: colors.card }]}><Text style={[styles.identityInitials, { color: colors.primary }]}>BS</Text></View>
        <View style={styles.identityCopy}><Text style={[styles.identityName, { color: colors.foreground }]}>Bhuvaneswari</Text><Text style={[styles.identityDetail, { color: colors.inkSoft }]}>Family organizer</Text></View>
        <Feather name="edit-2" size={18} color={colors.primary} />
      </Card>
      <View style={styles.section}>
        <SectionTitle title="Nura is for" />
        <Card style={styles.preference}><Feather name="heart" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Remembering the details that are easy to lose.</Text></Card>
        <Card style={styles.preference}><Feather name="shield" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Keeping family health history clear and together.</Text></Card>
      </View>
      <View style={styles.section}>
        <SectionTitle title="Family" />
        <OutlineButton label="Manage family" icon="users" onPress={() => router.push('/manage-family')} />
        <OutlineButton label="Add family member" icon="plus" onPress={() => router.push('/add-member')} />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Settings" />
        <Card onPress={() => router.push('/account')} style={styles.preference}><Feather name="user" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Account information</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/help')} style={styles.preference}><Feather name="help-circle" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Help & support</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/feedback')} style={styles.preference}><Feather name="message-circle" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Feedback</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/about')} style={styles.preference}><Feather name="info" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>About Nura</Text><Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0</Text></Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 18 },
  identityMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  identityInitials: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  identityCopy: { flex: 1, gap: 4 },
  identityName: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  identityDetail: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  section: { gap: 12 },
  preference: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  preferenceText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20 },
  version: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});