import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Linking, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import MESSAGE from '../values/message';

var db;
import { NativeModules } from 'react-native';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
import { STRING } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
var ServiceModule = NativeModules.ServiceModule;

class ContactUsActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            langId: '',
        }
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    dialNumber(number) {
        Linking.openURL(`tel:${number}`)
    };

    launchBrowser(url) {
        Linking.openURL(url);
    }

    launchGMail() {
        Linking.openURL('mailto:' + getMessage(MESSAGE.emailID, this.state.langId) + '?subject=' + getMessage(MESSAGE.emailSubject, this.state.langId))
    }

    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                {/* <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding:12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 35, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >{getValue(LABEL.contactUs, this.state.langId)}</Text>

                <View style={{ alignSelf: 'center', marginTop: 200, position: 'absolute', width: '80%' }}>
                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                style={{ width: 20, height: 20, marginEnd: 15 }}
                                source={require('../images/ic_phone.png')} />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => this.dialNumber(getMessage(MESSAGE.number1, this.state.langId))}>
                                <Text style={{ color: COLORS.blue, textAlign: 'center', marginEnd: 5 }} numberOfLines={1}>{getMessage(MESSAGE.number1, this.state.langId)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => this.dialNumber(getMessage(MESSAGE.number2, this.state.langId))}>
                                <Text style={{ color: COLORS.blue, textAlign: 'center', marginStart: 5 }} numberOfLines={1}>{getMessage(MESSAGE.number2, this.state.langId)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                style={{ width: 20, height: 20, marginEnd: 15 }}
                                source={require('../images/ic_website.png')} />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => this.launchBrowser(getMessage(MESSAGE.webSite, this.state.langId))}>
                                <Text style={{ color: COLORS.blue, textAlign: 'center', marginEnd: 5 }} numberOfLines={1}>{getMessage(MESSAGE.webSite, this.state.langId)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                style={{ width: 20, height: 20, marginEnd: 15 }}
                                source={require('../images/ic_mail.png')} />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => this.launchGMail()}>
                                <Text style={{ color: COLORS.blue, textAlign: 'center', marginEnd: 5 }} numberOfLines={1}>{getMessage(MESSAGE.emailID, this.state.langId)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ width: '100%', height: 40, position: 'absolute', bottom: 0, backgroundColor: COLORS.blue }}>
                    <Text style={{ fontSize: 15, color: COLORS.white, alignSelf: 'center', textAlignVertical: 'center', height: '100%' }} >{'\u00A9'} SmartgenTechnologies Private Limited</Text>
                </View>
            </View >
        )
    }
}

export default ContactUsActivity