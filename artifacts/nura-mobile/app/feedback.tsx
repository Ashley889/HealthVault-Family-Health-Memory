import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionDialog, Card, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';
import { formatDate } from '@/lib/format';
import { loadFeedbackHistory, saveFeedbackEntry, type FeedbackEntry } from '@/lib/preferences';

const feedbackTypes = ['Issue', 'Suggestion', 'Feature request', 'Other'];

export default function FeedbackScreen() {
  const colors = useColors();
  const [type, setType] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<FeedbackEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void loadFeedbackHistory().then((entries) => {
      setHistory(entries);
      setReady(true);
    });
  }, []);

  const submit = async () => {
    if (!message.trim()) {
      Alert.alert('Tell us a little more', 'Add a short note so the Nura team knows what to improve.');
      return;
    }
    try {
      const entry = await saveFeedbackEntry({ type, message: message.trim() });
      setHistory((current) => [entry, ...current]);
      setSubmitted(true);
    } catch {
      Alert.alert('Couldn’t save feedback', 'Please try again.');
    }
  };

  if (!ready) return <Screen scroll={false}><LoadingState /></Screen>;

  return (
    <Screen scroll={false} contentStyle={{ paddingTop: 12 }}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="How can we improve Nura?" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Your feedback helps us keep Nura calm, useful, and family-first.</Text>
        <View style={styles.choices}>{feedbackTypes.map((item) => <Text key={item} onPress={() => setType(item)} style={[styles.choice, { color: type === item ? colors.primaryForeground : colors.inkSoft, backgroundColor: type === item ? colors.primary : colors.card, borderColor: type === item ? colors.primary : colors.border }]}>{item}</Text>)}</View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Tell us more</Text><TextInput value={message} onChangeText={setMessage} multiline placeholder="Tell us more" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
        <PrimaryButton label="Submit feedback" icon="send" onPress={() => { void submit(); }} />
        <View style={styles.historySection}>
          <SectionTitle title="Feedback history" />
          {history.map((entry) => (
            <Card key={entry.id} style={styles.historyCard}>
              <View style={styles.historyHeader}><Text style={[styles.historyType, { color: colors.primary }]}>{entry.type}</Text><Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{formatDate(entry.createdAt)}</Text></View>
              <Text style={[styles.historyMessage, { color: colors.foreground }]}>“{entry.message}”</Text>
            </Card>
          ))}
        </View>
      </KeyboardAwareScrollViewCompat>
      <ActionDialog visible={submitted} title="Feedback sent" message={'Thank you for helping us improve Nura.\n\nYour feedback has been saved successfully.'} primaryLabel="Done" onPrimary={() => { setSubmitted(false); setMessage(''); }} testID="feedback-sent-dialog" />
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
  historySection: { gap: 12 },
  historyCard: { gap: 9 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  historyType: { fontFamily: 'Inter_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  historyDate: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  historyMessage: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
});