import React, { useState, useRef } from "react";
import {SafeAreaView} from 'react-native-safe-area-context';
import PhoneInput from './../../components/PhoneNumberInput'
import {View, Text, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import KeyboardNextButton from "../../components/KeyboardNextButton";
import { useStores } from "../../stores";

const PhoneInputScreen: React.FC = ({navigation}, props) => {
    const [formattedValue, setFormattedValue] = useState("");
    const [value, setValue] = useState("");
    const [isValid, setIsValid] = useState<boolean | undefined>(undefined)
    const phoneInput = useRef<PhoneInput>(null);
    const inputAccessoryViewID = 'uniqueID3';
    const [isLoading, setIsLoading] = useState(false)
    const {user} = useStores()

    const onPressNext = async () => {
        const checkValid = phoneInput.current?.isValidNumber(value);
        if (checkValid) {
            setIsValid(true)
            setIsLoading(true)
            const confirmation = await auth().signInWithPhoneNumber(formattedValue);
            user.setPhoneVerifToken(confirmation)
            setIsLoading(false)
            navigation.push('AuthPhoneValidation')
        } else {
            setIsValid(false)
            setIsLoading(false)
        } 

    }


    return (
      <SafeAreaView style={{backgroundColor: 'black', flex: 1}}>
        <Text style={{color: 'white', fontSize: 27, fontWeight: 'bold', marginTop: 30, marginLeft: 30}}>Quel est ton numéro de téléphone ?</Text>
        <View style={{marginLeft: 30, marginTop: 30}}>
        <PhoneInput autoFocus inputAccessoryViewID={inputAccessoryViewID} withDarkTheme defaultCode="FR" ref={phoneInput} onChangeFormattedText={(text) => {setFormattedValue(text);}} onChangeText={(text) => {setValue(text);}}/>
        </View>
        {typeof isValid !== 'undefined' && !isValid ?
        <Text style={{color: 'red', marginLeft: 30, marginTop: 13}}>Numéro de téléphone non valide</Text> : null}
        <KeyboardNextButton isLoading={isLoading} inputAccessoryViewID={inputAccessoryViewID} onPress={onPressNext} />
      </SafeAreaView>
    );
  }

export default PhoneInputScreen