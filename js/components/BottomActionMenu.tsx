import { observer } from 'mobx-react-lite';
import React, {Component} from 'react';
import {Text, View, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Appearance} from 'react-native';
import Modal from 'react-native-modal';

const BottomActionMenu = observer(({headerText, inputs, onPressCancel, isVisible, onSwipeComplete}) => {

    return (
      <Modal
        isVisible={isVisible}
        onSwipeComplete={onSwipeComplete}
        hideModalContentWhileAnimating
        useNativeDriver
        style={styles.modalContainer}
        onBackdropPress={onSwipeComplete}
        swipeDirection={['down']}
        propagateSwipe={false}>
          <View style={styles.modalBackground}>
            <View style={styles.safeAreaContainer}>
                <View style={{...styles.actionContainer, backgroundColor: 'rgb(30, 30, 30)'}}>
                    {!!headerText &&
                    <View style={styles.miniHeader}>
                        <Text style={{...styles.miniHeaderText, color: 'white'}}>{headerText || 'Select a Photo'}</Text>
                    </View>}
                    {inputs.map((item, index) => (
                    <TouchableOpacity disabled={item.disabled} key={`${index}:${item.text}`} activeOpacity={0.8} onPress={item.onPress} style={{...styles.actionButton, borderTopColor: 'black', borderTopWidth: !!headerText ? 1 : index === 0 ? 0 : 1}}>
                        <Text style={{...styles.actionText, opacity: item.opacity || 1, color: item.color || 'rgb(0, 122, 255)'}}>{item.text}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={onPressCancel} style={{...styles.cancelButton, backgroundColor: 'rgb(30, 30, 30)'}}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
          </View>
      </Modal>
    );
})

const styles = StyleSheet.create({

    modalContainer: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        alignSelf: 'center',
        alignContent: 'center',
        justifyContent: 'flex-end',
    },

    miniHeader: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    miniHeaderText: {
        fontSize: 11.5,
        color: 'rgb(120, 120, 120)'
    },

    modalHandleContainer: {
        width: Dimensions.get('window').width,
        justifyContent: 'center',
        top: 20,
        alignItems: 'center'
    },

    modalHandle: {
        height: 7,
        width: 80,
        marginBottom: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(220, 220, 220, 0.7)'
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    modalBackground: {
        paddingTop: 10,
        width: Dimensions.get('window').width,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
      },

      safeAreaContainer: {
          width: '94%',
          overflow: 'visible',
          marginBottom: 10
      },

      actionButton: {
          alignItems: 'center',
          height: 50,
          justifyContent: 'center',
          borderTopColor: 'rgb(240, 240, 240)',
          borderTopWidth: 1
      },

      actionText: {
          fontSize: 15,
      },

      cancelText: {
        fontSize: 15,
        color: 'rgb(0, 122, 255)',
        fontWeight: '600'
      },

      actionContainer: {
          backgroundColor: 'rgb(255, 255, 255)',
          borderRadius: 9
      },
      cancelButton: {
          alignItems: 'center',
          height: 44,
          backgroundColor: 'white',
          marginTop: 10,
          justifyContent: 'center',
          borderRadius: 8
      }
})

export default BottomActionMenu
