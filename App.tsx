import 'react-native-gesture-handler';
import 'expo-screen-orientation';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootStack from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <RootStack />
    </SafeAreaProvider>
  );
}
