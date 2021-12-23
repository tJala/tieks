import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export const getOnlineFriends = async (): Promise<FirebaseFirestoreTypes.DocumentData[]> => {
    const userId = auth().currentUser?.uid
    try {
        let onlineFriendsRaw = await firestore().collection('users').where('friends', 'array-contains', userId).where('status', '==', 'online').get()
        let onlineFriends = onlineFriendsRaw.docs.map((item) => item.data())

        /* Remove the friends property */
        onlineFriends = onlineFriends.map(({friends, ...keepAttrs}) => keepAttrs)
        return onlineFriends
    } catch(e) {
        Alert.alert("Couldn't find friends in the tieks. Please check your internet connection and try again")
        return []
    }
}

export async function fetchUserListByIds(userIds: string[]): Promise<FirebaseFirestoreTypes.DocumentData[]> {
    return await new Promise(async (resolve, reject) => {
      try {
        let usersList = [];
        let usersListPromises = [];
        var i,
          j,
          temparray,
          chunk = 10;
        let usersIdsCopy = userIds;

        let usersIdsSliced: string[][] = [];
  
        /* Slice our list of Ids into a list of list, with each sub list being max 10 items */
        for (i = 0, j = usersIdsCopy.length; i < j; i += chunk) {
          temparray = usersIdsCopy.slice(i, i + chunk);
          usersIdsSliced = [...usersIdsSliced, temparray];
        }
  
        /* Fetch each sub list */
        for (let usersIdsChunk of usersIdsSliced) {
          usersListPromises.push(
            firestore()
              .collection('users')
              .where('userId', 'in', usersIdsChunk)
              .get(),
          );
        }
  
        let usersListRaw = await Promise.all(usersListPromises);
  
        for (let usersListRawChunk of usersListRaw) {
          for (let userItemRaw of usersListRawChunk.docs) {
            usersList.push({
              username: userItemRaw.data().username,
              userId: userItemRaw.id,
            });
          }
        }
        
        resolve(usersList)
      } catch (e) {
        reject(e)
      }
    });
  }


  export async function fetchUserListByPhoneNumbers(phoneNumbers: string[]): Promise<FirebaseFirestoreTypes.DocumentData[]> {
    return await new Promise(async (resolve, reject) => {
      try {
        let usersList = [];
        let usersListPromises = [];
        var i,
          j,
          temparray,
          chunk = 10;
        let usersIdsCopy = phoneNumbers;

        let usersIdsSliced: string[][] = [];
  
        /* Slice our list of Ids into a list of list, with each sub list being max 10 items */
        for (i = 0, j = usersIdsCopy.length; i < j; i += chunk) {
          temparray = usersIdsCopy.slice(i, i + chunk);
          usersIdsSliced = [...usersIdsSliced, temparray];
        }
  
        /* Fetch each sub list */
        for (let usersIdsChunk of usersIdsSliced) {
          usersListPromises.push(
            firestore()
              .collection('users')
              .where('phoneNumber', 'in', usersIdsChunk)
              .get(),
          );
        }
  
        let usersListRaw = await Promise.all(usersListPromises);
  
        for (let usersListRawChunk of usersListRaw) {
          for (let userItemRaw of usersListRawChunk.docs) {
            usersList.push({
              username: userItemRaw.data().username,
              userId: userItemRaw.id,
            });
          }
        }
        
        resolve(usersList)
      } catch (e) {
        reject(e)
      }
    });
  }