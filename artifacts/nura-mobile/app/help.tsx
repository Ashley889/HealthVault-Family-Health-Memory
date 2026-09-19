import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, Header, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';

const topics = [
  ['How do I add a family member?', 'Choose Add family member from Home or Profile.'],
  ['How do reminders work?', 'Open a due reminder and choose what happened next.'],
  ['How do I add a health memory?', 'Choose Add health memory to save a visit, question, report, or update.'],
  ['How do I upload a medical report?', 'Add a health memory, then choose Upload report.'],
  ['How do I manage notifications?', 'Open Notifications & reminder preferences from Profile.'],
];

export default function HelpScreen() {
  const colors = useColors();
  return (
    <Screen>
      <Header eyebrow="Support" title="Help & support" subtitle="Simple answers for using Nura with your family." />
      <View style={styles.section}>
        <SectionTitle title="Frequently asked questions" />
        {topics.map(([title, detail]) => <Card key={title} style={styles.topic}><Feather name="help-circle" size={18} color={colors.primary} /><View style={styles.copy}><Text style={[styles.topicTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.topicDetail, { color: colors.mutedForeground }]}>{detail}</Text></View></Card>)}
      </View>
      <OutlineButton label="Contact support" icon="mail" onPress={() => Alert.alert('Contact support', 'Support contact will be connected here in the next release.')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  topic: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  topicTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  topicDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
});