import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { MarketplaceProvider } from './src/context/MarketplaceContext';
import { TasksProvider } from './src/context/TasksContext';
import { PickDropProvider } from './src/context/PickDropContext';
import { ChatProvider } from './src/context/ChatContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.borderLight,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MarketplaceProvider>
          <TasksProvider>
            <PickDropProvider>
              <ChatProvider>
                <NotificationsProvider>
                  <View style={styles.container}>
                    <StatusBar style="dark" />
                    <NavigationContainer theme={navigationTheme}>
                      <RootNavigator />
                    </NavigationContainer>
                  </View>
                </NotificationsProvider>
              </ChatProvider>
            </PickDropProvider>
          </TasksProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
