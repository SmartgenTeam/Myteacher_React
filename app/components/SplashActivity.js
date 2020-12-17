import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Linking, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import MESSAGE from '../values/message';

var db;
import { NativeModules } from 'react-native';
import LABEL from '../values/label';
import CountDown from 'react-native-countdown-component';
import { STRING } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
var ServiceModule = NativeModules.ServiceModule;

class SplashActivity extends Component {

    constructor(props) {
        super(props);
    }

    readConfigFile() {
        return fetch('https://step-up-content.s3.ap-south-1.amazonaws.com/com.smartgen.myteacher.txt', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': 0
            }
        })
            .then(response => {
                const statusCode = response.status;
                const data = response.json();
                return Promise.all([statusCode, data]);
            })
            .then(([statusCode, responseJson]) => {
                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    AsyncStorage.setItem(STRING.baseURL, responseJson.baseURL);
                    AsyncStorage.setItem(STRING.resourceBaseURL, responseJson.resourseBaseURL);
                    AsyncStorage.setItem(STRING.videoBaseURL, responseJson.contentBaseURL);
                    AsyncStorage.setItem(STRING.topicThumbBaseURL, responseJson.topicThumbBaseURL);

                    this.props.navigation.replace('languageChooserActivity');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />

                <View style={{ width: '100%', height: '100%', position: 'absolute', justifyContent: 'center' }}>
                    <Image
                        style={{ width: 150, height: 150, alignSelf: "center" }}
                        source={require('../images/img_mid1.png')}
                    />
                </View>

                <View style={{ width: '100%', height: 40, position: 'absolute', bottom: 150 }}>
                    <Text style={{ fontSize: 15, color: COLORS.orange, alignSelf: 'center', textAlignVertical: 'center', height: '100%' }} >{LABEL.beforeLogin1}</Text>
                </View>

                <CountDown
                    until={2}
                    onFinish={() => this.readConfigFile()}
                    running={true}
                />
            </View >
        )
    }
}

export default SplashActivity