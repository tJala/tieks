import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, FlatList, Linking, Dimensions, AppState, Platform } from 'react-native';
import Modal from "react-native-modal";
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth';
import { observer } from "mobx-react-lite"
import {useStores} from '../stores';
import { fetchUserListByIds, getOnlineFriends } from "../utils/getters";
import { addDays, differenceDatesMinutes, getDateString } from "../utils/dates";
import { useNavigation } from "@react-navigation/native";
import colors from "../theme/colors";
import isEqual from 'lodash.isequal';
import { ListEmptyState, ListSeparator } from "../components/ListHelpers";
import BottomActionMenu from "../components/BottomActionMenu";
import { launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { storageLinkBuilder } from "../utils/storage";
import ProfilePicture from "../components/ProfilePicture";
import messaging from '@react-native-firebase/messaging';
import {firebase} from '@react-native-firebase/app';
import Share from 'react-native-share';
import '@react-native-firebase/functions'
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { getUserLocation } from "../utils/geolocation";

interface SocialShareIcon {
    icon: string, 
    color: string,
    channel: string
}

export const HomeScreen = observer(() => {
    const [isGoOnlineLoading, setIsGoOnlineLoading] = useState(false)
    const [isMessageModal, setIsMessageModal] = useState(false)
    const [isProfileOptionsMenu, setIsProfileOptionsMenu] = useState(false)
    const appState = useRef(AppState.currentState);
    const navigation = useNavigation()
    const {user} = useStores();
    const isOnline = user.status === 'online'
    const onlineFriendsList = user.onlineFriends
    let subscriberOnlineFriends: () => void = () => null
    let subscriberReceivedWaves: () => void = () => null
    let subscriberSentWaves: () => void = () => null

    const getStatusResetTime = () => {
            let resetTime = new Date()
            console.log(resetTime.toString())
            if (resetTime.getHours() < 3) {
              resetTime.setHours(3, 0, 0, 0)
            } else {
              /* reset time is next day at 3am */
              resetTime = addDays(resetTime, 1)
              resetTime.setHours(3, 0, 0, 0)
            }

            const statusResetFireDate = differenceDatesMinutes(new Date(), resetTime)*60
            return statusResetFireDate
    }

    const askForNotifAccess = async () => {

        let notifStatus = await messaging().hasPermission();

        if (notifStatus === messaging.AuthorizationStatus.NOT_DETERMINED || notifStatus === messaging.AuthorizationStatus.PROVISIONAL) {
            let authStatus = await messaging().requestPermission();
            const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED
        
          if (enabled) {
            let userId = auth().currentUser?.uid
            try {
              messaging().getToken().then((FCMtoken) => {
                firestore().collection('users').doc(userId).update({pushToken: FCMtoken}).then(() => {
                  user.setPushToken(FCMtoken)
                  })
              })
      
            } catch(e) {
              console.log(e)
            }
          } 
        }
      }

    const checkPushToken = async () => {
        let notifStatus = await messaging().hasPermission();
    
        if (notifStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          let cachedToken = user.pushToken;
          let FCMtoken = await messaging().getToken();
            let userId = auth().currentUser?.uid;
            if (cachedToken !== FCMtoken) {
              try {
                firestore()
                  .collection('users')
                  .doc(userId)
                  .update({pushToken: FCMtoken})
                  .then(() => {
                    user.setPushToken(FCMtoken);
                  });
              } catch (e) {
                console.log(e)
              }
            }
        }
      };

    const openImageLibrary = async () => {
        let userId = auth().currentUser?.uid;
        let options = {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.6,
        };
        launchImageLibrary(options, (response) => {
          if (response.didCancel) {
            // Nothing
          } else if (response.errorCode) {
            Alert.alert('error : ' + response.error);
          } else {
            const {uri} = response.assets[0];
            const uploadUri =
              Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            let ref = storage().ref(`users/${userId}`);
            return ref
              .putFile(uploadUri)
              .then(async () => {
                let photoURL = await ref.getDownloadURL();
                auth().currentUser?.updateProfile({photoURL: photoURL});
                let picStorageURI = storageLinkBuilder(
                  'users',
                  auth().currentUser?.uid,
                  Math.random(),
                );
                user.setProfilePicture(picStorageURI)
              })
              .catch((error) =>
                Alert.alert(
                  'Error. Please check your internet connection and try again.',
                ),
              );
          }
        });
      }

    const shouldUpdateFriendsList = (fresh: string[], cached: string[]) => {
        if (!isEqual(fresh, cached)) {
            fetchUserListByIds(fresh).then((friendsList) => {
                user.hydrateFriends(fresh, friendsList)
            })
        }
    }

    const shouldUpdateFriendsRequests = (fresh: string[], cached: string[]) => {
        if (!isEqual(fresh, cached)) {
            fetchUserListByIds(fresh).then((friendsRequests) => {
                user.hydrateFriendsRequests(fresh, friendsRequests)
            })

            if (fresh.length > cached.length) {
                user.setNewFriendsRequestIndicator()
            }
        }
    }

    const shouldUpdateStatus = (fresh: string, cached: string, location: string) => {
        if (!isEqual(fresh, cached)) {
           if (fresh === 'online') {
                user.goOnline()
                user.setOnlineLocation(location) 
           } else if (fresh === 'offline') {
               user.goOffline()
           }
        }
    }

    const listenToMeUpdate = () => {
        let userId = auth().currentUser?.uid;

        const subscriberUser = firestore().collection('users').doc(userId).onSnapshot(querySnapshot => {
            const meData = querySnapshot.data()
            const freshFriendsIds = meData?.friends
            const cachedFriendsIds = user.friendsIds

            const freshFriendsRequestsIds = meData?.friendsRequests
            const cachedFriendsRequestsIds = user.friendsRequestsIds 

            const freshStatus = meData?.status
            const cachedStatus = user.status
            const freshLocation = meData?.onlineLocation

            shouldUpdateFriendsList(freshFriendsIds, cachedFriendsIds)
            shouldUpdateFriendsRequests(freshFriendsRequestsIds, cachedFriendsRequestsIds)
            shouldUpdateStatus(freshStatus, cachedStatus, freshLocation) 
            
    })

    return subscriberUser

    }

    const listenToOnlineFriendsUpdate = () => {
        const subscriberOnlineFriends = firestore().collection('users').where('friends', 'array-contains', auth().currentUser?.uid).where('status', '==', 'online').onSnapshot(querySnapshot => {
            const onlineFriendsRaw = querySnapshot.docs
            let onlineFriends = onlineFriendsRaw.map((item) => item.data())
            onlineFriends = onlineFriends.map(({friends, ...keepAttrs}) => keepAttrs)
            user.hydrateOnlineFriends(onlineFriends)
        })

        return subscriberOnlineFriends
    }

    const listenToReceivedWavesUpdate = () => {
      const date = getDateString(new Date())
      const subscriberReceivedWaves = firestore().collection('waves').where('receiverId', '==', auth().currentUser?.uid).where('date', '==', date).onSnapshot(querySnapshot => {
          const receivedWavesRaw = querySnapshot.docs
          let receivedWaves = receivedWavesRaw.map((item) => item.data())
          receivedWaves = receivedWaves.map((item) => item.senderId)
          console.log(receivedWaves)
          user.hydrateReceivedWaves(receivedWaves)
      })

      return subscriberReceivedWaves
  }

  const listenToSentWavesUpdate = () => {
    const date = getDateString(new Date())
    const subscriberSentWaves = firestore().collection('waves').where('senderId', '==', auth().currentUser?.uid).where('date', '==', date).onSnapshot(querySnapshot => {
        const sentWavesRaw = querySnapshot.docs
        let sentWaves = sentWavesRaw.map((item) => item.data())
        sentWaves = sentWaves.map((item) => item.receiverId)
        user.hydrateSentWaves(sentWaves) 
    })

    return subscriberSentWaves
}

    useEffect(() => {
/*         const location = await Geocoder.from(coordinates) */

        askForNotifAccess()
        checkPushToken()
        const subscriberMeData = listenToMeUpdate()
    
        return () => {
          subscriberMeData()
        };
      }, []);

    const onPressUserItem = () => {
        setIsMessageModal(true)
    }

    const fetchOnlineFriends = async (): Promise<void> => {
        const onlineFriends = await getOnlineFriends()
        user.hydrateOnlineFriends(onlineFriends)
    }

    const onWaveUser = async (userId: string): Promise<void> => {

        const wave = {
            senderId: auth().currentUser?.uid,
            receiverId: userId,
            timestamp: new Date(),
            date: getDateString(new Date())
        }

        try {
          await firestore().collection('waves').add(wave)
        } catch(e) {
          Alert.alert('Something went wrong. Please check your intenret connection and try again.')
          return
        }

        const payload = {
          receiverId: userId,
          senderUsername: auth().currentUser?.displayName
        }

        firebase.app().functions('europe-west1').httpsCallable('onWaveUser')(payload);

    }

  const renderWaveIcon = (userId: string) => {
      if (userId === auth().currentUser?.uid) {
        return null
      }

      if (user.sentWaves.includes(userId) && user.receivedWaves.includes(userId)) {
        return <TouchableOpacity onPress={() => Alert.alert('You both 👋 at each other. Time to hang out!')} style={{borderWidth: 2, borderColor: '#473e0c', borderRadius: 100, height: 40, width: 40, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 10, alignSelf: 'center'}}>
        <Text>🤝</Text>
      </TouchableOpacity>
      } else {
        return <TouchableOpacity disabled={user.sentWaves.includes(userId)} onPress={() => onWaveUser(userId)} style={{borderWidth: 2, borderColor: user.sentWaves.includes(userId) ? 'rgb(30, 30, 30)' : 'rgb(60, 60, 60)', borderRadius: 100, height: 40, width: 40, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 10, alignSelf: 'center'}}>
        <Text style={{opacity: user.sentWaves.includes(userId) ? 0.5 : 1}}>👋</Text>
      </TouchableOpacity>
      }
  }

  const renderOnlineUserItem = ({item, index}) => {
    return <TouchableOpacity onPress={onPressUserItem} style={{alignItems: 'center', height: 60, flexDirection: 'row', width: '95%', alignSelf: 'center'}}>
        <ProfilePicture userId={item.userId} size={30} placeHolderIconStyle='Light'/>
        <View style={{marginLeft: 17}}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '600'}}>{item.username}</Text>
        {!!item.onlineLocation &&
        <Text style={{color:'rgb(160, 160, 160)'}}>{item.onlineLocation}</Text>}
        </View>
        {renderWaveIcon(item.userId)}
    </TouchableOpacity>
  }

  const openShareApp = (channel: string) => {
    Linking.openURL(`${channel}://app}`)
  }


  const SocialShareIcon = ({icon, color, channel}: SocialShareIcon) => {
    return <TouchableOpacity onPress={() => openShareApp(channel)} style={{height: 75, backgroundColor: color, width: 75, borderRadius: 20, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white', fontSize: 40, fontFamily: 'FontAwesome6Brands-Regular'}}>{icon}</Text>
    </TouchableOpacity>
  }

  const _toFriendsScreen = () => {
    navigation.navigate("FriendsScreen")
  }

  const goOnline = async () => {

    setIsGoOnlineLoading(true)

    subscriberOnlineFriends = listenToOnlineFriendsUpdate()
    subscriberReceivedWaves = listenToReceivedWavesUpdate()
    subscriberSentWaves = listenToSentWavesUpdate()

    const locationPermission = await Geolocation.requestAuthorization('whenInUse')
    let userLocationString = ''

    if ((locationPermission === 'disabled' ||  locationPermission === 'denied') && user.preferences.shouldShowPositionErrorMessage) {
      Alert.alert("Nous n'avons pas pu récuperer votre position", '', [{text: 'Activer dans paramètres', onPress: () => Linking.openSettings()}, {text: 'Ne plus afficher', onPress: () => user.setPreferences('shouldShowPositionErrorMessage', false), style: 'destructive'}])
    } else if (locationPermission === 'granted') {
      try {
        Geocoder.init("AIzaSyC876HcgcMt4bgPYAODKNDlbm8lLmiOkOg"); 
        const coordinates = await getUserLocation()
        const userLocationObject = await Geocoder.from(coordinates)
        userLocationString = `${userLocationObject.results[0].address_components[2].long_name}, ${userLocationObject.results[0].address_components[5].short_name}`;
      } catch(e) {
        console.log(e)
      }
    }

      try {
          await firestore().collection('users').doc(auth().currentUser?.uid).update({status: 'online', onlineLocation: userLocationString}) 
      } catch(e) {
          Alert.alert('Something went wrong. Please check your internet connection and try again')
      }

      setIsGoOnlineLoading(false)
      setIsProfileOptionsMenu(false)

      const payload = {
        username: auth().currentUser?.displayName,
        userId: auth().currentUser?.uid,
        fireDate: getStatusResetTime()
      }

     try {
        firebase.app().functions('europe-west1').httpsCallable('onGoOnline')(payload);
      } catch (e) {
        console.log(e)
      } 
  }

  const onCloseProfileMenu = () => {
    setIsProfileOptionsMenu(false)
  }

  const signOut = () => {
    auth()
    .signOut()
    .then(() => user.reset());
  }

  const goOffline = async () => {
    try {
        await firestore().collection('users').doc(auth().currentUser?.uid).update({status: 'offline'})
        subscriberOnlineFriends()
        subscriberSentWaves()
        subscriberReceivedWaves() 
        setIsProfileOptionsMenu(false)
    } catch(e) {
        Alert.alert('Something went wrong. Please check your internet connection and try again')
    }
  }

  const changeProfilePic = () => {
    openImageLibrary()
  }

  const inviteExternalFriends = () => {
    const options = {
        message: 'Télécharge cette app https://testflight.apple.com/join/s8Xe602l'
    }
    Share.open(options)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      err && console.log(err);
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>
    <BottomActionMenu onPressCancel={onCloseProfileMenu} onSwipeComplete={onCloseProfileMenu} inputs={[{onPress: changeProfilePic, text: 'Changer ma photo de profil'}, {onPress: isOnline ? goOffline : goOnline, text: isOnline ? 'Sortir du tieks' : 'Entrer dans le tieks'}, {onPress: inviteExternalFriends, text: 'Inviter des amis'}, {onPress: signOut, text: 'Se déconnecter', color: 'red'}]} isVisible={isProfileOptionsMenu} headerText={auth().currentUser?.displayName}/>
    <Modal onBackdropPress={() => setIsMessageModal(false)} isVisible={isMessageModal} onSwipeComplete={() => setIsMessageModal(false)}>
        <View style={{height: 220, backgroundColor: 'rgb(25, 25, 25)', position: 'absolute', bottom: 0, alignSelf: 'center', width: Dimensions.get('window').width, borderRadius: 30}}> 
            <Text style={{marginTop: 30, marginLeft: 30, color: 'white', fontWeight: '600', fontSize: 18, marginBottom: 30}}>Envoyer un message</Text>
            <View style={{flexDirection: 'row', width: '90%', alignSelf: 'center', justifyContent: 'space-between'}}>
            <SocialShareIcon channel='fb-messenger' color='#006AFF' icon='&#xf39f;'/>
            <SocialShareIcon channel='whatsapp' color='#25D366' icon='&#xf232;'/>
            <SocialShareIcon channel='snapchat' color='#FFB900' icon='&#xf2ac;'/>
            <SocialShareIcon channel='telegram' color='#0088cc' icon='&#xf3fe;'/>
            </View>
        </View>
    </Modal>
    <View style={{flex: 0.1, width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{color: 'white', marginLeft: 10, fontSize: 31, fontWeight: '800', alignSelf: 'center', fontFamily: 'EurostileExtended-Black'}}>TIEKS</Text>
        <View style={{alignSelf: 'center', marginRight: 20, flexDirection: 'row'}}>
            <TouchableOpacity onPress={_toFriendsScreen}>
                {user.isFriendsRequestIndicator &&
            <View style={{height: 15, width: 15, backgroundColor: 'black', position: 'absolute', borderRadius: 30, zIndex: 5, borderColor: 'black', top: -7, left: 11, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{height: 7, width: 7, backgroundColor: isOnline ? 'red': 'rgb(100, 100, 100)', position: 'absolute', borderRadius: 30, zIndex: 5, borderColor: 'black'}}/>
            </View>}
            <Text style={{color: 'white', fontSize: 23, fontFamily: 'FontAwesome6Pro-Regular', marginRight: 18}}>&#xf234;</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsProfileOptionsMenu(true)}>
{/*             <View style={{height: 15, width: 15, backgroundColor: 'black', position: 'absolute', borderRadius: 30, zIndex: 5, borderColor: 'black', bottom: -3, right: -7, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{height: 7, width: 7, backgroundColor: isOnline ? 'cyan': 'rgb(100, 100, 100)', position: 'absolute', borderRadius: 30, zIndex: 5, borderColor: 'black'}}/>
            </View> */}
            <ProfilePicture placeHolderIconStyle='Solid' userId={auth().currentUser?.uid} size={26}/>
            </TouchableOpacity>
        </View>
    </View>
    {isOnline ? 
    <View style={{ flexGrow: 1, width: '100%'}}>
        <Text onPress={fetchOnlineFriends} style={{color: 'white', marginTop: 20, marginLeft: 10, fontSize: 17, marginBottom: 20, fontWeight: '600'}}>Dans le tieks en ce moment</Text>
        <FlatList extraData={[user.sentWaves, user.receivedWaves]} ListEmptyComponent={<ListEmptyState text='Aucun amis dans le tieks 🥶 (invite tes potes stp)'/>} ItemSeparatorComponent={ListSeparator} contentContainerStyle={{marginLeft: 10}} renderItem={renderOnlineUserItem} data={[{userId: auth().currentUser?.uid, username: auth().currentUser?.displayName, onlineLocation: user.onlineLocation}, ...onlineFriendsList]}/>

    </View> : 
    <View style={{ flexGrow: 1, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
    <Text style={{color: 'rgb(220, 220, 220)', fontSize: 17, textAlign: 'center', marginBottom: 20, width: '85%'}}>Rentre dans le tieks pour voir tes amis</Text>
    <TouchableOpacity onPress={goOnline} activeOpacity={0.9} style={{backgroundColor: colors.cyan, marginBottom: 20, width: '75%', justifyContent: 'center', alignItems: 'center', height: 59, borderRadius: 50}}>
      {isGoOnlineLoading ? <ActivityIndicator color='white'/> : <Text style={{color: 'white', fontSize: 18, fontFamily: "EurostileExtended-Black"}}>J'suis dans le tieks</Text>}
    </TouchableOpacity>
    </View>}
    </SafeAreaView>
  );
})

export default HomeScreen