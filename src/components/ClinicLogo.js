import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function ClinicLogo() {
  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Clínica Corpo e Saúde"
    >
      <View style={styles.mark}><Text style={styles.symbol}>♡</Text><Text style={styles.plus}>+</Text></View>
      <Text style={styles.label}>Clínica</Text>
      <Text style={styles.name}>Corpo e Saúde</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  mark: {
    width: 72,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    color: colors.primary,
    fontSize: 68,
    lineHeight: 72,
    fontWeight: '700',
    transform: [{ rotate: '-8deg' }],
  },
  plus: {
    position: 'absolute',
    right: 8,
    top: 1,
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 8,
  },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', lineHeight: 27 },
});
