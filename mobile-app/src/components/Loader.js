import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Loader = ({ size = 'large', color = '#00488d' }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default Loader;
