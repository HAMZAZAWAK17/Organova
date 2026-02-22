import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
    return (
        <AuthProvider>
            <StatusBar style="light" />
            <AppNavigator />
        </AuthProvider>
    );
}

registerRootComponent(App);
