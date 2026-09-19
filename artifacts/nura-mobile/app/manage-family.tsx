import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDeleteProfile, useListProfiles } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, Card, ErrorState, Header, LoadingState, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

export default function ManageFamilyScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profiles = useListProfiles();
  const remove = useDeleteProfile();

  const confirmRemove = (profileId: number, name: string) => {
    Alert.alert('Remove family member?', `${name}'s health history will also be removed.`, [
      { text: 'Keep member', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => remove.mutate({ profileId }, {
          onSuccess: async () => {
            await queryClient.invalidateQueries();
          },
          onError: () => Alert.alert('Couldn’t remove member', 'Please try again.'),
        }),
      },
    ]);
  };

  if (profiles.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profiles.isError || !profiles.data) return <Screen scroll={false}><ErrorState onRetry={() => void profiles.refetch()} /></Screen>;

  return (
    <Screen>
      <Header eyebrow="Your family" title="Manage family" subtitle="Keep everyone’s health story together in one place." />
      <View style={styles.section}>
        <SectionTitle title={`${profiles.data.length} family ${profiles.data.length === 1 ? 'member' : 'members'}`} />
        {profiles.data.map((profile) => (
          <Card key={profile.id} style={styles.memberCard} onPress={() => router.push({ pathname: '/family/[id]', params: { id: String(profile.id) } })}>
            <Avatar initials={profile.initials} color={profile.color} size={46} />
            <View style={styles.copy}><Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{profile.relationship} · {profile.eventCount} memories</Text></View>
            <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
            <Feather name="trash-2" size={17} color={colors.destructive} onPress={() => confirmRemove(profile.id, profile.name)} />
          </Card>
        ))}
      </View>
      <OutlineButton label="Add family member" icon="plus" onPress={() => router.push('/add-member')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 12 },
});