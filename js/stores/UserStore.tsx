import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { makeAutoObservable } from "mobx"
import { makePersistable, hydrateStore, configurePersistable } from 'mobx-persist-store';
import {MMKV} from 'react-native-mmkv';

const storage = new MMKV();

export default class UserStore {
    status: string = 'offline'
    username: string | null | undefined = ''
    lastOnlineDate: Date = new Date()
    onlineFriends: FirebaseFirestoreTypes.DocumentData[] = []
    profilePictureURI: string = ''
    friendsIds: string[] = []
    friends: FirebaseFirestoreTypes.DocumentData[] = []
    friendsRequestsIds: string[] = []
    friendsRequests: FirebaseFirestoreTypes.DocumentData[] = []
    pushToken: string | null | undefined = ''
    phoneVerifToken: any = {}
    isFriendsRequestIndicator: boolean = false
    onlineLocation: string = ''
    sentWaves: string[] = []
    receivedWaves: string[] = []
    preferences = {'shouldShowPositionErrorMessage': true}

    constructor() {
        makeAutoObservable(this)
        makePersistable(this, { name: 'UserStore', properties: ['username', 'onlineLocation', 'sentWaves', 'preferences', 'receivedWaves', 'isFriendsRequestIndicator', 'status', 'pushToken', 'onlineFriends', 'lastOnlineDate', 'profilePictureURI', 'friendsIds', 'friends', 'friendsRequestsIds', 'friendsRequests'], storage: {
            setItem: (key, data) => storage.set(key, data),
            getItem: key => storage.getString(key) as string | null,
            removeItem: key => storage.delete(key),
          },});
    }

    goOnline(): void {
        this.status = 'online'
        this.lastOnlineDate = new Date()
    }

    goOffline(): void {
        this.status = 'offline'
    }

    hydrateFriends(friendIds: string[], friends: FirebaseFirestoreTypes.DocumentData[]): void {
        this.friendsIds = friendIds
        this.friends = friends
    }

    hydrateFriendsRequests(friendIds: string[], friendsRequests: FirebaseFirestoreTypes.DocumentData[]): void {
        this.friendsRequestsIds = friendIds
        this.friendsRequests = friendsRequests
    }

    hydrateOnlineFriends(friends: FirebaseFirestoreTypes.DocumentData[]): void {
        this.onlineFriends = friends
    }

    setProfilePicture(uri: string): void {
        this.profilePictureURI = uri
    }

    hydrate = async (): Promise<void> => {
        await hydrateStore(this);
    };

    setPushToken = (pushToken: string) => {
        this.pushToken = pushToken
    }

    setUsername = (username: string | null | undefined) => {
        this.username = username
    }

    setPhoneVerifToken = (token: any) => {
        this.phoneVerifToken = token
    }

    setNewFriendsRequestIndicator = () => {
        this.isFriendsRequestIndicator = true
    }

    removeNewFriendsRequestIndicator = () => {
        this.isFriendsRequestIndicator = false
    }

    setOnlineLocation = (location: string) => {
        this.onlineLocation = location
    }

    hydrateSentWaves = (ids: any) => {
        this.sentWaves = ids
    }

    hydrateReceivedWaves = (ids: any) => {
        this.receivedWaves = ids
    }

    setPreferences = (key: string, preference: boolean) => {
        this.preferences = {...this.preferences, [key]: preference}
    }

    reset = () => {
        this.status = 'offline'
        this.username = ''
        this.lastOnlineDate = new Date()
        this.onlineFriends = []
        this.profilePictureURI = ''
        this.friendsIds = []
        this.friends = []
        this.friendsRequestsIds = []
        this.friendsRequests = []
    }
}