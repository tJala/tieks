import React, {Component} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image'
import auth from '@react-native-firebase/auth'
import { storageLinkBuilder } from '../utils/storage';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';

const ProfilePicture = observer(({size = 10, userId, placeHolderIconStyle = 'Solid'}) => {
      const {user} = useStores()
        return (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white', fontSize: size, fontFamily: `FontAwesome6Pro-${placeHolderIconStyle}`, position: 'absolute'}}>&#xf2bd;</Text>
              {userId === auth().currentUser?.uid ?
            <FastImage
              style={{height: 1.02*size, width: 1.02*size, borderRadius: 1.02*size/2}}
              source={{uri: user.profilePictureURI, cache: FastImage.cacheControl.web}}
              resizeMode="cover"
            /> :
            <FastImage
            style={{height: 1.02*size, width: 1.02*size, borderRadius: 1.02*size/2, justifyContent: 'center', alignItems: 'center'}}
            source={{uri: storageLinkBuilder('users', userId), cache: FastImage.cacheControl.web}}
            resizeMode="cover"
              />}
          </View>
        );
})


export default ProfilePicture;
