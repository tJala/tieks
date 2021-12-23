import React, { useState, useRef } from "react";
import {SafeAreaView} from 'react-native-safe-area-context';
import PhoneInput from './../../components/PhoneNumberInput'
import {View, Text, Alert, TextInput} from 'react-native';
import auth from '@react-native-firebase/auth';
import { isUsernameAvailable, isUsernameValid } from "../../utils/username";
import firestore from '@react-native-firebase/firestore'
import { useStores } from "../../stores";
import KeyboardNextButton from "../../components/KeyboardNextButton";

const ChooseUsernameScreen: React.FC = ({route, navigation}) => {
    const [username, setUsername] = useState('');
    const [isValid, setIsValid] = useState<boolean | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const {user} = useStores()
    const inputAccessoryViewID = 'uniqueID5';

    const onPressValidate = async () => {
        if (isUsernameValid(username)) {
            setIsLoading(true)
            const isAvailable = await isUsernameAvailable(username) 
            if (isAvailable) {
            
            try {
                auth().currentUser?.updateProfile({displayName: username})
                await firestore().collection('users').doc(auth().currentUser?.uid).update({username: username})
                user.setUsername(username)
                setIsLoading(false)
            } catch(e) {
                Alert.alert('Something went wrong. Please check your internet connection and try again.')
                setIsLoading(false)
            }

            }
        } else {
            setIsValid(false)
        }
    }


    return (
      <SafeAreaView style={{backgroundColor: 'black', flex: 1}}>
        <Text style={{color: 'white', fontSize: 27, fontWeight: 'bold', marginTop: 30, width: '88%', alignSelf: 'center'}}>Choisis un nom d'utilisateur</Text>
        <Text style={{color: 'rgb(200, 200, 200)', width: '88%', alignSelf: 'center', marginTop: 30}}>(pas de dinguerie sinon jte ban)</Text>
        <View style={{width: '88%', alignSelf: 'center', marginTop: 30}}>
        <TextInput placeholder='ex: el.tigre' autoCapitalize='none' autoCompleteType='off' autoCorrect={false} inputAccessoryViewID={inputAccessoryViewID} autoFocus onChangeText={(text) => setUsername(text.toLowerCase())} style={{fontSize: 25, color: 'white', height: 50, backgroundColor: 'rgb(30, 30, 30)', width: '100%', paddingHorizontal: 15, fontWeight: '600', borderRadius: 5}}/>
        </View>
        {typeof isValid !== 'undefined' && !isValid ?
        <Text style={{color: 'red', width: '88%', alignSelf: 'center', marginTop: 13}}>Nom d'utilisateur non valide. Fais un effort stp</Text> : null}
        <KeyboardNextButton isLoading={isLoading} inputAccessoryViewID={inputAccessoryViewID} onPress={onPressValidate} />
      </SafeAreaView>
    );
  }

export default ChooseUsernameScreen