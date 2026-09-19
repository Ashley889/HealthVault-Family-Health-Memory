import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setBaseUrl } from '@workspace/api-client-react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back', headerTintColor: '#2784bd', headerTitleStyle: { fontFamily: 'Inter_600SemiBold' } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="family/[id]" options={{ title: 'Family member', presentation: 'card' }} />
      <Stack.Screen name="journey/[id]" options={{ title: 'Health journey', presentation: 'card' }} />
      <Stack.Screen name="medication/[id]" options={{ title: 'Medication details', presentation: 'card' }} />
      <Stack.Screen name="manage-family" options={{ title: 'Manage family', presentation: 'card' }} />
      <Stack.Screen name="feedback" options={{ title: 'Feedback', presentation: 'card' }} />
      <Stack.Screen name="help" options={{ title: 'Help & support', presentation: 'card' }} />
      <Stack.Screen name="account" options={{ title: 'Account information', presentation: 'card' }} />
      <Stack.Screen name="about" options={{ title: 'About Nura', presentation: 'card' }} />
      <Stack.Screen name="add-update" options={{ title: 'Add health memory', presentation: 'modal' }} />
      <Stack.Screen name="add-member" options={{ title: 'Add family member', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
