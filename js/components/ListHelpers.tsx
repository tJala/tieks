import React from "react";
import { View, Text } from 'react-native';

export const ListSeparator = () => {
    return <View style={{height: 0.5, width: '95%', backgroundColor: 'rgb(30, 30, 30)', alignSelf: 'center'}}/>
}

export const ListEmptyState = ({text}) => {
    return <Text style={{color: 'rgb(200, 200, 200)', alignSelf: 'center', marginTop: 30}}>{text}</Text>
}