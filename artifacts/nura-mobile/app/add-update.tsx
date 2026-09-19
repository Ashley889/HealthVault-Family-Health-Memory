import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCompleteReminder, useCreateEvent, useCreateReminder, useGetDashboard } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
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
  const params = useLocalSearchParams<{ profileId?: string; reminderId?: string; prefillTitle?: string; prefillType?: string }>();
  const dashboard = useGetDashboard();
  const queryClient = useQueryClient();
  const create = useCreateEvent();
  const createReminder = useCreateReminder();
  const completeReminder = useCompleteReminder();
  const [profileId, setProfileId] = useState<number | undefined>(params.profileId ? Number(params.profileId) : undefined);
  const selectedProfileId = profileId ?? dashboard.data?.activeProfileId ?? dashboard.data?.profiles[0]?.id;
  const [type, setType] = useState<typeof eventOptions[number]['type']>(() => {
    const match = eventOptions.find((option) => option.type === params.prefillType);
    return match?.type ?? 'visit';
  });
  const [duration, setDuration] = useState<'short' | 'long'>('short');
  const [title, setTitle] = useState(params.prefillTitle ?? '');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [medications, setMedications] = useState('');
  const [testResult, setTestResult] = useState('');
  const [reportName, setReportName] = useState('');
  const [followUp, setFollowUp] = useState('');
  const attachReport = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setReportName(asset.fileName || asset.uri.split('/').pop() || 'Health report image');
    }
  };
  const save = () => {
    if (!selectedProfileId || !title.trim()) {
      Alert.alert('Add a little more', 'Choose a family member and add a title.');
      return;
    }
     void (async () => {
       try {
         const tags = [duration, ...(testResult.trim() ? [`test:${testResult.trim()}`] : []), ...(reportName ? [`report:${reportName}`] : [])];
         const detailParts = [description.trim() || 'Visit details captured in Nura.', testResult.trim() ? `Test result: ${testResult.trim()}` : '', reportName ? `Report attached: ${reportName}` : '', duration === 'short' ? 'Short-term attention' : 'Long-term attention'].filter(Boolean);
         await create.mutateAsync({ profileId: selectedProfileId, data: { type, title: title.trim(), description: detailParts.join(' · '), date: todayIso(), provider: provider.trim() || null, medications: medications.split(',').map((item) => item.trim()).filter(Boolean), followUp: followUp.trim() || null, tags } });
         if (followUp.trim()) {
           await createReminder.mutateAsync({ data: { profileId: selectedProfileId, title: `Follow-up: ${title.trim()}`, date: followUp.trim(), detail: provider.trim() ? `With ${provider.trim()}` : 'Review this health update' } });
         }
         if (params.reminderId) {
           await completeReminder.mutateAsync({ reminderId: Number(params.reminderId) });
         }
         await queryClient.invalidateQueries();
         if (params.reminderId) {
           router.replace('/history');
         } else {
           router.back();
         }
       } catch {
         Alert.alert('Couldn’t save memory', 'Check the date fields and try again.');
       }
     })();
  };
  return (
    <Screen scroll={false} contentStyle={{ paddingTop: 12 }}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="What happened?" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Add a few details so you can remember this visit later.</Text>
        <View style={styles.optionGrid}>{eventOptions.map((option) => <Text key={option.type} onPress={() => setType(option.type)} style={[styles.option, { color: type === option.type ? colors.primaryForeground : colors.inkSoft, backgroundColor: type === option.type ? colors.primary : colors.card, borderColor: type === option.type ? colors.primary : colors.border }]}>{option.label}</Text>)}</View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>For whom?</Text><View style={styles.optionGrid}>{dashboard.data?.profiles.map((profile) => <Text key={profile.id} onPress={() => setProfileId(profile.id)} style={[styles.option, { color: selectedProfileId === profile.id ? colors.primaryForeground : colors.inkSoft, backgroundColor: selectedProfileId === profile.id ? colors.primary : colors.card, borderColor: selectedProfileId === profile.id ? colors.primary : colors.border }]}>{profile.name}</Text>)}</View></View>
        <Field label="Reason for visit" value={title} onChangeText={setTitle} placeholder="e.g. Annual health check" colors={colors} />
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>What did the doctor say?</Text><TextInput value={description} onChangeText={setDescription} placeholder="Add a few notes" placeholderTextColor={colors.mutedForeground} multiline style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} /></View>
        <Field label="Doctor or hospital" value={provider} onChangeText={setProvider} placeholder="e.g. Dr. Sharma" colors={colors} />
        <Field label="Medication prescribed" value={medications} onChangeText={setMedications} placeholder="Separate medicines with commas" colors={colors} />
        <Field label="Tests" value={testResult} onChangeText={setTestResult} placeholder="e.g. Vitamin D blood test" colors={colors} />
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Upload report</Text><OutlineButton label={reportName ? 'Replace report' : 'Upload report'} icon="paperclip" onPress={() => { void attachReport(); }} />{reportName ? <View style={styles.reportName}><Feather name="file-text" size={15} color={colors.primary} /><Text style={[styles.reportText, { color: colors.inkSoft }]} numberOfLines={2}>{reportName}</Text></View> : null}</View>
        <Field label="Follow-up date" value={followUp} onChangeText={setFollowUp} placeholder="YYYY-MM-DD" colors={colors} />
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>How long will this need attention?</Text><View style={styles.durationRow}><Text onPress={() => setDuration('short')} style={[styles.duration, { backgroundColor: duration === 'short' ? colors.softBlue : colors.card, borderColor: duration === 'short' ? colors.primary : colors.border, color: colors.foreground }]}><Text style={styles.durationTitle}>Short-term</Text>{'\n'}Something temporary</Text><Text onPress={() => setDuration('long')} style={[styles.duration, { backgroundColor: duration === 'long' ? colors.softBlue : colors.card, borderColor: duration === 'long' ? colors.primary : colors.border, color: colors.foreground }]}><Text style={styles.durationTitle}>Long-term</Text>{'\n'}Ongoing monitoring</Text></View></View>
         <PrimaryButton label={create.isPending || completeReminder.isPending ? 'Saving to health history…' : params.reminderId ? 'Save to health history' : 'Save health memory'} icon="check" disabled={create.isPending || completeReminder.isPending} onPress={save} testID="button-save-health-memory" />
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
  reportName: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reportText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 18 },
  durationRow: { flexDirection: 'row', gap: 9 },
  duration: { flex: 1, minHeight: 78, borderWidth: 1, borderRadius: 16, padding: 12, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  durationTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});