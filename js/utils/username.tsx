import { Alert } from "react-native";
import firestore from '@react-native-firebase/firestore'

export const isUsernameValid = (username: string) => {
        var re = /^[-\w\.]{2,25}$/;
       if (re.test(username)) {
           return true
       } else {
/*         Alert.alert('Username is not valid. Your username must only contain letters, numbers, periods, underscores and be between 2 and 25 characters.') */
           return false
       }
    }

export const isUsernameAvailable = async (username: string) => {
        /* check if username format is valid */
      try {
       let usernameCheck = await firestore().collection('users').where('username', '==', username).get()
       if (usernameCheck.empty) {
              return true
          } else {
              Alert.alert('Username already taken. Please choose another username.')
              return false
          }
      } catch(e) {
        console.log(e)
        Alert.alert('Error creating your username. Please check your internet connection and try again.')
        return false
      }
   }