import React,{useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";

import TabNavigator from "./navigation/TabNavigator";
import { initDB } from "./database/db";

export default function App(){

  useEffect(()=>{
    initDB();
  },[]);

  return(

    <NavigationContainer>
      <TabNavigator/>
    </NavigationContainer>

  );

}