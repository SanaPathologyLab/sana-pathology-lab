import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Logo = ({ size = 60 }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Text style={[styles.text, { fontSize: size * 0.35 }]}>SPL</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00488d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffb800',
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default Logo;
