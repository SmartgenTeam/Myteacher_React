import React, { Component } from 'react'
import { View, Text, Alert, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, AppState, ScrollView, Modal, StyleSheet } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import SimpleToast from 'react-native-simple-toast';
import { DrawerActions } from "react-navigation-drawer";
import CountDown from 'react-native-countdown-component';
import MathJax from 'react-native-mathjax';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import AsyncStorage from '@react-native-community/async-storage';
import MESSAGE from '../values/message';
import LABEL from '../values/label';
import { getMessage, getValue } from '../util/Util';

var db, userDetails, typeId, timeStamp, startTime, endTime, prevPos, currPos = 0;

class QuizPaperActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();

        this.state = {
            appState: AppState.currentState,
            isLoading: false,
            languageId: '',
            topicId: '',
            topicName: '',
            gradeId: '',
            gradeName: '',
            boardId: '',
            boardName: '',
            subjectId: '',
            subjectName: '',
            chapterId: '',
            chapterName: '',
            videoURL: '',
            isQuestionAvailable: false,
            questionData: this.props.navigation.getParam("item", true),
            selectedQuestionData: [],
            queNo: '',
            que: '',
            ans1: '',
            ans2: '',
            ans3: '',
            ans4: '',
            isOption1Selected: false,
            isOption2Selected: false,
            isOption3Selected: false,
            isOption4Selected: false,
            correctAns: '',
            isSubmitted: false,
            shouldRun: true,
            shouldShowConfirmation: false,
            isTimeUps: false,
        }
    }

    componentDidMount() {
        this.setStates();
    }

    async setStates() {
        this.setState({
            gradeId: await AsyncStorage.getItem(STRING.GRADEID),
            gradeName: await AsyncStorage.getItem(STRING.GRADENAME),
            boardId: await AsyncStorage.getItem(STRING.BOARDID),
            boardName: await AsyncStorage.getItem(STRING.BOARDNAME),
            subjectId: await AsyncStorage.getItem(STRING.SUBJECTID),
            subjectName: await AsyncStorage.getItem(STRING.SUBJECTNAME),
            chapterId: await AsyncStorage.getItem(STRING.CHAPTERID),
            chapterName: await AsyncStorage.getItem(STRING.CHAPTERNAME),
            topicId: await AsyncStorage.getItem(STRING.TOPICID),
            topicName: await AsyncStorage.getItem(STRING.TOPICNAME),
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            videoURL: await AsyncStorage.getItem(STRING.VIDEOURL),
        })

        this.getUserDetails();
    }

    getUserDetails() {
        db.getUserDetails(user => {
            if (user == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                userDetails = user;
                this.getQuestionDataAPI();
            }
        });
    }

    getQuestionDataAPI() {
        if (this.state.questionData.length > 0) {
            timeStamp = Math.round(new Date().getTime());
            startTime = Math.round((new Date()).getTime() / 1000);
            let qData = [];

            for (let i = 0; i < this.state.questionData.length; i++) {
                qData.push({
                    questionCode: this.state.questionData[i].questionCode,
                    typeId: 'Question Paper',
                    complexityId: this.state.questionData[i].complexityId,
                    boardId: this.state.boardId,
                    boardName: this.state.boardName,
                    gradeId: this.state.gradeId,
                    gradeName: this.state.gradeName,
                    subjectId: this.state.subjectId,
                    subjectName: this.state.subjectName,
                    chapterId: this.state.chapterId,
                    chapterName: this.state.chapterName,
                    topicId: this.state.topicId,
                    topicName: this.state.topicName,
                    languageId: this.state.languageId,
                    userId: userDetails.id,
                    isAttempted: false,
                    isCorrect: false,
                    correctOption: this.state.questionData[i].correctOption,
                    givenAnswer: 0,
                    totalTimeTaken: 0,
                    timeTaken: 0,
                    timeStamp: timeStamp,
                    noOfAttempts: 0,
                });
            }

            this.setState({
                selectedQuestionData: qData
            });

            this.setState({
                questionData: this.state.questionData,
                isQuestionAvailable: true
            });
            this.showQuestionData(0);
        } else {
            this.setState({
                isQuestionAvailable: false
            });
        }
    }

    performClick(position) {
        this.addTimeTaken();

        this.showQuestionData(position);
    }

    submitQuiz() {
        this.addTimeTaken();

        db.insertQuizData(code => {
            if (code == 400) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            }

            var correct = 0, incorrect = 0, answered = 0, unAnswered = 0;
            let qData = [...this.state.selectedQuestionData];

            for (let i = 0; i < qData.length; i++) {
                var quiz1 = qData[i];
                if (quiz1.givenAnswer == quiz1.correctOption) {
                    correct++;
                    qData[i] = {
                        ...qData[i],
                        isCorrect: true,
                    };

                } else {
                    qData[i] = {
                        ...qData[i],
                        isCorrect: false,
                    };
                }
                if (quiz1.isAttempted) {
                    answered++;
                } else {
                    unAnswered++;
                }
            }

            this.setState({
                shouldRun: false,
                selectedQuestionData: qData,
                shouldShowConfirmation: false,
            })

            this.props.navigation.replace('summeryPaperActivity', { 'data': this.state.selectedQuestionData, 'questionData': this.state.questionData, 'percentage': (correct * 100) / qData.length, 'correct': correct, 'wrong': qData.length - correct, 'unAnswered': unAnswered })

        }, this.state.selectedQuestionData, false);
    }

    addTimeTaken() {
        endTime = Math.round((new Date()).getTime() / 1000);
        let qData = [...this.state.selectedQuestionData], pos = prevPos;

        qData[pos] = {
            ...qData[pos],
            totalTimeTaken: (Number(qData[pos].timeTaken) + (endTime - startTime)),
            timeTaken: endTime - startTime,
        };

        this.setState({
            selectedQuestionData: qData,
        })
        startTime = endTime;
    }

    showQuestionData(position) {
        prevPos = position;
        currPos = position;

        this.setState({
            queNo: position,
            que: "<html dir='rtl'><body>" + this.state.questionData[position].question + "</body></html>",
            ans1: "<html dir='rtl'><body>" + this.state.questionData[position].optionA + "</body></html>",
            ans2: "<html dir='rtl'><body>" + this.state.questionData[position].optionB + "</body></html>",
            ans3: "<html dir='rtl'><body>" + this.state.questionData[position].optionC + "</body></html>",
            ans4: "<html dir='rtl'><body>" + this.state.questionData[position].optionD + "</body></html>",
            isOption1Selected: false,
            isOption2Selected: false,
            isOption3Selected: false,
            isOption4Selected: false,
        }, () => {
            this.setOnOptionClick(Number(this.state.selectedQuestionData[position].givenAnswer), false);
        })
    }

    setOnOptionClick(option, bool) {
        let qData = [...this.state.selectedQuestionData];

        switch (option) {
            case 1:
                qData[this.state.queNo] = {
                    ...qData[this.state.queNo],
                    isAttempted: true,
                    givenAnswer: '1'
                };

                this.setState({
                    selectedQuestionData: qData,
                    isOption1Selected: true,
                    isOption2Selected: false,
                    isOption3Selected: false,
                    isOption4Selected: false,
                }, () => {
                    if (bool && this.state.questionData.length != this.state.queNo + 1) {
                        this.performClick(this.state.queNo + 1);
                    }
                })
                break;
            case 2:
                qData[this.state.queNo] = {
                    ...qData[this.state.queNo],
                    isAttempted: true,
                    givenAnswer: '2'
                };

                this.setState({
                    selectedQuestionData: qData,
                    isOption1Selected: false,
                    isOption2Selected: true,
                    isOption3Selected: false,
                    isOption4Selected: false,
                }, () => {
                    if (bool && this.state.questionData.length != this.state.queNo + 1) {
                        this.performClick(this.state.queNo + 1);
                    }
                })
                break;
            case 3:
                qData[this.state.queNo] = {
                    ...qData[this.state.queNo],
                    isAttempted: true,
                    givenAnswer: '3'
                };

                this.setState({
                    selectedQuestionData: qData,
                    isOption1Selected: false,
                    isOption2Selected: false,
                    isOption3Selected: true,
                    isOption4Selected: false,
                }, () => {
                    if (bool && this.state.questionData.length != this.state.queNo + 1) {
                        this.performClick(this.state.queNo + 1);
                    }
                })
                break;
            case 4:
                qData[this.state.queNo] = {
                    ...qData[this.state.queNo],
                    isAttempted: true,
                    givenAnswer: '4'
                };

                this.setState({
                    selectedQuestionData: qData,
                    isOption1Selected: false,
                    isOption2Selected: false,
                    isOption3Selected: false,
                    isOption4Selected: true,
                }, () => {
                    if (bool && this.state.questionData.length != this.state.queNo + 1) {
                        this.performClick(this.state.queNo + 1);
                    }
                })
                break;
        }
    }

    showConfirmDialog(shouldCancel) {
        if (shouldCancel) {
            // Alert.alert(
            //     '',
            //     'Are you sure you want to submit assessment?',
            //     [
            //         {
            //             text: 'NO',
            //             onPress: () => console.log('Cancel Pressed'),
            //             style: 'cancel'
            //         },
            //         { text: 'YES', onPress: () => this.submitQuiz() },
            //     ],
            //     { cancelable: false }
            // )
            this.setState({
                shouldShowConfirmation: true,
                isTimeUps: false,
            })
        } else {
            // Alert.alert(
            //     '',
            //     'Time up! Please submit your assessment',
            //     [
            //         { text: 'CONTINUE', onPress: () => this.submitQuiz() },
            //     ],
            //     { cancelable: false }
            // )
            this.setState({
                shouldShowConfirmation: true,
                isTimeUps: true,
            })
        }
    }

    handleMessage(message) {
        // this.setState({
        // 	height: Number(message.nativeEvent.data)
        // });
    }

    render() {
        return (
            <View style={{ backgroundColor: COLORS.green, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                <Image
                    style={{ width: 135, height: 135, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                />
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 20, padding: 12, alignSelf: 'center', fontSize: 14, color: COLORS.blue, position: 'absolute', fontWeight: 'bold' }} >Question Paper</Text>
                <View style={GLOBALSTYLE.quizContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View>
                            {/* <Text style={{ alignSelf: 'center', fontSize: 14, color: COLORS.pink, position: 'absolute', fontWeight: 'bold' }} numberOfLines={1} >{this.state.topicName}</Text> */}
                            {this.state.isQuestionAvailable ?
                                <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center', alignSelf: 'center' }}>
                                    <Text style={{ fontSize: 12 }}>Time Left </Text>
                                    <CountDown
                                        until={3600}
                                        onFinish={() => this.showConfirmDialog(false)}
                                        digitStyle={{ backgroundColor: '#0000000', borderWidth: 0, }}
                                        separatorStyle={{ color: COLORS.black }}
                                        size={12}
                                        timeToShow={['M', 'S']}
                                        timeLabels={{ m: null, s: null }}
                                        showSeparator
                                        running={this.state.shouldRun}
                                    />
                                    <Text style={{ fontSize: 12 }}> Minutes</Text>
                                </View>
                                :
                                <View></View>
                            }
                            <Text style={{ alignSelf: 'center', fontSize: 14, color: COLORS.pink }} ></Text>
                            {this.state.isQuestionAvailable ?
                                <View>
                                    <FlatList
                                        showsHorizontalScrollIndicator={false}
                                        data={this.state.questionData}
                                        style={{ position: 'absolute', paddingBottom: 5, paddingTop: 5 }}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                onPress={() => this.performClick(index)}
                                                style={index == this.state.queNo ? GLOBALSTYLE.selectedQuizNumber : (this.state.selectedQuestionData[index].isAttempted ? GLOBALSTYLE.attemptedQuizNumber : GLOBALSTYLE.quizNumber)}>
                                                <Text
                                                    style={this.state.selectedQuestionData[index].isAttempted ? GLOBALSTYLE.attemptedQuizNumberFont : (index == this.state.queNo ? GLOBALSTYLE.selectedQuizNumberFont : GLOBALSTYLE.quizNumberFont)}
                                                    numberOfLines={1} ellipsizeMode='tail'>{index + 1}</Text>
                                            </TouchableOpacity>
                                        )}
                                        horizontal={true}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                    <ScrollView style={{ width: '100%', height: '80%', marginTop: 40 }}>
                                        <View style={{ flexDirection: 'row', paddingStart: 15, paddingEnd: 10 }}>
                                            <Text style={{ fontSize: 13, marginTop: 5 }}>.{this.state.queNo + 1}</Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={GLOBALSTYLE.quizQue} html={this.state.que} />
                                        </View>
                                        <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(1, true)}>
                                            <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {LABEL.opA}   </Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={this.state.isOption1Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans1} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(2, true)}>
                                            <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {LABEL.opB}   </Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={this.state.isOption2Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans2} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(3, true)}>
                                            <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {LABEL.opC}   </Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={this.state.isOption3Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans3} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(4, true)} >
                                            <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {LABEL.opD}   </Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={this.state.isOption4Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans4} />
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                                :
                                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{MESSAGE.noQuestions}</Text>
                            }
                        </View>
                    }
                </View>

                {this.state.isQuestionAvailable ?
                    <View style={{ flex: 1, flexDirection: 'row', position: 'absolute', bottom: 0, backgroundColor: COLORS.white, borderTopStartRadius: 25, borderTopEndRadius: 25, borderColor: COLORS.darkGrey, borderWidth: 0.5 }}>
                        <TouchableOpacity
                            disabled={this.state.queNo == 0}
                            onPress={() => this.performClick(this.state.queNo - 1)}
                            style={{ flex: 0.5, textAlign: 'center', bottom: 0, padding: 10, color: COLORS.blue, fontWeight: 'bold' }}>
                            <Text style={this.state.queNo == 0 ? GLOBALSTYLE.nextPrevBtnIfFirst : GLOBALSTYLE.nextPrevBtn}>{getValue(LABEL.previous, this.state.languageId)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.state.questionData.length == this.state.queNo + 1 ? () => this.showConfirmDialog(true) : () => this.performClick(this.state.queNo + 1)}
                            style={{ flex: 0.5, textAlign: 'center', bottom: 0, padding: 10, color: COLORS.blue, fontWeight: 'bold' }}>
                            <Text style={GLOBALSTYLE.nextPrevBtn}>{this.state.questionData.length == this.state.queNo + 1 ? getValue(LABEL.submit, this.state.languageId) : getValue(LABEL.next, this.state.languageId)}</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View></View>
                }

                <View style={styles.container} >
                    <Modal
                        visible={this.state.shouldShowConfirmation}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Image style={{ height: 70, resizeMode: 'contain', }} source={require('../images/img_alert_abstract.png')} />
                                <Text style={styles.AlertMessage}>{this.state.isTimeUps == false ? 'Are you sure you want to submit test?' : 'Time up! Please submit your test'}</Text>
                                <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.submitQuiz()} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>SUBMIT</Text>
                                    </TouchableOpacity>
                                    {this.state.isTimeUps == false ?
                                        <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowConfirmation: false, })} activeOpacity={0.7} >
                                            <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                            <Text style={styles.TextStyle}>CANCEL</Text>
                                        </TouchableOpacity>
                                        :
                                        <View></View>
                                    }
                                </View>

                            </View>
                        </View>
                    </Modal>
                </View>
            </View >
        )
    }
    toggleDrawer = () => {
        this.props.navigation.dispatch(DrawerActions.openDrawer());
    }
}

export default QuizPaperActivity

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 20
        },
        MainAlertView: {
            alignItems: 'center',
            backgroundColor: COLORS.white,
            borderRadius: 20,
            elevation: 40,
            height: 150,
            width: '80%',
        },
        AlertMessage: {
            fontSize: 14,
            color: COLORS.black,
            textAlign: 'center',
            padding: 5,
            bottom: 45,
            position: 'absolute',
        },
        TextStyle: {
            color: COLORS.white,
            textAlign: 'center',
            fontSize: 14,
            position: 'absolute'
        }
    });