import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  StyleSheet,
} from 'react-native';

import PoseDetectScreen from './screens/main/PoseDetectScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <PoseDetectScreen />
      <StatusBar style="auto" />
    </View>
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
