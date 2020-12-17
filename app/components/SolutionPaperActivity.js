import React, { Component } from 'react'
import { View, Text, Alert, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, AppState, ScrollView } from 'react-native'
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
import { getMessage, getValue } from '../util/Util';

var db, userDetails, typeId, timeStamp, startTime, endTime, prevPos, currPos = 0;

class SolutionPaperActivity extends Component {

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
            solution: '',
            isOption1Selected: false,
            isOption2Selected: false,
            isOption3Selected: false,
            isOption4Selected: false,
            correctAns: '',
            isSubmitted: true,
            shouldRun: true,
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
            solution: "<html dir='rtl'><body>" + "\n<b>Solution</b>\n" + this.state.questionData[position].solution + "</body></html>",
            isOption1Selected: false,
            isOption2Selected: false,
            isOption3Selected: false,
            isOption4Selected: false,
        })

        this.setOnOptionClick(Number(this.state.selectedQuestionData[position].givenAnswer));
    }

    setOnOptionClick(option) {
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
                })
                break;
        }
    }

    showConfirmDialog(shouldCancel) {
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
                                    <ScrollView style={{ width: '100%', height: '88%', marginTop: 40 }}>
                                        <View style={{ flexDirection: 'row', paddingStart: 15, paddingEnd: 10 }}>
                                            <Text style={{ fontSize: 13, marginTop: 5 }}>.{this.state.queNo + 1}</Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={GLOBALSTYLE.quizQue} html={this.state.que} />
                                        </View>
                                        <TouchableOpacity onPress={() => this.setOnOptionClick(1)}>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={this.state.isOption1Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.solution} />
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                                :
                                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noQuestions, this.state.langId)}</Text>
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
            </View >
        )
    }
}

export default SolutionPaperActivity