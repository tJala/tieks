import React, { useState, useRef } from "react";
import {SafeAreaView} from 'react-native-safe-area-context';
import PhoneInput from './../../components/PhoneNumberInput'
import {View, Text, Alert, TextInput, Keyboard, KeyboardAvoidingView, InputAccessoryView, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'
import { observer } from "mobx-react-lite";
import { useStores } from "../../stores";
import colors from "../../theme/colors";
import KeyboardNextButton from "../../components/KeyboardNextButton";

const PhoneValidationScreen: React.FC = observer(({route, navigation}) => {
    const [code, setCode] = useState('');
    const [isValid, setIsValid] = useState<boolean | undefined>(undefined)
    const {user} = useStores()
    const confirmation = user.phoneVerifToken
    const inputAccessoryViewID = 'uniqueID2';
    const [isLoading, setIsLoading] = useState(false)

    const onPressValidate = async () => {
        setIsLoading(true)
        try {
            await confirmation.confirm(code);
          } catch (error) {
            setIsValid(false)
            setIsLoading(false)
            return
          }
        
          try {

            const userAccount = await firestore().collection('users').doc(auth().currentUser?.uid).get()

            if (!userAccount.exists) {
                await firestore().collection('users').doc(auth().currentUser?.uid).set({userId: auth().currentUser?.uid, phoneNumber: auth().currentUser?.phoneNumber, friends: [], friendsRequests: [], status: 'offline', pushToken: ''})
            }

            if (auth().currentUser?.displayName) {
                user.setUsername(auth().currentUser?.displayName)
                user.setProfilePicture(auth().currentUser?.photoURL || '')
            } else {
                setIsLoading(false)
                navigation.navigate('AuthChooseUsername')
            }
          } catch(error) {
              Alert.alert('Something went wrong. Please check your internet connection and try again')
              setIsLoading(false)
          }
    }


    return (
      <SafeAreaView style={{backgroundColor: 'black', flex: 1}}>
        <Text style={{fontSize: 27, fontWeight: 'bold', marginTop: 30, marginLeft: 30, color: 'white'}}>Entre le code que tu as reçu par SMS</Text>
        <View style={{marginLeft: 30, marginTop: 30}}>
        <TextInput autoCompleteType='off' autoCorrect={false} inputAccessoryViewID={inputAccessoryViewID} autoFocus onChangeText={(text) => setCode(text)} keyboardType='number-pad' style={{fontSize: 25, color: 'white', height: 50, backgroundColor: 'rgb(30, 30, 30)', width: '90%', paddingHorizontal: 15, fontWeight: '600', borderRadius: 5}}/>
        </View>
        {typeof isValid !== 'undefined' && !isValid ?
        <Text style={{color: 'red', marginLeft: 30, marginTop: 13}}>Code non valide</Text> : null}
        <KeyboardNextButton isLoading={isLoading} inputAccessoryViewID={inputAccessoryViewID} onPress={onPressValidate} />
      </SafeAreaView>
    );
  })

export default PhoneValidationScreen