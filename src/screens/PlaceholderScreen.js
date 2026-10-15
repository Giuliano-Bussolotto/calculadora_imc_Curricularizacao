import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function PlaceholderScreen({ title, description }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description || 'Esta área será implementada em uma próxima etapa.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 10 },
  description: { maxWidth: 320, color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
