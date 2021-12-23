import React, { useRef, useState, useEffect } from "react";
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthPhoneInput from './js/screens/Auth/PhoneInputScreen'
import AuthPhoneValidation from './js/screens/Auth/PhoneValidationScreen'
import AuthChooseUsername from './js/screens/Auth/ChooseUsernameScreen'
import HomeScreen from './js/screens/Home'
import auth from '@react-native-firebase/auth';
import { Alert, AppState } from 'react-native';
import {hydrateStores, useStores} from './js/stores';
import { addDays } from "./js/utils/dates";
import { FriendsScreen } from "./js/screens/Friends";
import { observer } from "mobx-react-lite";

const Stack = createNativeStackNavigator();

export const start = async (): Promise<React.ReactElement> => {
  // 1. hydrate stores
  await hydrateStores();

  return <App/>
};

const App = observer(() => {
  const {user} = useStores()

  return (
    <NavigationContainer>
      {user.username ? 
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={"Home"}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
      </Stack.Navigator>

      : 

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="AuthPhoneInput">
        <Stack.Screen name="AuthPhoneInput" component={AuthPhoneInput} />
        <Stack.Screen name="AuthPhoneValidation" component={AuthPhoneValidation} />
        <Stack.Screen name="AuthChooseUsername" component={AuthChooseUsername} />
      </Stack.Navigator>}
    </NavigationContainer>
  );
})

export default App;
