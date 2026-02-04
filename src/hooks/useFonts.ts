import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export const useFigtreeFonts = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Figtree_400Regular: Inter_400Regular,
    Figtree_500Medium: Inter_500Medium,
    Figtree_600SemiBold: Inter_600SemiBold,
    Figtree_700Bold: Inter_700Bold,
  });

  return { fontsLoaded };
};