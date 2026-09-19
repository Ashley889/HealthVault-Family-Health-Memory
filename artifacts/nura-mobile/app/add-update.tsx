import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateEvent, useGetDashboard } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { todayIso } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

const eventOptions = [
  { label: 'Doctor visit', type: 'visit' as const },
  { label: 'Medication', type: 'medication' as const },
  { label: 'Test / lab report', type: 'test' as const },
  { label: 'New health issue', type: 'symptom' as const },
  { label: 'General update', type: 'note' as const },
];

export default function AddUpdateScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ profileId?: string }>();
  const dashboard = useGetDashboard();
  const queryClient = useQueryClient();
  const create = useCreateEvent();
  const [profileId, setProfileId] = useState<number | undefined>(params.profileId ? Number(params.profileId) : undefined);
  const selectedProfileId = profileId ?? dashboard.data?.activeProfileId ?? dashboard.data?.profiles[0]?.id;
  const [type, setType] = useState<typeof eventOptions[number]['type']>('visit');
  const [duration, setDuration] = useState<'short' | 'long'>('short');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const save = () => {
    if (!selectedProfileId || !title.trim()) {
      Alert.alert('Add a little more', 'Choose a family member and add a title.');
      return;
    }
    create.mutate({ profileId: selectedProfileId, data: { type, title: title.trim(), description: `${description.trim()}${description.trim() ? ` · ${duration === 'short' ? 'Short-term' : 'Long-term'} attention` : `${duration === 'short' ? 'Short-term' : 'Long-term'} attention`}`, date: todayIso(), medications: [], tags: [duration] } }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.back();
      },
      onError: () => Alert.alert('Couldn’t save memory', 'Please try again.'),
    });
  };
  return (
    <Screen scroll={false} contentStyle={{ paddingTop: 12 }}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="What happened?" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Capture it naturally. Nura will keep the details together.</Text>
        <View style={styles.optionGrid}>{eventOptions.map((option) => <Text key={option.type} onPress={() => setType(option.type)} style={[styles.option, { color: type === option.type ? colors.primaryForeground : colors.inkSoft, backgroundColor: type === option.type ? colors.primary : colors.card, borderColor: type === option.type ? colors.primary : colors.border }]}>{option.label}</Text>)}</View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>For whom?</Text><View style={styles.optionGrid}>{dashboard.data?.profiles.map((profile) => <Text key={profile.id} onPress={() => setProfileId(profile.id)} style={[styles.option, { color: selectedProfileId === profile.id ? colors.primaryForeground : colors.inkSoft, backgroundColor: selectedProfileId === profile.id ? colors.primary : colors.card, borderColor: selectedProfileId === profile.id ? colors.primary : colors.border }]}>{profile.name}</Text>)}</View></View>
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Thyroid blood test" colors={colors} />
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>A little more</Text><TextInput value={description} onChangeText={setDescription} placeholder="What would you like to remember?" placeholderTextColor={colors.mutedForeground} multiline style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} /></View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>How long will this need attention?</Text><View style={styles.durationRow}><Text onPress={() => setDuration('short')} style={[styles.duration, { backgroundColor: duration === 'short' ? colors.softBlue : colors.card, borderColor: duration === 'short' ? colors.primary : colors.border, color: colors.foreground }]}><Text style={styles.durationTitle}>Short-term</Text>{'\n'}Something temporary</Text><Text onPress={() => setDuration('long')} style={[styles.duration, { backgroundColor: duration === 'long' ? colors.softBlue : colors.card, borderColor: duration === 'long' ? colors.primary : colors.border, color: colors.foreground }]}><Text style={styles.durationTitle}>Long-term</Text>{'\n'}Ongoing monitoring</Text></View></View>
        <PrimaryButton label={create.isPending ? 'Saving memory…' : 'Save health memory'} icon="check" disabled={create.isPending} onPress={save} testID="button-save-health-memory" />
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

function Field({ label, value, onChangeText, placeholder, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} /></View>;
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 42 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, fontFamily: 'Inter_600SemiBold', fontSize: 13, overflow: 'hidden' },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 15 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  durationRow: { flexDirection: 'row', gap: 9 },
  duration: { flex: 1, minHeight: 78, borderWidth: 1, borderRadius: 16, padding: 12, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  durationTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});