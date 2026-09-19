import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Header, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';
import { loadAccountPreferences, type AccountPreferences } from '@/lib/preferences';

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const [account, setAccount] = useState<AccountPreferences>({ name: 'Bhuvaneswari', phone: '', email: '' });

  useEffect(() => {
    void loadAccountPreferences().then(setAccount);
  }, []);

  return (
    <Screen>
      <Header eyebrow="Your Nura" title="Profile & settings" />
      <Card style={[styles.identity, { backgroundColor: colors.softBlue }]}>
        <View style={[styles.identityMark, { backgroundColor: colors.card }]}><Text style={[styles.identityInitials, { color: colors.primary }]}>{account.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View>
        <View style={styles.identityCopy}><Text style={[styles.identityName, { color: colors.foreground }]}>{account.name}</Text><Text style={[styles.identityDetail, { color: colors.inkSoft }]}>Family organizer</Text></View>
      </Card>
      <View style={styles.section}>
        <SectionTitle title="Family" />
        <OutlineButton label="Manage family" icon="users" onPress={() => router.push('/manage-family')} />
        <OutlineButton label="Add family member" icon="plus" onPress={() => router.push('/add-member')} />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Settings" />
        <Card onPress={() => router.push('/notifications')} style={styles.preference}><Feather name="bell" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Notifications & reminder preferences</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/account')} style={styles.preference}><Feather name="user" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Account information</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/help')} style={styles.preference}><Feather name="help-circle" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Help & support</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/feedback')} style={styles.preference}><Feather name="message-circle" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>Feedback</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>
        <Card onPress={() => router.push('/about')} style={styles.preference}><Feather name="info" size={18} color={colors.primary} /><Text style={[styles.preferenceText, { color: colors.foreground }]}>About Nura</Text><Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0</Text></Card>
      </View>
      <OutlineButton label="Log out" icon="log-out" onPress={() => Alert.alert('Log out?', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: () => Alert.alert('Logged out', 'You are using Nura in local preview mode.') }])} />
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