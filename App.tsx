import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
} from 'react-native';

import AppNavigator from './navigation/AppNavigator';

import ScoreContextProvider from './store/score-context';

export default function App() {

  return (
    <ScoreContextProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </ScoreContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
