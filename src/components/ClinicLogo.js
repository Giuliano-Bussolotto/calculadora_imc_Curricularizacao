import { StyleSheet, Text, View } from 'react-native';

// Substitua este conteúdo pela imagem oficial quando ela estiver disponível.
export default function ClinicLogo() {
  return (
    <View
      style={styles.placeholder}
      accessible
      accessibilityLabel="Espaço para a logo da clínica"
    >
      <Text style={styles.symbol}>+</Text>
      <Text style={styles.label}>Logo da clínica</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignSelf: 'flex-start',
    minWidth: 148,
    minHeight: 80,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9BBAB1',
    borderRadius: 16,
    backgroundColor: '#EAF4F0',
    marginBottom: 32,
  },
  symbol: {
    color: '#196652',
    fontSize: 28,
    fontWeight: '500',
  },
  label: {
    color: '#3D655A',
    fontSize: 12,
    marginTop: 2,
  },
});
