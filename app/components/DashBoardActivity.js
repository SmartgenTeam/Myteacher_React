import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import { DrawerActions } from "react-navigation-drawer";
import LinearGradient from 'react-native-linear-gradient';
import { NativeModules } from 'react-native';
import LABEL from '../values/label';
import { getValue, isJson, getMessage } from '../util/Util';

var ServiceModule = NativeModules.ServiceModule;
var db;

class DashBoardActivity extends Component {

    async startService() {
        ServiceModule.startService();
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        // this.startService();

        db = DBMigrationHelper.getInstance();

        this.state = {
            isLoading: false,
            subjects: [],
            isSubjectsAvailable: true,
            grade: {},
            shouldShowBackNav: false,
            userId: '',
            username: '',
            emailId: '',
            gradeId: '',
            gradeName: '',
            langId: '',
            isFromDashBoardActivity: 'false',
        };
    }

    componentDidMount() {
        this.getUserData();
        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.getUserData();
            }
        );
    }

    getUserData() {
        db.getUserDetails(user => {
            if (user == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                this.setState({
                    username: user.name,
                    userId: user.id,
                    emailId: user.email,
                }, () => {
                    this.setGrade();
                });
            }
        });
    }

    async setGrade() {
        this.setState({
            gradeName: await AsyncStorage.getItem(STRING.GRADENAME),
            gradeId: await AsyncStorage.getItem(STRING.GRADEID),
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            isFromDashBoardActivity: await AsyncStorage.getItem(STRING.ISFROMLOGIN),
        }, () => {
            db.getOneGrade(grade => {
                if (grade == null) {
                    SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
                } else {
                    AsyncStorage.setItem(STRING.GRADENAME, grade.gradeName);
                    AsyncStorage.setItem(STRING.GRADEID, grade.gradeId);
                    AsyncStorage.setItem(STRING.BOARDID, grade.boardId);
                    AsyncStorage.setItem(STRING.BOARDNAME, grade.boardName);
                    // AsyncStorage.setItem(STRING.LANGUAGEID, grade.languageId);

                    this.setState({
                        grade: {
                            gradeName: grade.gradeName,
                            hasMockTest: grade.hasMockTest,
                        }
                    }, () => {
                        // this.syncQuizRecords(grade.languageId);
                        if (this.state.isFromDashBoardActivity == 'true') {
                            // this.readLogoAPI();
                            AsyncStorage.setItem(STRING.ISFROMLOGIN, 'false');
                        }
                    });
                }
            }, this.state.gradeId);
        })
    }

    // syncQuizRecords(languageId) {
    //     db.getUnSyncedQuizData(data => {
    //         let qData = [];

    //         if (data != null) {
    //             try {
    //                 for (let i = 0; i < data.length; i++) {
    //                     qData[i] = {
    //                         QId: data.item(i).qId,
    //                         QuestionCode: data.item(i).questionCode,
    //                         TypeId: data.item(i).typeId,
    //                         ComplexityId: data.item(i).complexityId,
    //                         BoardId: data.item(i).boardId,
    //                         GradeId: data.item(i).gradeId,
    //                         SubjectId: data.item(i).subjectId,
    //                         ChapterId: data.item(i).chapterId,
    //                         TopicId: data.item(i).topicId,
    //                         LanguageId: data.item(i).languageId,
    //                         UserId: data.item(i).userId,
    //                         CorrectOption: data.item(i).correctOption,
    //                         GivenAnswer: data.item(i).givenAnswer,
    //                         TimeTaken: data.item(i).timeTaken,
    //                         TimeStamp: data.item(i).timeStamp,
    //                         Status: 'true',
    //                     }
    //                 }

    //                 this.syncMataRecords(qData, languageId);
    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         } else {
    //             this.syncMataRecords(qData, languageId);
    //         }
    //     });
    // }

    // syncMataRecords(quizData, languageId) {

    //     db.getUnSyncedMataData(data => {
    //         let finalObj = {
    //             QuizUsageDatas: [],
    //             SyllabusMetaDatas: [],
    //         }

    //         if (data != null) {
    //             try {
    //                 let metaData = [];
    //                 for (let i = 0; i < data.length; i++) {
    //                     metaData[i] = {
    //                         SId: data.item(i).sId,
    //                         CategoryDetailId: data.item(i).CategoryDetailId,
    //                         CategoryDetailName: data.item(i).CategoryDetailName,
    //                         LanguageId: languageId,
    //                         UserId: this.state.userId,
    //                         Status: 'true',
    //                     }
    //                 }

    //                 finalObj = {
    //                     QuizUsageDatas: quizData,
    //                     SyllabusMetaDatas: metaData,
    //                 }

    //                 this.usageSyncAPI(finalObj);

    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         } else {
    //             this.usageSyncAPI(finalObj);
    //         }
    //     });
    // }

    // async usageSyncAPI(data) {
    //     return fetch(await url(STRING.baseURL) + STRING.syncUsageData, {
    //         method: 'POST',
    //         body: JSON.stringify(data),
    //         headers: {
    //             "Content-type": "application/json; charset=UTF-8"
    //         }
    //     })
    //         .then(response => {
    //             const statusCode = response.status;
    //             const data = response.json();
    //             return Promise.all([statusCode, data]);
    //         })
    //         .then(([statusCode, responseJson]) => {
    //             if (statusCode == 200) {
    //                 db.updateStatus();
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(error);

    //         });
    // }

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
                <View style={{ position: 'absolute', marginTop: 80, width: '100%', alignSelf: 'center', }}>
                    <View style={{ flexDirection: 'column', height: 80, justifyContent: 'center', width: '60%', backgroundColor: COLORS.orange, borderBottomEndRadius: 8, borderTopEndRadius: 8, elevation: 4, padding: 8 }}>
                        <Text style={{ fontSize: 15, color: COLORS.white }} >{getValue(LABEL.welcome, this.state.langId)}</Text>
                        <Text style={{ fontSize: 18, color: COLORS.white }} >{this.state.username}</Text>
                    </View>
                    <Image
                        style={{ width: 80, height: 80, marginStart: 20, position: 'absolute', alignSelf: 'flex-end', end: 20 }}
                        source={require('../images/img_mid2.png')}
                    />
                </View>

                <View style={{ position: 'absolute', paddingTop: 280, bottom: 40, alignSelf: 'center', width: '80%', height: '100%' }}>
                    <ScrollView style={{ height: '100%' }}>
                        <TouchableOpacity
                            style={{ width: '100%', alignContent: 'center', marginBottom: 10, elevation: 5, justifyContent: 'center' }}
                            activeOpacity={0.7}
                            onPress={() => this.props.navigation.navigate('subjectActivity', { "grades": this.state.grades })}>
                            <Image style={{ height: 65, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_library.png')} />
                            <Text style={{ color: COLORS.white, width: '100%', position: 'absolute', textAlign: 'left', fontSize: 18, marginStart: 120 }} numberOfLines={1}>{getValue(LABEL.myLib, this.state.langId)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ width: '100%', alignContent: 'center', marginBottom: 10, justifyContent: 'center' }}
                            activeOpacity={0.7}
                            onPress={() => this.props.navigation.navigate('subjectPracticeActivity', { "grade": this.state.grade })}>
                            <Image style={{ height: 65, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_practice.png')} />
                            <Text style={{ color: COLORS.white, width: '100%', position: 'absolute', textAlign: 'left', fontSize: 18, marginStart: 120 }} numberOfLines={1}>{getValue(LABEL.practice, this.state.langId)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ width: '100%', alignContent: 'center', marginBottom: 10, justifyContent: 'center' }}
                            activeOpacity={0.7}
                            onPress={() => this.props.navigation.navigate('performanceActivity')}>
                            <Image style={{ height: 65, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_performance.png')} />
                            <Text style={{ color: COLORS.white, width: '100%', position: 'absolute', textAlign: 'left', fontSize: 18, marginStart: 120 }} numberOfLines={1}>{getValue(LABEL.performance, this.state.langId)}</Text>
                        </TouchableOpacity>
                    </ScrollView>
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

export default DashBoardActivity