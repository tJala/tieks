import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Keyboard, FlatList, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {observer} from 'mobx-react-lite';
import { useStores } from '../stores';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth';
import { ListEmptyState, ListSeparator } from '../components/ListHelpers';
import colors from '../theme/colors';
import ProfilePicture from '../components/ProfilePicture';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions'

export const FriendsScreen = observer(() => {
    const {user} = useStores();
    const navigation = useNavigation()
    const [searchString, setSearchString] = useState('')
    const [resultsList, setResultsList] = useState<FirebaseFirestoreTypes.DocumentData[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const friendsList = user.friends
    const friendsRequests = user.friendsRequests

    /* Need a way to check if already in friends list... based on fetched friends list in cache */

    const search = async () => {
        setIsSearching(true)
        const resultRaw = await firestore().collection('users').where('username', '==', searchString).get()
        setHasSearched(true)
        setIsSearching(false)
        if (resultRaw.docs.length) {
            const result = resultRaw.docs.map((item) => item.data())
            setResultsList(result)
        } else {
            setResultsList([])
        }
    }

    useEffect(() => {
        if (user.isFriendsRequestIndicator) {
            user.removeNewFriendsRequestIndicator()
        }
    }, [])

    const addFriend = async (userId: string): Promise<void> => {
        try {
            await firestore().collection('users').doc(userId).update({friendsRequests: firestore.FieldValue.arrayUnion(auth().currentUser?.uid)})
            Alert.alert("Demande d'amis envoyée!")
        } catch(e) {
            Alert.alert("Something went wrong. Please check your internet connection and try again")
        }

        const PNpayload = {
            requesterUsername: auth().currentUser?.displayName,
            receiverId: userId 
        }

        try {
            firebase
              .app()
              .functions('europe-west1')
              .httpsCallable('sendFriendRequestPN')(PNpayload);
          } catch (e) {
            console.log(e)
          }
    }

    const acceptFriendRequest = async (userId: string): Promise<void> => {
        const meId = auth().currentUser?.uid
        try {
            await firestore().collection('users').doc(meId).update({friendsRequests: firestore.FieldValue.arrayRemove(userId)})
            await firestore().collection('users').doc(meId).update({friends: firestore.FieldValue.arrayUnion(userId)})
            await firestore().collection('users').doc(userId).update({friends: firestore.FieldValue.arrayUnion(meId)})
        } catch(e) {
            Alert.alert("Something went wrong. Please check your internet connection and try again")
        }

        const PNpayload = {
            requesterId: userId,
            accepterUsername: auth().currentUser?.displayName
        }

        try {
            firebase
              .app()
              .functions('europe-west1')
              .httpsCallable('acceptFriendRequestPN')(PNpayload);
          } catch (e) {
            console.log(e)
          }
    }

    const rejectFriendRequest = async (userId: string): Promise<void> => {
        try {
            await firestore().collection('users').doc(auth().currentUser?.uid).update({friendsRequests: firestore.FieldValue.arrayRemove(userId)})
        } catch(e) {
            Alert.alert("Something went wrong. Please check your internet connection and try again")
        }
    }

    const onTryRemoveFriend = async (userId: string): Promise<void> => {
        try {
            await firestore().collection('users').doc(auth().currentUser?.uid).update({friends: firestore.FieldValue.arrayRemove(userId)})
            await firestore().collection('users').doc(userId).update({friends: firestore.FieldValue.arrayRemove(auth().currentUser?.uid)})
        } catch(e) {
            Alert.alert("Something went wrong. Please check your internet connection and try again")
        }
    }

/*     const removeFriend = async (userId: string): Promise<void> => {
        try {
            await firestore().collection('users').doc(auth().currentUser?.uid).update({friends: firestore.FieldValue.arrayRemove(userId)})
            await firestore().collection('users').doc(userId).update({friends: firestore.FieldValue.arrayRemove(auth().currentUser?.uid)})
        } catch(e) {
            Alert.alert("Something went wrong. Please check your internet connection and try again")
        }
    }
 */
    const renderUserItem = ({item}, mainButtonText: string, withCrossIcon: boolean = false, onPressMainButton: Function | null, onPressCross: Function | null) => {
        return (
            <View
              style={styles.friendItemContainer}>
              <View style={styles.friendItemBubble}>
                  <View style={{flexDirection: 'row'}}>
                <View style={styles.profilePictureContainer}>
                    <ProfilePicture placeHolderIconStyle='Light' userId={item.userId} size={27}/>
                </View>
                <View style={styles.friendNameContainer}>
                  <Text style={styles.friendItemText}>{item.username}</Text>
                </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {mainButtonText.length > 0 &&
                <TouchableOpacity onPress={() => onPressMainButton && onPressMainButton(item.userId)} style={{height: 37, width: 100, backgroundColor: colors.cyan, justifyContent: 'center', alignItems: 'center', borderRadius: 5}}>
                    <Text style={{color: 'white', fontWeight: '600'}}>{mainButtonText}</Text>
                </TouchableOpacity>}
                {withCrossIcon &&
                <TouchableOpacity hitSlop={{top: 5, bottom: 5, right: 5, left: 5}} style={{marginLeft: 25}} onPress={() => onPressCross && onPressCross(item.userId)}>
                    <Text style={{color: 'white', fontSize: 25, fontFamily: 'FontAwesome6Pro-Regular'}}>&#xf00d;</Text>
                </TouchableOpacity>}
                </View>
              </View>
            </View>
          );
    }

    const renderFriendRequest = () => {
        return null
    }

    return (
      <SafeAreaView onTouchStart={Keyboard.dismiss} style={{backgroundColor: 'black', flex: 1}}>
          <TouchableOpacity style={{width: 50}} hitSlop={{top: 10, bottom: 10, right: 10, left: 10}} onPress={() => navigation.goBack()}>
            <Text style={{fontFamily: 'FontAwesome6Pro-Regular', color: 'white', fontSize: 24, left: 22}}>&#xf053;</Text>
          </TouchableOpacity>
          <View style={{height: 50, width: '90%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgb(30, 30, 30)', marginTop: 20, borderRadius: 7}}>
           <Text style={{fontFamily: 'FontAwesome6Pro-Regular', color: 'white', fontSize: 17, left: 15}}>&#xf002;</Text>
          <TextInput returnKeyType='search' onSubmitEditing={() => search()} onChangeText={text => setSearchString(text)} autoCapitalize='none' autoCorrect={false} autoCompleteType='off' keyboardType='web-search' placeholder="Ajouter un amis par nom d'utilisateur..." placeholderTextColor='rgb(200, 200, 200)' style={{color: 'white', flex: 0.92, fontSize: 15, height: '100%', paddingRight: 15}}/>
          </View>

          {hasSearched && searchString.length > 0 ? 
            <FlatList ItemSeparatorComponent={ListSeparator} data={resultsList} renderItem={(item, index) => renderUserItem(item, 'Ajouter', false, addFriend, null)} ListEmptyComponent={<ListEmptyState text={'Aucun résultat'}/>} style={{top: 20}}/>
          : 
          <>
          <Text style={{color: 'white', fontWeight: '600', fontSize: 22, marginTop: 25, marginLeft: 20}}>Demandes d'amis</Text>
          <FlatList ItemSeparatorComponent={ListSeparator} data={friendsRequests} renderItem={(item, index) => renderUserItem(item, 'Accepter', true, acceptFriendRequest, rejectFriendRequest)} ListEmptyComponent={<ListEmptyState text={"Vos demandes d'amis apparaîtront ici"}/>} style={{flexGrow: 0}}/>
          <Text style={{color: 'white', fontWeight: '600', fontSize: 22, marginTop: 25, marginLeft: 20}}>Amis</Text>
          <FlatList ItemSeparatorComponent={ListSeparator} data={friendsList} renderItem={(item, index) => renderUserItem(item, '', true, null, onTryRemoveFriend)} ListEmptyComponent={<ListEmptyState text={"Vos amis apparaîtront ici"}/>} style={{flexGrow: 0}}/>
{/*           <Text style={{color: 'white', fontWeight: '600', fontSize: 22, marginTop: 25, marginLeft: 20}}>Suggestions</Text> */}
          </>}
      </SafeAreaView>
    );
  },
);

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    safeArea: {flex: 0.85, width: '84%'},
    friendItemText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17
    },

    addFriendIconBubble:{
        padding: 10,
        backgroundColor: 'rgb(240, 240, 240)',
        borderRadius: 50
    },

    friendItemContainer: {
        height: 68,
        justifyContent: 'center',
        alignItems: 'center',

    },

    friendItemBubble: {
        height: 60,
        flexDirection: 'row',
        width: '90%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    profilePictureContainer:{
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 17
    },

    friendNameContainer: {
        justifyContent: 'center'
    },
})

