import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDeleteProfile, useListProfiles } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ActionDialog, Avatar, Card, ErrorState, Header, LoadingState, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';
import { loadAccountPreferences, saveAccountPreferences, type AccountPreferences } from '@/lib/preferences';

export default function ManageFamilyScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profiles = useListProfiles();
  const remove = useDeleteProfile();
  const [account, setAccount] = useState<AccountPreferences | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; name: string } | null>(null);
  const [removedName, setRemovedName] = useState<string | null>(null);

  useEffect(() => {
    void loadAccountPreferences().then(setAccount);
  }, []);

  useEffect(() => {
    if (!account || account.ownerProfileId || !profiles.data) return;
    const owner = profiles.data.find((profile) => profile.name.trim().toLowerCase() === account.name.trim().toLowerCase());
    if (!owner) return;
    const next = { ...account, ownerProfileId: owner.id };
    setAccount(next);
    void saveAccountPreferences(next);
  }, [account, profiles.data]);

  const confirmRemove = (profileId: number, name: string) => {
    if (account?.ownerProfileId === profileId || (!account?.ownerProfileId && name.trim().toLowerCase() === account?.name.trim().toLowerCase())) return;
    setRemoveTarget({ id: profileId, name });
  };

  const removeConfirmed = () => {
    if (!removeTarget) return;
    const target = removeTarget;
    remove.mutate({ profileId: target.id }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        setRemoveTarget(null);
        setRemovedName(target.name);
      },
      onError: () => Alert.alert('Couldn’t remove member', 'Please try again.'),
    });
  };

  if (profiles.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profiles.isError || !profiles.data) return <Screen scroll={false}><ErrorState onRetry={() => void profiles.refetch()} /></Screen>;

  return (
    <Screen>
      <Header eyebrow="Your family" title="Manage family" subtitle="Keep everyone’s health story together in one place." />
      <View style={styles.section}>
        <SectionTitle title={`${profiles.data.length} family ${profiles.data.length === 1 ? 'member' : 'members'}`} />
        {profiles.data.map((profile) => {
          const isOwner = account ? profile.id === account.ownerProfileId || (!account.ownerProfileId && profile.name.trim().toLowerCase() === account.name.trim().toLowerCase()) : false;
          return (
          <Card key={profile.id} style={styles.memberCard} onPress={() => router.push({ pathname: '/family/[id]', params: { id: String(profile.id) } })}>
            <Avatar initials={profile.initials} color={profile.color} size={46} />
            <View style={styles.copy}><Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{profile.relationship} · {profile.eventCount} memories{isOwner ? ' · Account owner' : ''}</Text></View>
            <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
            {account && !isOwner ? <Pressable testID={`delete-family-member-${profile.id}`} hitSlop={10} onPress={(event) => { event.stopPropagation(); confirmRemove(profile.id, profile.name); }}><Feather name="trash-2" size={18} color={colors.destructive} /></Pressable> : null}
          </Card>
          );
        })}
      </View>
      <OutlineButton label="Add family member" icon="plus" onPress={() => router.push('/add-member')} />
      <ActionDialog visible={Boolean(removeTarget)} title="Remove family member?" message={`Are you sure you want to remove ${removeTarget?.name ?? 'this person'} from your family?\n\nTheir health history will also be removed.`} primaryLabel={remove.isPending ? 'Removing…' : 'Remove'} onPrimary={removeConfirmed} secondaryLabel="Cancel" onSecondary={() => setRemoveTarget(null)} destructive testID="remove-family-member-dialog" />
      <ActionDialog visible={Boolean(removedName)} title="Family member removed" message={`${removedName ?? 'The family member'} has been removed from your family.`} primaryLabel="Done" onPrimary={() => setRemovedName(null)} testID="family-member-removed-dialog" />
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