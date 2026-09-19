import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Card, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { loadAccountPreferences, saveAccountPreferences, type AccountPreferences } from '@/lib/preferences';
import { useColors } from '@/hooks/useColors';

export default function AccountScreen() {
  const colors = useColors();
  const router = useRouter();
  const [account, setAccount] = useState<AccountPreferences>({ name: '', phone: '', email: '' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadAccountPreferences().then((saved) => {
      setAccount(saved);
      setReady(true);
    });
  }, []);

  const update = (field: keyof AccountPreferences, value: string) => {
    setAccount((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    if (!account.name.trim()) {
      Alert.alert('Add your name', 'Your name is required.');
      return;
    }
    await saveAccountPreferences({
      name: account.name.trim(),
      phone: account.phone.trim(),
      email: account.email.trim(),
    });
    router.back();
  };

  if (!ready) return <Screen scroll={false}><LoadingState /></Screen>;

  return (
    <Screen scroll={false}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="Edit profile" />
        <Card style={[styles.identity, { backgroundColor: colors.softBlue }]}>
          <View style={[styles.identityMark, { backgroundColor: colors.card }]}><Text style={[styles.identityInitials, { color: colors.primary }]}>{account.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View>
          <View style={styles.copy}><Text style={[styles.name, { color: colors.foreground }]}>{account.name}</Text><Text style={[styles.detail, { color: colors.inkSoft }]}>Family organizer</Text></View>
        </Card>
        <View style={styles.section}>
          <Field label="Name" value={account.name} onChangeText={(value) => update('name', value)} placeholder="Your name" colors={colors} />
          <Field label="Phone number" value={account.phone} onChangeText={(value) => update('phone', value)} placeholder="Add phone number" keyboardType="phone-pad" colors={colors} />
          <Field label="Email address" value={account.email} onChangeText={(value) => update('email', value)} placeholder="Add email address" keyboardType="email-address" colors={colors} />
        </View>
        <PrimaryButton label="Save changes" icon="check" onPress={() => { void save(); }} />
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'phone-pad' | 'email-address'; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>;
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 42 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 18 },
  identityMark: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  identityInitials: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  section: { gap: 14 },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 15 },
});