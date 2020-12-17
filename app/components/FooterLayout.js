import React, { Component } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import COLORS from '../styles/color';

export default function FooterLayout({
    onPressDrawer,
    onPressHome,
    onPressNotification,
}) {

    return (
        <View style={{ width: '100%', height: 40, flexDirection: 'row', alignSelf: "center", position: 'absolute', bottom: 0, backgroundColor: COLORS.white, borderTopStartRadius: 25, borderTopEndRadius: 25, borderColor: COLORS.darkGrey, borderWidth: 0.5 }}>
            {/* <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}> */}
            <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }}
                onPress={onPressDrawer}>
                <Image
                    style={{ height: 25, width: 20, alignSelf: 'center' }}
                    source={require('../images/ic_menu.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }}
                onPress={onPressHome}>
                <Image
                    style={{ height: 25, width: 20, alignSelf: 'center' }}
                    source={require('../images/ic_home.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }}
                onPress={onPressNotification}>
                <Image
                    style={{ height: 25, width: 25, alignSelf: 'center' }}
                    source={require('../images/ic_notification.png')} />
            </TouchableOpacity>
        </View>
    );
}

// HeaderLayout.propTypes = {
//     onPress: React.PropTypes.func.isRequired,
// };