import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import CalculatorScreen from '../screens/CalculatorScreen';
import LoginScreen from '../screens/LoginScreen';

// Navegação local e temporária. Não representa uma sessão autenticada.
export default function AppNavigator() {
  const [screen, setScreen] = useState('login');

  useEffect(() => {
    if (screen !== 'calculator') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen('login');
      return true;
    });

    return () => subscription.remove();
  }, [screen]);

  if (screen === 'calculator') {
    return <CalculatorScreen />;
  }

  return <LoginScreen onContinue={() => setScreen('calculator')} />;
}
