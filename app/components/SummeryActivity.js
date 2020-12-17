import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import { DrawerActions } from "react-navigation-drawer";
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import * as scale from 'd3-scale'
import LinearGradient from 'react-native-linear-gradient';
import LABEL from '../values/label';
import { getValue } from '../util/Util';

var db;

class SummeryActivity extends Component {

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        this.state = {
            data: this.props.navigation.getParam("data", ''),
            questionData: this.props.navigation.getParam("questionData", ''),
            isPreAssessment: this.props.navigation.getParam("isPreAssessment", true),
            isFromDetailActivity: this.props.navigation.getParam("isFromDetailActivity", true),
            videoURL: '',
            languageId: '',
            topicId: '',
            topicName: '',
            percentage: this.props.navigation.getParam("percentage", ''),
            correct: this.props.navigation.getParam("correct", ''),
            wrong: this.props.navigation.getParam("wrong", ''),
            unAnswered: this.props.navigation.getParam("unAnswered", ''),
            graphData: [],
            progressImage: '',
            langId: '',
        };
    }

    componentDidMount() {
        this.setStates();

        var gData = [];
        for (let i = 0; i < this.state.data.length; i++) {
            var fill = { fill: this.state.data[i].isCorrect ? 'green' : 'red' };
            gData[i] = {
                ...gData[i],
                // value: (this.state.data[i].timeTaken > 180 ? 180 : this.state.data[i].timeTaken),
                value: this.state.data[i].timeTaken,
                svg: fill
            };
        }

        this.setState({
            graphData: gData
        });

        this.setValues();
    }

    async setStates() {
        this.setState({
            topicId: await AsyncStorage.getItem(STRING.TOPICID),
            topicName: await AsyncStorage.getItem(STRING.TOPICNAME),
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            videoURL: await AsyncStorage.getItem(STRING.VIDEOURL),
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
    }

    setValues() {
        var imageName;
        if (this.state.percentage <= 19) {
            imageName = require('../images/score1.png');
        } else if (this.state.percentage > 19 && this.state.percentage <= 39) {
            imageName = require('../images/score2.png');
        } else if (this.state.percentage > 39 && this.state.percentage <= 59) {
            imageName = require('../images/score3.png');
        } else if (this.state.percentage > 59 && this.state.percentage <= 79) {
            imageName = require('../images/score4.png');
        } else if (this.state.percentage > 79 && this.state.percentage <= 99) {
            imageName = require('../images/score5.png');
        } else if (this.state.percentage > 99) {
            imageName = require('../images/score6.png');
        }

        this.setState({
            progressImage: imageName
        });
    }

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
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >{getValue(LABEL.summary, this.state.langId)}</Text>
                <View style={{ width: '90%', height: '70%', marginTop: 150, alignSelf: 'center', position: 'absolute', backgroundColor: COLORS.white, elevation: 5, borderRadius: 8 }}>
                    <View style={{ alignItems: 'center', alignSelf: 'center', width: '100%', flexDirection: 'row', padding: 15 }}>
                        <Image
                            style={{ width: '80%', height: 20 }}
                            source={this.state.progressImage}
                        />
                        <Text style={{ textAlign: 'center', fontSize: 14, color: COLORS.black, fontWeight: 'bold', paddingEnd: 15, paddingStart: 15 }} >{this.state.correct}/{this.state.data.length}</Text>
                    </View>
                    <View style={{ alignItems: 'center', alignSelf: 'center', width: '100%', flexDirection: 'row', padding: 15 }}>
                        <Image
                            style={{ width: 15, height: 15 }}
                            source={require('../images/ic_correct.png')}
                        />
                        <Text style={{ textAlign: 'center', fontSize: 14, color: COLORS.black, paddingEnd: 15, paddingStart: 15 }} >{this.state.correct} {getValue(LABEL.correct, this.state.langId)}</Text>
                        <Image
                            style={{ width: 15, height: 15 }}
                            source={require('../images/ic_incorrect.png')}
                        />
                        <Text style={{ textAlign: 'center', fontSize: 14, color: COLORS.black, paddingEnd: 15, paddingStart: 15 }} >{this.state.wrong} {getValue(LABEL.incorrect, this.state.langId)}</Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.grey, width: '100%', height: 0.9, marginTop: 8 }} />
                    <View style={{ flexDirection: 'row', height: 250, padding: 10, marginTop: 40, marginEnd: 8 }}>
                        <View style={{ flexDirection: 'column', height: 204, marginStart: 8, }}>
                            {/* <Text style={{ textAlign: 'center', fontSize: 12, color: COLORS.black, flex: 1 }} >500</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: COLORS.black, flex: 1 }} >450</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: COLORS.black, flex: 1 }} >400</Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: COLORS.black, flex: 1 }} >350</Text> */}
                            <Text style={{ textAlign: 'center', fontSize: 12, borderTopWidth: 1, borderTopColor: COLORS.grey, color: COLORS.black, flex: 1 }} >300    </Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, borderTopWidth: 1, borderTopColor: COLORS.grey, color: COLORS.black, flex: 1 }} >250    </Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, borderTopWidth: 1, borderTopColor: COLORS.grey, color: COLORS.black, flex: 1 }} >200    </Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, borderTopWidth: 1, borderTopColor: COLORS.grey, color: COLORS.black, flex: 1 }} >150    </Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, borderTopWidth: 1, borderTopColor: COLORS.grey, color: COLORS.black, flex: 1 }} >100    </Text>
                            <Text style={{ textAlign: 'center', fontSize: 12, borderTopWidth: 1, borderTopColor: COLORS.grey, color: COLORS.black, flex: 1 }} > 50    </Text>
                        </View>
                        <View style={{ backgroundColor: COLORS.grey, width: 0.9, height: '88%' }} />
                        <View style={{ flex: 1, }}>
                            <BarChart
                                style={{ flex: 1 }}
                                data={this.state.graphData}
                                yAccessor={({ item }) => item.value}
                                yMin={0}
                                yMax={300}
                                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}>
                            </BarChart>
                            <View style={{ backgroundColor: COLORS.grey, width: '100%', height: 0.9 }} />
                            <XAxis
                                data={this.state.graphData}
                                scale={scale.scaleBand}
                                formatLabel={(value, index) => (index + 1)}
                                labelStyle={{ color: 'black' }}
                                style={{ marginTop: 8 }}
                            />
                        </View>
                    </View>
                    <Text style={{ color: COLORS.darkGrey, fontSize: 12, marginStart: 20, paddingStart: 10 }}>{getValue(LABEL.axes, this.state.langId)}</Text>
                    <TouchableOpacity
                        style={{ alignSelf: 'center', bottom: 20, position: 'absolute', }}
                        activeOpacity={0.7}
                        onPress={() => this.props.navigation.replace('quizResultActivity', { 'data': this.state.data, 'questionData': this.state.questionData, 'isPreAssessment': this.state.isPreAssessment, 'isFromDetailActivity': this.state.isFromDetailActivity })}>
                        <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={{ width: 130, height: 30, borderRadius: 15, }}>
                            <Text style={{ color: COLORS.white, fontSize: 12, alignSelf: 'center', paddingVertical: 5 }}> {getValue(LABEL.VIEWSOLUTION, this.state.langId)} </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View >
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

export default SummeryActivity

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