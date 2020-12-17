import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Linking, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import MESSAGE from '../values/message';
import GLOBALSTYLE from '../values/style';
import { NativeModules } from 'react-native';
import LABEL from '../values/label';
import CountDown from 'react-native-countdown-component';
import { STRING, url } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
import { FlatList } from 'react-native-gesture-handler';
import { getMessage } from '../util/Util';

var db;
var ServiceModule = NativeModules.ServiceModule;

class LanguageChooserActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            languages: [],
            isLanguageAvailable: true,
        };
    }

    componentDidMount() {
        this.getLanguageAPI();
    }

    async getLanguageAPI() {
        this.setState({
            isLoading: true
        });

        console.log(await url(STRING.baseURL) + STRING.getLanguages);
        return fetch(await url(STRING.baseURL) + STRING.getLanguages, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then(response => {
                const statusCode = response.status;
                const data = response.json();
                return Promise.all([statusCode, data]);
            })
            .then(([statusCode, responseJson]) => {
                if (responseJson.length > 0) {
                    this.setState({
                        languages: responseJson,
                        isLanguageAvailable: true,
                        isLoading: false,
                    });
                } else {
                    this.setState({
                        isLanguageAvailable: false,
                        isLoading: false,
                    });
                }
            })
            .catch((error) => {
            });
    }

    async openLanguage(item) {
        await AsyncStorage.setItem(STRING.LANGUAGEID, item.languageId);

        this.props.navigation.replace('loginActivity')
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
                        style={{ width: 100, height: 100, alignSelf: "center" }}
                        source={require('../images/img_mid2.png')}
                    />
                </View>

                <View style={{ position: 'absolute', bottom: 0, height: '35%', alignSelf: 'center', width: '100%' }}>
                    {this.state.isLanguageAvailable ?
                        <View style={{ width: '100%' }}>
                            <Text style={{ fontSize: 15, color: COLORS.black, width: '100%', position: 'absolute', textAlign: 'center', justifyContent: 'center' }} numberOfLines={1}>{LABEL.beforeLogin2}</Text>

                            {this.state.isLoading
                                ?
                                <View style={{ marginTop: 20 }}>
                                    <ActivityIndicator size="small" style={{ marginTop: 20 }} />
                                </View>
                                :
                                <FlatList
                                    data={this.state.languages}
                                    style={{ alignSelf: 'center', height: '100%', marginTop: 20 }}
                                    renderItem={({ item, index }) => (
                                        <View style={{ padding: 8 }}>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={{ justifyContent: 'center', alignItems: 'center', height: 40, width: 120, borderRadius: 5, marginTop: 8, backgroundColor: COLORS.white }}
                                                onPress={() => this.openLanguage(item)}>
                                                <Text style={{ color: COLORS.black, width: '100%', position: 'absolute', textAlign: 'center', justifyContent: 'center' }} numberOfLines={1}>{item.languageName}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            }
                        </View>
                        :
                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noLanguage, this.state.langId)}</Text>
                    }
                </View>
            </View >
        )
    }
}

export default LanguageChooserActivity