import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResultBox = () => {
  return (
    <View style={styles.container}>
      <Text>ResultBox Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
});

export default ResultBox;
