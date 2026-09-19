import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

const feedbackTypes = ['Issue', 'Suggestion', 'Feature request', 'Other'];

export default function FeedbackScreen() {
  const colors = useColors();
  const [type, setType] = useState('Suggestion');
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!message.trim()) {
      Alert.alert('Tell us a little more', 'Add a short note so the Nura team knows what to improve.');
      return;
    }
    Alert.alert('Thank you', 'Your feedback has been received.', [{ text: 'Done' }]);
    setMessage('');
  };

  return (
    <Screen scroll={false} contentStyle={{ paddingTop: 12 }}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="How can we improve Nura?" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Your feedback helps us keep Nura calm, useful, and family-first.</Text>
        <View style={styles.choices}>{feedbackTypes.map((item) => <Text key={item} onPress={() => setType(item)} style={[styles.choice, { color: type === item ? colors.primaryForeground : colors.inkSoft, backgroundColor: type === item ? colors.primary : colors.card, borderColor: type === item ? colors.primary : colors.border }]}>{item}</Text>)}</View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Tell us more</Text><TextInput value={message} onChangeText={setMessage} multiline placeholder="Tell us more" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
        <PrimaryButton label="Submit feedback" icon="send" onPress={submit} />
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 42 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, fontFamily: 'Inter_600SemiBold', fontSize: 13, overflow: 'hidden' },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 140, borderWidth: 1, borderRadius: 16, padding: 15, fontFamily: 'Inter_400Regular', fontSize: 15, textAlignVertical: 'top' },
});