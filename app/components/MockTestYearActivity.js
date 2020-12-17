import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import { DrawerActions } from "react-navigation-drawer";
import AsyncStorage from '@react-native-community/async-storage';

var db;

class MockTestYearActivity extends Component {

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            isLoading: false,
            subjects: [],
            isMockAvailable: true,
            boardName: this.props.navigation.getParam("boardName", ''),
            mockTestDetailSubjectList: this.props.navigation.getParam("mockTestDetailSubjectList", ''),
            shouldShowBackNav: false,
        };
    }

    componentDidMount() {
        if (this.state.mockTestDetailSubjectList.length > 0) {
            this.setState({
                isMockAvailable: true,
            })
        } else {
            this.setState({
                isMockAvailable: false,
            })
        }
    }

    async openPaper(item) {
        await AsyncStorage.setItem(STRING.CHAPTERID, item.subjectId);
        await AsyncStorage.setItem(STRING.CHAPTERNAME, item.subjectName);

        db.isMataDataExist(item.subjectId, item.subjectName);

        this.props.navigation.navigate('mockTestInstructionActivity', { 'subjectId': item.subjectId, 'paperTitle': item.subjectName })
    }

    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_mock.png')}
                />
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.pink, position: 'absolute' }} >{this.state.boardName}</Text>
                <View style={GLOBALSTYLE.thumbnailContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        this.state.isMockAvailable ?
                            <FlatList
                                data={this.state.mockTestDetailSubjectList}
                                style={{ alignSelf: 'center', width: '100%', bottom: 20 }}
                                renderItem={({ item, index }) => (
                                    <View style={{ padding: 8 }}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={{ justifyContent: 'center', height: 70, width: '100%', borderRadius: 14, backgroundColor: COLORS.white, elevation: 5 }}
                                            onPress={() => this.openPaper(item)}>
                                            <Text style={{ color: COLORS.darkGrey, marginStart: 15, position: 'absolute' }} numberOfLines={1}>{item.subjectName}</Text>
                                            <Image
                                                style={{ resizeMode: 'contain', width: 70, alignSelf: "flex-end", marginRight: 15 }}
                                                source={require('../images/img_btn_start.png')} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{MESSAGE.noTest}</Text>
                    }
                </View>

                <FooterLayout
                    onPressDrawer={this.toggleDrawer}
                    onPressHome={this.goToHome}
                    onPressNotification={this.goToNotification} />
            </View >
        )
    }

    toggleDrawer = () => {
        this.props.navigation.dispatch(DrawerActions.openDrawer());
    }

    goToHome = () => {
        this.props.navigation.navigate('dashBoardActivity')
    }

    goToNotification = () => {
        this.props.navigation.navigate('notificationActivity')
    }
}

export default MockTestYearActivity

const styles = StyleSheet.create({
    container: {
        width: '90%',
        height: '75%',
        padding: 5,
        margin: 5,
        backgroundColor: COLORS.offWhite,
        borderRadius: 8,
        shadowOpacity: 0,
        elevation: 5,
        alignSelf: "center"
    },
    input: {
        padding: 8,
        height: 45,
        marginTop: 30,
        borderWidth: 0.01,
        borderRadius: 4,
        elevation: 2
    },
    submitButton: {
        backgroundColor: COLORS.pink,
        padding: 10,
        height: 40,
        marginTop: 30,
        borderRadius: 4,
        elevation: 3
    },
    submitButtonText: {
        color: COLORS.white,
        textAlign: 'center'
    },
})