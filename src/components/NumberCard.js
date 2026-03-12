import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NumberCard = () => {
  return (
    <View style={styles.container}>
      <Text>NumberCard Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

export default NumberCard;
