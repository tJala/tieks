import { observer } from 'mobx-react-lite';
import React, {Component} from 'react';
import {Text, View, TouchableOpacity, InputAccessoryView, ActivityIndicator} from 'react-native';
import Modal from 'react-native-modal';
import colors from '../theme/colors';

const KeyboardNextButton = observer(({inputAccessoryViewID, onPress, isLoading}) => {

    return (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={{width: '100%', alignItems: 'flex-end'}}>
            <TouchableOpacity disabled={isLoading} style={{marginRight: 20, marginBottom: 20, height: 60, width: 60, borderRadius: 70, backgroundColor: colors.cyan, justifyContent: 'center', alignItems: 'center'}} onPress={onPress}>
                {isLoading ? <ActivityIndicator color='white'/> : 
                <Text style={{color: 'white', fontSize: 27, fontFamily: 'FontAwesome6Pro-Solid'}}>&#xf061;</Text>}
            </TouchableOpacity>
            </View>
        </InputAccessoryView>
    );
})

export default KeyboardNextButton
