import { useEffect, useState } from 'react';
import { BackHandler, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import AgendaScreen from '../screens/AgendaScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import FeedScreen from '../screens/FeedScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import RolesScreen from '../screens/RolesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import useProfileData from '../hooks/useProfileData';
import { demoUser, togglePost, updateOwnPost, recordBmi, completeAppointment } from '../domain/profile/profileData';
import { colors } from '../theme';

// Navegação local e temporária. Não representa uma sessão autenticada.
export default function AppNavigator() {
  const [screen, setScreen] = useState('login');
  const [profileSection, setProfileSection] = useState(null);
  const { data, setData, loadError, saveError, retryLoad, retrySave } = useProfileData();

  function navigate(next) {
    setProfileSection(null);
    setScreen(next);
  }

  useEffect(() => {
    if (screen === 'login') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'profile' && profileSection) {
        setProfileSection(null);
        return true;
      }
      setScreen(current => current === 'home' ? 'login' : 'home');
      return true;
    });

    return () => subscription.remove();
  }, [screen, profileSection]);

  if (screen === 'login') {
    return <LoginScreen onContinue={() => navigate('home')} />;
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{loadError ? 'Não foi possível carregar seu perfil.' : 'Carregando seu perfil…'}</Text>
          {loadError && <Pressable accessibilityRole="button" onPress={retryLoad} style={styles.retryButton}><Text style={styles.retryText}>Tentar novamente</Text></Pressable>}
        </View>
      </SafeAreaView>
    );
  }

  let content;
  if (screen === 'home') content = <HomeScreen onNavigate={navigate} />;
  else if (screen === 'calculator') content = <CalculatorScreen onAssessment={evaluation => setData(current => recordBmi(current, demoUser.id, evaluation))} />;
  else if (screen === 'agenda') content = <AgendaScreen currentUser={demoUser} appointments={data.appointments} onCompleteAppointment={id => setData(current => completeAppointment(current, demoUser.id, id))} />;
  else if (screen === 'feed') content = <FeedScreen currentUser={demoUser} profileData={data} onTogglePost={(collection, id) => setData(current => togglePost(current, collection, id))} onUpdatePost={(id, text) => setData(current => updateOwnPost(current, demoUser.id, id, text))} />;
  else if (screen === 'profile') content = <ProfileScreen currentUser={demoUser} data={data} section={profileSection} onSectionChange={setProfileSection} />;
  else if (screen === 'notifications') content = <NotificationsScreen />;
  else if (screen === 'roles') content = <RolesScreen onBack={() => setScreen('profile')} onSelectRole={roleId => setScreen(`permissions:${roleId}`)} />;
  else if (screen.startsWith('permissions:')) content = <PermissionsScreen roleId={screen.split(':')[1]} onBack={() => setScreen('roles')} />;
  else content = (
    <PlaceholderScreen
      title={{ activities: 'Atividades e Treinos', nutrition: 'Alimentação' }[screen] || 'Em breve'}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {saveError && <View style={styles.notice} accessibilityLiveRegion="polite"><Text style={styles.noticeText}>Não foi possível salvar suas alterações neste aparelho.</Text><Pressable accessibilityRole="button" onPress={retrySave} style={styles.retryButton}><Text style={styles.retryText}>Tentar salvar novamente</Text></Pressable></View>}
      <View style={styles.content}>{content}</View>
      <BottomNavigation activeScreen={screen} onNavigate={navigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, backgroundColor: colors.background },
  notice: { padding: 20, backgroundColor: colors.primarySoft },
  noticeText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  retryButton: { minHeight: 48, justifyContent: 'center' },
  retryText: { color: colors.primaryDark, fontWeight: '700' },
});
