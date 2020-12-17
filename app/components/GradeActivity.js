import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import AsyncStorage from '@react-native-community/async-storage';
import { DrawerActions } from "react-navigation-drawer";
import MESSAGE from '../values/message';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
var DeviceInfo = require('react-native-device-info');

var db, bg = ["#c95371", "#b448a0", "#33781e", "#51a1f4", "#f69c66", "#c95371", "#b448a0", "#33781e", "#51a1f4", "#f69c66", "#c95371", "#b448a0", "#33781e", "#51a1f4", "#f69c66", "#c95371", "#b448a0", "#33781e", "#51a1f4", "#f69c66"];

class GradeActivity extends Component {

    buttonPressed = () => {
        // this.props.navigation.goBack(null)
        this.props.navigation.replace('loginActivity');
    };

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            isLoading: false,
            grades: [],
            temp: this.props.navigation.getParam("grades"),
            boardId: '',
            boardName: '',
            isGradesAvailable: true,
            deviceId: '',
            langId: '',
        };
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
        this.getGradeData();
    }

    getGradeData() {
        db.getGrades(gradeDetails => {
            if (gradeDetails == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                let gDetail = [];
                for (let i = 0; i < gradeDetails.length; i++) {
                    gDetail[i] = {
                        gradeId: gradeDetails.item(i).gradeId,
                        gradeName: gradeDetails.item(i).gradeName,
                        boardId: gradeDetails.item(i).boardId,
                        boardName: gradeDetails.item(i).boardName,
                        languageId: gradeDetails.item(i).languageId,
                        hasMockTest: gradeDetails.item(i).hasMockTest,
                        bgColor: bg[i],
                    };
                }

                this.setState({
                    grades: gDetail,
                    isLoading: false,
                });
            }
        });
    }

    // async registrationDataAPI() {
    //     this.setState({
    //         isLoading: true
    //     });

    //     return fetch(await url(STRING.baseURL) + STRING.registrationDataURL, {
    //         method: 'GET',
    //         headers: {
    //             "Content-type": "application/json; charset=UTF-8"
    //         }
    //     })
    //         .then((response) => response.json())
    //         .then((responseJson) => {
    //             this.setState({
    //                 isLoading: false
    //             });

    //             if (responseJson.boardAndGrade.length > 0) {
    //                 this.setState({
    //                     grades: responseJson.boardAndGrade[0].grades,
    //                     boardId: responseJson.boardAndGrade[0].board.categoryDetailId,
    //                     boardName: responseJson.boardAndGrade[0].board.categoryDetailName,
    //                 });
    //             } else {
    //                 SimpleToast.show("Boards are not available");
    //             }
    //         })
    //         .catch((error) => {
    //             this.setState({
    //                 isLoading: false,
    //             });
    //         });
    // }

    async openDetail(item) {
        await AsyncStorage.setItem(STRING.BOARDID, item.boardId);
        await AsyncStorage.setItem(STRING.BOARDNAME, item.boardName);
        await AsyncStorage.setItem(STRING.GRADEID, item.gradeId);
        await AsyncStorage.setItem(STRING.GRADENAME, item.gradeName);        
        // await AsyncStorage.setItem(STRING.LANGUAGEID, item.languageId);

        db.isMataDataExist(item.boardId, item.boardName);
        db.isMataDataExist(item.gradeId, item.gradeName);

        this.props.navigation.navigate('dashBoardActivity');
    }

    buttonPressed() {
        this.props.navigation.goBack(null);
    }

    render() {
        return (
            <View style={{ backgroundColor: COLORS.green, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                {/* <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}

                <Text style={{ marginTop: 95, marginStart: 30, padding: 12, textAlign: 'left', fontSize: 20, color: COLORS.blue, position: 'absolute' }} >{getValue(LABEL.selectGrade, this.state.langId)}</Text>
                <View style={{ width: '100%', height: 40, flexDirection: 'row', padding: 10, marginTop: 10 }}>
                    <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33 }}>
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

                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.white }} >User Name!!!</Text>
                <View style={GLOBALSTYLE.thumbnailContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View></View>
                    }
                    {this.state.isGradesAvailable ?
                        <FlatList
                            data={this.state.grades}
                            renderItem={({ item }) => (
                                <View style={{ width: '50%', padding: 5 }}>
                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        style={{ justifyContent: 'center', alignItems: 'center', height: 50, width: 140, marginStart: 10, backgroundColor: item.bgColor, borderRadius: 15, }}
                                        onPress={() => this.openDetail(item)}>
                                        {/* <Image style={GLOBALSTYLE.imageThumbnailList} source={{ uri: STRING.imgSubjectURL + item.ImageName }} /> */}
                                        <Text style={{ color: COLORS.white, width: '100%', textAlign: 'center', paddingEnd: 4, paddingStart: 4 }} numberOfLines={1} ellipsizeMode='tail'>{item.gradeName}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            //Setting the number of column
                            numColumns={2}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        :
                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noGrades, this.state.langId)}</Text>
                    }
                </View>
            </View >
        )
    }

    toggleDrawer = () => {
        this.props.navigation.dispatch(DrawerActions.openDrawer());
    }

    goToHome = () => {
        this.props.navigation.navigate('dashBoardActivity')
    }
}

export default GradeActivity

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