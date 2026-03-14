import React,{useEffect} from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";

import TabNavigator from "./navigation/TabNavigator";
import { initDB } from "./database/db";

export default function App(){

  useEffect(()=>{
    initDB();
  },[]);

  return(
    <View style={styles.container}>
      <StatusBar style="light" />
      <NavigationContainer>
        <TabNavigator/>
      </NavigationContainer>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#110F19',
  },
});