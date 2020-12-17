import React, { Component } from 'react'
import { View, Text, Alert, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, AppState, ScrollView, Modal, StyleSheet, BackHandler } from 'react-native'
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
import LABEL from '../values/label';

var db, userDetails, typeId, timeStamp, startTime, endTime, prevPos, currPos = 0;

class QuizInteractiveActivity extends Component {

    constructor(props) {
        super(props);

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        db = DBMigrationHelper.getInstance();

        this.state = {
            appState: AppState.currentState,
            isQuestionAvailable: false,
            questionData: this.props.navigation.getParam('data', null),
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
            shouldShowConfirmation: false,
            shouldShowWrongAnswer: false,
            shouldShowCorrectAnswer: false,
        }
    }

    componentDidMount() {
        console.log(this.state.questionData);
        this.showQuestionData();
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        return true;
    }

    showQuestionData() {
        this.setState({
            que: this.state.questionData.question,
            ans1: this.state.questionData.optionA,
            ans2: this.state.questionData.optionB,
            ans3: this.state.questionData.optionC,
            ans4: this.state.questionData.optionD,
            isOption1Selected: false,
            isOption2Selected: false,
            isOption3Selected: false,
            isOption4Selected: false,
        }, () => {
            // this.setOnOptionClick(Number(this.state.selectedQuestionData[position].givenAnswer), false);
        })
    }

    setOnOptionClick(option, bool) {

        switch (option) {
            case 1:
                this.setState({
                    isOption1Selected: true,
                    isOption2Selected: false,
                    isOption3Selected: false,
                    isOption4Selected: false,
                }, () => {
                    if (this.state.questionData.correctOption != '1') {
                        this.setState({
                            shouldShowWrongAnswer: true
                        })
                    } else {
                        this.setState({
                            shouldShowCorrectAnswer: true
                        })
                    }
                })
                break;
            case 2:
                this.setState({
                    isOption1Selected: false,
                    isOption2Selected: true,
                    isOption3Selected: false,
                    isOption4Selected: false,
                }, () => {
                    if (this.state.questionData.correctOption != '2') {
                        this.setState({
                            shouldShowWrongAnswer: true
                        })
                    } else {
                        this.setState({
                            shouldShowCorrectAnswer: true
                        })
                    }
                })
                break;
            case 3:
                this.setState({
                    isOption1Selected: false,
                    isOption2Selected: false,
                    isOption3Selected: true,
                    isOption4Selected: false,
                }, () => {
                    if (this.state.questionData.correctOption != '3') {
                        this.setState({
                            shouldShowWrongAnswer: true
                        })
                    } else {
                        this.setState({
                            shouldShowCorrectAnswer: true
                        })
                    }
                })
                break;
            case 4:
                this.setState({
                    isOption1Selected: false,
                    isOption2Selected: false,
                    isOption3Selected: false,
                    isOption4Selected: true,
                }, () => {
                    if (this.state.questionData.correctOption != '4') {
                        this.setState({
                            shouldShowWrongAnswer: true
                        })
                    } else {
                        this.setState({
                            shouldShowCorrectAnswer: true
                        })
                    }
                })
                break;
        }
    }

    showConfirmDialog(shouldCancel) {
        if (shouldCancel) {
            this.setState({
                shouldShowConfirmation: true,
                isTimeUps: false,
            })
        } else {
            this.setState({
                shouldShowConfirmation: true,
                isTimeUps: true,
            })
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
                    style={{ width: 110, height: 110, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                {/* <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity> */}
                <Text style={{ marginTop: 20, padding: 12, alignSelf: 'center', fontSize: 14, color: COLORS.blue, position: 'absolute', fontWeight: 'bold' }} >{getValue(LABEL.interactiveQue, this.state.langId)}</Text>
                <View style={{ width: '90%', height: '88%', paddingTop: 10, marginTop: 60, alignSelf: 'center', position: 'absolute', backgroundColor: COLORS.white, elevation: 5, borderRadius: 8 }}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View>
                            <View>
                                <Text style={{ alignSelf: 'center', fontSize: 14, color: COLORS.pink, position: 'absolute', fontWeight: 'bold' }} numberOfLines={1} >{this.state.questionData.topicName}</Text>
                                <ScrollView style={{ width: '100%', height: '90%', marginTop: 40 }}>
                                    <View style={{ flexDirection: 'row', paddingStart: 15, paddingEnd: 10 }}>
                                        <MathJax
                                            // To set the font size change initial-scale=0.8 from MathJax class
                                            style={GLOBALSTYLE.quizQue} html={this.state.que} />
                                    </View>
                                    <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(1, true)}>
                                        <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opA, this.state.langId)}   </Text>
                                        <MathJax
                                            // To set the font size change initial-scale=0.8 from MathJax class
                                            style={this.state.isOption1Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans1} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(2, true)}>
                                        <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opB, this.state.langId)}   </Text>
                                        <MathJax
                                            // To set the font size change initial-scale=0.8 from MathJax class
                                            style={this.state.isOption2Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans2} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(3, true)}>
                                        <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opC, this.state.langId)}   </Text>
                                        <MathJax
                                            // To set the font size change initial-scale=0.8 from MathJax class
                                            style={this.state.isOption3Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans3} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', }} onPress={() => this.setOnOptionClick(4, true)} >
                                        <Text style={{ marginTop: 8, alignSelf: 'center' }}>    {getValue(LABEL.opD, this.state.langId)}   </Text>
                                        <MathJax
                                            // To set the font size change initial-scale=0.8 from MathJax class
                                            style={this.state.isOption4Selected ? GLOBALSTYLE.selectedQuizOption : GLOBALSTYLE.quizOption} html={this.state.ans4} />
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    }
                </View>

                <View style={styles.container} >
                    <Modal
                        visible={this.state.shouldShowWrongAnswer}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Image style={{ height: 70, resizeMode: 'contain', }} source={require('../images/img_alert_abstract.png')} />
                                <Text style={styles.AlertMessage}>{getMessage(MESSAGE.incorrectAns, this.state.langId)}</Text>
                                <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowWrongAnswer: false, })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.okay, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </Modal>
                    <Modal
                        visible={this.state.shouldShowCorrectAnswer}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Image style={{ height: 70, resizeMode: 'contain', }} source={require('../images/img_alert_abstract.png')} />
                                <Text style={styles.AlertMessage}>{getMessage(MESSAGE.correctAns, this.state.langId)}</Text>
                                <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowCorrectAnswer: false }, () => { this.props.navigation.goBack(null, { 'test': 'test' }) })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.continue, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </Modal>
                    <Modal
                        visible={this.state.shouldShowConfirmation}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Image style={{ height: 70, resizeMode: 'contain', }} source={require('../images/img_alert_abstract.png')} />
                                <Text style={styles.AlertMessage}>{this.state.isTimeUps == false ? 'Are you sure you want to submit assessment?' : 'Time up! Please submit your assessment'}</Text>
                                <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.submitQuiz()} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.submit, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                    {this.state.isTimeUps == false ?
                                        <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowConfirmation: false, })} activeOpacity={0.7} >
                                            <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                            <Text style={styles.TextStyle}>{getValue(LABEL.CANCEL, this.state.langId)}</Text>
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

export default QuizInteractiveActivity

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