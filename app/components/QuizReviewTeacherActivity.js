import React, { Component } from 'react'
import { View, Text, Alert, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import SimpleToast from 'react-native-simple-toast';
import { DrawerActions } from "react-navigation-drawer";
import AsyncStorage from '@react-native-community/async-storage';
import MathJax from 'react-native-mathjax';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import MESSAGE from '../values/message';
import { log } from 'react-native-reanimated';
import { getValue } from '../util/Util';
import LABEL from '../values/label';

var db, userDetails, timeStamp, startTime, endTime, prevPos, currPos = 0;

class QuizReviewTeacherActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();

        this.state = {
            isLoading: false,
            reviewQuestionData: this.props.navigation.getParam("reviewQuestionData"),
            isQuestionAvailable: true,
            questionData: [],
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
            isSubmitted: true,
            shouldRun: true,
            data: this.props.navigation.getParam("data", ''),
            percentage: this.props.navigation.getParam("percentage", ''),
            correct: this.props.navigation.getParam("correct", ''),
            wrong: this.props.navigation.getParam("wrong", ''),
            unAnswered: this.props.navigation.getParam("unAnswered", ''),
        }
    }

    componentDidMount() {
        this.setStates();
    }

    async setStates() {
        this.setState({
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })

        this.getUserDetails();
    }

    getUserDetails() {
        db.getUserDetails(user => {
            if (user == null) {
                SimpleToast.show(MESSAGE.wentWrong);
            } else {
                userDetails = user;
                this.getQuestionDataAPI();
            }
        });
    }

    async getQuestionDataAPI() {
        this.setState({
            isLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getQuestionsByIds, {
            method: 'POST',
            body: JSON.stringify(this.state.reviewQuestionData),
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
                    let qData = [];

                    for (let i = 0; i < responseJson.length; i++) {
                        qData.push({
                            questionCode: responseJson[i].questionCode,
                            typeId: responseJson[i].typeId,
                            complexityId: responseJson[i].complexityId,
                            userId: userDetails.id,
                            isAttempted: this.state.reviewQuestionData.selections[i].givenAnswer != 0,
                            isCorrect: responseJson[i].correctOption == this.state.reviewQuestionData.selections[i].givenAnswer,
                            correctOption: responseJson[i].correctOption,
                            givenAnswer: this.state.reviewQuestionData.selections[i].givenAnswer,
                            timeTaken: this.state.reviewQuestionData.selections[i].timeTaken,
                        });
                    }

                    this.setState({
                        questionData: responseJson,
                        isQuestionAvailable: true,
                        selectedQuestionData: qData
                    }, () => {
                        this.showQuestionData(0);
                    });
                } else {
                    this.setState({
                        isQuestionAvailable: false
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({
                    isLoading: false,
                    isQuestionAvailable: false
                });
            });
    }

    performClick(position) {
        this.showQuestionData(position);
    }

    closeQuiz() {
        if (this.state.isPreAssessment && !this.state.isFromDetailActivity) {
            this.props.navigation.replace('notesActivity', { 'isPreAssessment': this.state.isPreAssessment, 'isFromDetailActivity': this.state.isFromDetailActivity });
        } else {
            this.props.navigation.goBack(null);
        }
    }

    viewSummary() {
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

        this.props.navigation.navigate('summeryTeacherReviewActivity', { 'data': this.state.data, 'percentage': this.state.percentage, 'correct': this.state.correct, 'wrong': this.state.wrong, 'unAnswered': this.state.unAnswered })
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
        })
    }

    showConfirmDialog() {
        Alert.alert(
            '',
            'Are you sure you want to quit assessment?',
            [
                {
                    text: 'CANCLE',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => this.closeQuiz() },
            ],
            { cancelable: false }
        )
    }

    displayOptions() {
        var temp, solution, style;

        try {
            if (this.state.selectedQuestionData.length > 0) {
                switch (Number(this.state.selectedQuestionData[currPos].correctOption)) {
                    case 1:

                        if (this.state.isSubmitted) {
                            solution = this.state.questionData[currPos].solution;
                            temp = "<html dir='rtl'><body>" + this.state.questionData[currPos].optionA + "</body></html>";

                            if (solution != null && solution != "") {
                                temp = temp + "\n<b>Solution</b>\n" + solution;
                            }
                        }
                        return (
                            <View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opA, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={GLOBALSTYLE.selectedQuizOptionCorrect} html={temp} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opB, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 2 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans2} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opC, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 3 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans3} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opD, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 4 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans4} />
                                </View>
                            </View>
                        )
                    case 2:
                        if (this.state.isSubmitted) {
                            solution = this.state.questionData[currPos].solution;
                            temp = "<html dir='rtl'><body>" + this.state.questionData[currPos].optionB + "</body></html>";

                            if (solution != null && solution != "") {
                                temp = temp + "\n<b>Solution</b>\n" + solution;
                            }
                        }
                        return (
                            <View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opA, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 1 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans1} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opB, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={GLOBALSTYLE.selectedQuizOptionCorrect} html={temp} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opC, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 3 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans3} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opD, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 4 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans4} />
                                </View>
                            </View>
                        )
                    case 3:
                        if (this.state.isSubmitted) {
                            solution = this.state.questionData[currPos].solution;
                            temp = "<html dir='rtl'><body>" + this.state.questionData[currPos].optionC + "</body></html>";

                            if (solution != null && solution != "") {
                                temp = temp + "\n<b>Solution</b>\n" + solution;
                            }
                        }
                        return (
                            <View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opA, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 1 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans1} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opB, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 2 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans2} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opC, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={GLOBALSTYLE.selectedQuizOptionCorrect} html={temp} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opD, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 4 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans4} />
                                </View>
                            </View>
                        )
                    case 4:
                        if (this.state.isSubmitted) {
                            solution = this.state.questionData[currPos].solution;
                            temp = "<html dir='rtl'><body>" + this.state.questionData[currPos].optionD + "</body></html>";

                            if (solution != null && solution != "") {
                                temp = temp + "\n<b>Solution</b>\n" + solution;
                            }
                        }
                        return (
                            <View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opA, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 1 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans1} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opB, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 2 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans2} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opC, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={this.state.selectedQuestionData[currPos].givenAnswer == 3 ? GLOBALSTYLE.selectedQuizOptionInCorrect : GLOBALSTYLE.quizOption} html={this.state.ans3} />
                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opD, this.state.languageId)}   </Text>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={GLOBALSTYLE.selectedQuizOptionCorrect} html={temp} />
                                </View>
                            </View>
                        )
                }
            }
        } catch (error) {
            console.log(error);
        }
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
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 20, padding: 12, alignSelf: 'center', fontSize: 14, color: COLORS.black, position: 'absolute', fontWeight: 'bold' }} >{getValue(LABEL.reviewTest, this.state.languageId)}</Text>
                <View style={GLOBALSTYLE.quizContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View>
                            {this.state.isQuestionAvailable ?
                                <View>
                                    <TouchableOpacity
                                        onPress={() => this.viewSummary()}>
                                        <Text style={{ color: COLORS.blue, alignSelf: 'center' }}>{getValue(LABEL.VIEWSOLUTION, this.state.languageId)}</Text>
                                    </TouchableOpacity>
                                    <FlatList
                                        showsHorizontalScrollIndicator={false}
                                        data={this.state.questionData}
                                        style={{ position: 'absolute', marginTop: 30, paddingBottom: 5, paddingTop: 5 }}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                onPress={() => this.performClick(index)}
                                                style={index == this.state.queNo ? GLOBALSTYLE.selectedQuizNumber : this.state.selectedQuestionData[index].isAttempted ? this.state.selectedQuestionData[index].isCorrect ? GLOBALSTYLE.correctQuizNumber : GLOBALSTYLE.incorrectQuizNumber : GLOBALSTYLE.incorrectQuizNumber}>
                                                <Text
                                                    style={index == this.state.queNo ? GLOBALSTYLE.selectedQuizNumberFont : this.state.selectedQuestionData[index].isAttempted ? this.state.selectedQuestionData[index].isCorrect ? GLOBALSTYLE.correctQuizNumberFont : GLOBALSTYLE.incorrectQuizNumberFont : GLOBALSTYLE.incorrectQuizNumberFont}
                                                >{index + 1}</Text>
                                            </TouchableOpacity>
                                        )}
                                        horizontal={true}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                    <ScrollView style={{ width: '100%', height: '85%', marginTop: 60 }}>
                                        <View style={{ flexDirection: 'row', paddingStart: 15, paddingEnd: 10 }}>
                                            <Text style={{ fontSize: 13, marginTop: 5 }}>.{this.state.queNo + 1}</Text>
                                            <MathJax
                                                // To set the font size change initial-scale=0.8 from MathJax class
                                                style={GLOBALSTYLE.quizQue} html={this.state.que} />
                                        </View>

                                        {this.displayOptions()}
                                    </ScrollView>
                                </View>
                                :
                                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{MESSAGE.noQuestions}</Text>
                            }
                        </View>
                    }
                </View>

                <View style={{ flex: 1, flexDirection: 'row', position: 'absolute', bottom: 0, backgroundColor: COLORS.white, borderTopStartRadius: 25, borderTopEndRadius: 25, borderColor: COLORS.darkGrey, borderWidth: 0.5 }}>
                    <TouchableOpacity
                        disabled={this.state.queNo == 0}
                        onPress={() => this.performClick(this.state.queNo - 1)}
                        style={{ flex: 0.5, textAlign: 'center', bottom: 0, padding: 10, color: COLORS.blue, fontWeight: 'bold' }}>
                        <Text style={this.state.queNo == 0 ? GLOBALSTYLE.nextPrevBtnIfFirst : GLOBALSTYLE.nextPrevBtn}>{getValue(LABEL.previous, this.state.languageId)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.state.questionData.length == this.state.queNo + 1 ? () => this.props.navigation.goBack(null) : () => this.performClick(this.state.queNo + 1)}
                        style={{ flex: 0.5, textAlign: 'center', bottom: 0, padding: 10, color: COLORS.blue, fontWeight: 'bold' }}>
                        <Text style={GLOBALSTYLE.nextPrevBtn}>{this.state.questionData.length == this.state.queNo + 1 ? getValue(LABEL.close, this.state.languageId) : getValue(LABEL.next, this.state.languageId)}</Text>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }
}

export default QuizReviewTeacherActivity