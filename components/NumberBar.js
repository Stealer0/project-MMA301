import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NumberBar({ number, count, max }) {
  const widthPercent = (count / max) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.number}>
        {number.toString().padStart(2, '0')}
      </Text>

      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${widthPercent}%` }
          ]}
        />
      </View>

      <Text style={styles.count}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  number: {
    width: 32,
    fontSize: 16,
    color: '#CB9F42',
    fontWeight: 'bold',
  },
  barBackground: {
    flex: 1,
    height: 12,
    backgroundColor: "#1B1924",
    borderRadius: 6,
    marginHorizontal: 12,
  },
  barFill: {
    height: 12,
    backgroundColor: "#A88028",
    borderRadius: 6,
  },
  count: {
    width: 30,
    textAlign: "right",
    color: "#A09EAD",
    fontSize: 14,
  }
});