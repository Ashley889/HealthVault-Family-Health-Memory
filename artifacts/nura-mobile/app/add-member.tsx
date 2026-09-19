import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

export default function AddMemberScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useCreateProfile();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Mother');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const relationships = ['Mother', 'Father', 'Spouse', 'Child', 'Sibling', 'Other'];
  const save = () => {
    if (!name.trim()) {
      Alert.alert('Add a name', 'Every family member needs a name.');
      return;
    }
    create.mutate({ data: { name: name.trim(), relationship, dateOfBirth: dateOfBirth || null, color: colors.softBlue } }, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.back();
      },
      onError: () => Alert.alert('Couldn’t add member', 'Please try again.'),
    });
  };
  return (
    <Screen scroll={false} contentStyle={{ paddingTop: 12 }}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="Who would you like to add?" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Keep this first step simple. You can add health details later.</Text>
        <View style={styles.choiceGrid}>{relationships.map((item) => <Text key={item} onPress={() => setRelationship(item)} style={[styles.choice, { color: relationship === item ? colors.primaryForeground : colors.inkSoft, backgroundColor: relationship === item ? colors.primary : colors.card, borderColor: relationship === item ? colors.primary : colors.border }]}>{item}</Text>)}</View>
        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Meera Sharma" colors={colors} />
        <Field label="Date of birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" colors={colors} />
        <PrimaryButton label={create.isPending ? 'Adding member…' : 'Add member'} icon="check" disabled={create.isPending} onPress={save} testID="button-save-family-member" />
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

function Field({ label, value, onChangeText, placeholder, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} /></View>;
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 40 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9, fontFamily: 'Inter_600SemiBold', fontSize: 13, overflow: 'hidden' },
  field: { gap: 7 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15 },
});