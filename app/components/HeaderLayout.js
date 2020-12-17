import React, { Component } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'

export default function HeaderLayout({
    onPress,
}) {

    return (
        <View style={{ width: '100%', height: 40, flexDirection: 'row', padding: 10, marginTop: 10 }}>
            <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }} onPress={onPress}>
                <Image
                    style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                    source={require('../images/ic_back_white.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }}>
                <Image
                    style={{ height: 35, width: 35, alignSelf: 'center' }}
                    source={require('../images/ic_pofile.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }}>
                <Image
                    style={{ height: 25, width: 20, alignSelf: 'flex-end' }}
                    source={require('../images/ic_notification.png')} />
            </TouchableOpacity>

        </View>
    );
}

// HeaderLayout.propTypes = {
//     onPress: React.PropTypes.func.isRequired,
// };