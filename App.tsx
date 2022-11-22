import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  StyleSheet,
} from 'react-native';

import PoseDetectScreen from './screens/main/PoseDetectScreen';

import ScoreContextProvider from './store/score-context';

export default function App() {
  return (
    <ScoreContextProvider>
      <View style={styles.container}>
        <PoseDetectScreen />
        <StatusBar style="auto" />
      </View>
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
