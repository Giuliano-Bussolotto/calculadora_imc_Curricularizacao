import { useEffect, useState } from 'react';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import AgendaScreen from '../screens/AgendaScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import FeedScreen from '../screens/FeedScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import RolesScreen from '../screens/RolesScreen';
import { colors } from '../theme';

// Navegação local e temporária. Não representa uma sessão autenticada.
export default function AppNavigator() {
  const [screen, setScreen] = useState('login');

  useEffect(() => {
    if (screen === 'login') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen(current => current === 'home' ? 'login' : 'home');
      return true;
    });

    return () => subscription.remove();
  }, [screen]);

  if (screen === 'login') {
    return <LoginScreen onContinue={() => setScreen('home')} />;
  }

  let content;
  if (screen === 'home') content = <HomeScreen onNavigate={setScreen} />;
  else if (screen === 'calculator') content = <CalculatorScreen />;
  else if (screen === 'agenda') content = <AgendaScreen />;
  else if (screen === 'feed') content = <FeedScreen />;
  else if (screen === 'roles') content = <RolesScreen onBack={() => setScreen('profile')} onSelectRole={roleId => setScreen(`permissions:${roleId}`)} />;
  else if (screen.startsWith('permissions:')) content = <PermissionsScreen roleId={screen.split(':')[1]} onBack={() => setScreen('roles')} />;
  else content = (
    <PlaceholderScreen
      title={{ profile: 'Perfil', activities: 'Atividades e Treinos', nutrition: 'Alimentação', notifications: 'Notificações' }[screen] || 'Em breve'}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{content}</View>
      <BottomNavigation activeScreen={screen} onNavigate={setScreen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, backgroundColor: colors.background },
});
