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
import { getMessage } from '../util/Util';

var db;

class QuestionPaperActivity extends Component {

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            isLoading: false,
            questionPapers: [],
            isPaperAvailable: true,
            grade: {},
            shouldShowBackNav: false,
        };
    }

    componentDidMount() {
        this.setStates();
    }

    async setStates() {
        this.setState({
            grade: {
                gradeId: await AsyncStorage.getItem(STRING.GRADEID),
                gradeName: await AsyncStorage.getItem(STRING.GRADENAME),
                boardId: await AsyncStorage.getItem(STRING.BOARDID),
                boardName: await AsyncStorage.getItem(STRING.BOARDNAME),
                languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            }
        })

        this.getGradeFromDBIfNotExist();
    }

    getGradeFromDBIfNotExist() {
        if (this.state.grade == null || this.state.grade == '') {
            db.getGrades(grades => {
                if (grade.length == 0) {
                    SimpleToast.show(getMessage(MESSAGE.invalidGrade, this.state.langId));
                } else {
                    this.setState({
                        shouldShowBackNav: false
                    });
                    AsyncStorage.setItem(STRING.BOARDID, grades[0].boardId);
                    AsyncStorage.setItem(STRING.BOARDNAME, grades[0].boardName);
                    AsyncStorage.setItem(STRING.GRADEID, grades[0].gradeId);
                    AsyncStorage.setItem(STRING.GRADENAME, grades[0].gradeName);
                    // AsyncStorage.setItem(STRING.LANGUAGEID, grades[0].languageId);

                    this.questionPaperAPI(grades[0]);
                }
            });
        } else {
            this.setState({
                shouldShowBackNav: true
            });
            AsyncStorage.setItem(STRING.BOARDID, this.state.grade.boardId);
            AsyncStorage.setItem(STRING.BOARDNAME, this.state.grade.boardName);
            AsyncStorage.setItem(STRING.GRADEID, this.state.grade.gradeId);
            AsyncStorage.setItem(STRING.GRADENAME, this.state.grade.gradeName);
            // AsyncStorage.setItem(STRING.LANGUAGEID, this.state.grade.languageId);

            this.questionPaperAPI(this.state.grade);
        }
    }

    async questionPaperAPI(grade) {
        this.setState({
            isLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getCompExamDetails + "boardId=" + grade.boardId + "&gradeId=" + grade.gradeId + "&langId=" + grade.languageId, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    isLoading: false
                });

                if (responseJson.length > 0) {
                    this.setState({
                        questionPapers: responseJson,
                        isPaperAvailable: true
                    });
                } else {
                    this.setState({
                        isPaperAvailable: false
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    async openPaper(item) {
        await AsyncStorage.setItem(STRING.SUBJECTID, item.compExamId);
        await AsyncStorage.setItem(STRING.SUBJECTNAME, item.compExamName);

        db.isMataDataExist(item.compExamId, item.compExamName);

        this.props.navigation.navigate('questionPaperYearActivity', { 'preQuestionPaperList': item.preQuestionPaperList, 'boardName': item.compExamName })
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
                    source={require('../images/img_bg_qpaper.png')}
                />
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >Previous Question Paper</Text>
                <View style={GLOBALSTYLE.thumbnailContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        this.state.isPaperAvailable ?
                            <FlatList
                                data={this.state.questionPapers}
                                style={{ alignSelf: 'center', width: '100%', bottom: 20 }}
                                renderItem={({ item, index }) => (
                                    <View style={{ padding: 8 }}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={{ width: '100%', marginTop: 10, backgroundColor: COLORS.white, justifyContent: 'center', borderRadius: 15, elevation: 5 }}
                                            onPress={() => this.openPaper(item)}>
                                            <Image
                                                style={{ height: 75, width: 75 }}
                                                source={require('../images/bg_qpaper.png')} />
                                            <Text style={{ color: COLORS.darkGrey, position: 'absolute', marginStart: 110 }} numberOfLines={1}>{item.compExamName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noQuestionPaper, this.state.langId)}</Text>
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

export default QuestionPaperActivity

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