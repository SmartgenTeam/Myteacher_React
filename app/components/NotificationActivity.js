import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Linking, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import MESSAGE from '../values/message';

var db;
import { NativeModules } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import NotifService from '../util/NotifService';
import { getMessage, getValue } from '../util/Util';
import LABEL from '../values/label';
import { STRING } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';

class NotificationActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();

        this.notif = new NotifService(
            null,
            this.onNotif.bind(this),
        );

        this.state = {
            isNotificationsAvailable: false,
            notifications: [],
        };
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
          }, () => {
            this.getNotificationData();
          });
    }

    getNotificationData() {
        db.getNotificationData(notification => {
            if (notification == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                let noti = [];
                for (let i = 0; i < notification.length; i++) {
                    noti[i] = {
                        title: notification.item(i).title,
                        data: notification.item(i).data,
                        date: notification.item(i).date,
                    }
                }
                this.setState({
                    notifications: noti,
                    isNotificationsAvailable: true,
                }, () => {
                });
            }
        });
    }

    onNotif(notif) {
        console.log('onNotification', notif);
        try {
            this.getNotificationData();
        } catch (error) {
            console.log(error);
        }
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

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
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 35, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >{getValue(LABEL.notification, this.state.langId)}</Text>

                <View style={{ alignSelf: 'center', marginTop: 130, position: 'absolute', width: '100%', height: '92%' }}>
                    {this.state.isNotificationsAvailable ?
                        <FlatList
                            data={this.state.notifications}
                            showsHorizontalScrollIndicator={false}
                            style={{ position: 'absolute', paddingBottom: 5, paddingTop: 5, width: '100%', height: '85%', alignSelf: 'center' }}
                            renderItem={({ item, index }) => (
                                <View style={{ alignSelf: 'center', marginTop: 8, marginBottom: 8, width: '80%', elevation: 4, backgroundColor: COLORS.white, borderRadius: 8, padding: 8 }}>
                                    <Text style={{ fontSize: 15, color: COLORS.black, fontWeight: 'bold', marginTop: 8 }} >{item.title}</Text>
                                    <Text style={{ fontSize: 14, color: COLORS.black, marginTop: 8 }} >{item.data}</Text>
                                    <Text style={{ fontSize: 12, color: COLORS.darkGrey, marginTop: 8, alignSelf: 'flex-end' }} >{item.date}</Text>
                                </View>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        :
                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noNotification, this.state.langId)}!</Text>
                    }
                </View>
            </View >
        )
    }
}

export default NotificationActivity