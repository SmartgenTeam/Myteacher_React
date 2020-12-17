import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, Animated, ScrollView } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import PieLabel from '../util/PieLabel';
import { DrawerActions } from "react-navigation-drawer";
import { PieChart } from 'react-native-svg-charts'
import LinearGradient from 'react-native-linear-gradient';

var db;

class SummeryPaperActivity extends Component {

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        this.state = {
            data: this.props.navigation.getParam("data", ''),
            questionData: this.props.navigation.getParam("questionData", ''),
            languageId: '',
            topicId: '',
            topicName: '',
            percentage: this.props.navigation.getParam("percentage", ''),
            correct: this.props.navigation.getParam("correct", ''),
            wrong: this.props.navigation.getParam("wrong", ''),
            unAnswered: this.props.navigation.getParam("unAnswered", ''),
            statisticsData: [],
            pieData: [],
            progressImage: ''
        };
    }

    componentDidMount() {
        this.setStates();

        this.setPerformance();

        this.setStatistics();
    }

    setPerformance() {
        if (this.state.percentage >= 0 && this.state.percentage <= 40) {
            this.setState({
                speedoMeter: require('../images/img_poor.png'),
            })
        } else if (this.state.percentage > 40 && this.state.percentage <= 60) {
            this.setState({
                speedoMeter: require('../images/img_good.png'),
            })
        } else if (this.state.percentage > 60 && this.state.percentage <= 80) {
            this.setState({
                speedoMeter: require('../images/img_fair.png'),
            })
        } else if (this.state.percentage > 80 && this.state.percentage <= 100) {
            this.setState({
                speedoMeter: require('../images/img_excelent.png'),
            })
        }
    }

    async setStates() {
        this.setState({
            topicId: await AsyncStorage.getItem(STRING.TOPICID),
            topicName: await AsyncStorage.getItem(STRING.TOPICNAME),
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            videoURL: await AsyncStorage.getItem(STRING.VIDEOURL),
        })
    }

    setStatistics() {

        let sData = [];
        let lightingFast = 0, perfect = 0, slow = 0, wrong = 0;

        for (let i = 0; i < this.state.data.length; i++) {

            let timetaken, time;
            let statistics = {
                timeTakenInSec: '',
                timetaken: '',
                correctStatus: ''
            };
            let questionData = this.state.data[i];

            switch (questionData.complexityId) {
                case "e5a63e13-7711-4be2-98ff-7034ef97da6c":
                    time = questionData.timeTaken;
                    if (time == null || time == "") {
                        timetaken = 0;
                        statistics.timeTakenInSec = "0";
                    } else {
                        timetaken = (Number(time) * 100) / 30;
                        statistics.timeTakenInSec = time;
                    }
                    if (questionData.correctOption == questionData.givenAnswer) {
                        if (timetaken < 50) {
                            lightingFast++;
                        } else if (timetaken > 50 && timetaken < 100) {
                            perfect++;
                        } else if (timetaken > 100) {
                            slow++;
                        }
                        statistics.correctStatus = 1;
                        statistics.timetaken = timetaken;
                    } else {
                        wrong++;
                        statistics.correctStatus = 0;
                        statistics.timetaken = timetaken;
                    }
                    break;
                case "2cd83499-5a83-4969-bceb-2894e33afe2b":
                    time = questionData.timeTaken;
                    if (time == null || time == "") {
                        timetaken = 0;
                        statistics.timeTakenInSec = "0";
                    } else {
                        timetaken = (Number(time) * 100) / 60;
                        statistics.timeTakenInSec = time;
                    }
                    if (questionData.correctOption == questionData.givenAnswer) {
                        if (timetaken < 50) {
                            lightingFast++;
                        } else if (timetaken > 50 && timetaken < 100) {
                            perfect++;
                        } else if (timetaken > 100) {
                            slow++;
                        }
                        statistics.correctStatus = 1;
                        statistics.timetaken = timetaken;
                    } else {
                        wrong++;
                        statistics.correctStatus = 0;
                        statistics.timetaken = timetaken;
                    }
                    break;
                case "67c2f15b-3ff6-4ec5-8266-ea9fdcdf219f":
                    time = questionData.timeTaken;
                    if (time == null || time == "") {
                        timetaken = 0;
                        statistics.timeTakenInSec = "0";
                    } else {
                        timetaken = (Number(time) * 100) / 90;
                        statistics.timeTakenInSec = time;
                    }
                    if (questionData.correctOption == questionData.givenAnswer) {
                        if (timetaken < 50) {
                            lightingFast++;
                        } else if (timetaken > 50 && timetaken < 100) {
                            perfect++;
                        } else if (timetaken > 100) {
                            slow++;
                        }
                        statistics.correctStatus = 1;
                        statistics.timetaken = timetaken;
                    } else {
                        wrong++;
                        statistics.correctStatus = 0;
                        statistics.timetaken = timetaken;
                    }
                    break;

            }
            sData.push(statistics);
        }

        let pData = [];

        if (lightingFast > 0) {
            pData.push({
                key: 1,
                amount: lightingFast,
                svg: {
                    fill: '#FFD600',
                }
            });
        }
        if (perfect > 0) {
            pData.push({
                key: 2,
                amount: perfect,
                svg: {
                    fill: '#43A047',
                }
            });
        }
        if (slow > 0) {
            pData.push({
                key: 3,
                amount: slow,
                svg: {
                    fill: '#1E7ECE',
                }
            });
        }
        if (wrong > 0) {
            pData.push({
                key: 4,
                amount: wrong,
                svg: {
                    fill: '#FB8C00',
                }
            });
        }

        this.setState({
            statisticsData: sData,
            pieData: pData,
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
                <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                />
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >Summary</Text>
                <View style={{ width: '90%', height: '70%', marginTop: 150, alignSelf: 'center', position: 'absolute', backgroundColor: COLORS.white, elevation: 5, borderRadius: 8 }}>
                    <ScrollView>
                        <View style={{ padding: 10, marginTop: 10 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Performance</Text>
                            <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.darkGrey, marginBottom: 8, marginTop: 4 }}></View>
                            <Image style={{ height: 130, alignSelf: 'center', marginTop: 10, resizeMode: 'contain' }} source={this.state.speedoMeter} />
                            <TouchableOpacity
                                style={{ alignSelf: 'center', marginTop: 35 }}
                                activeOpacity={0.7}
                                onPress={() => this.props.navigation.replace('quizPaperResultActivity', { 'data': this.state.data, 'questionData': this.state.questionData })}>
                                <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={{ width: 130, height: 30, borderRadius: 15, }}>
                                    <Text style={{ color: COLORS.white, fontSize: 12, alignSelf: 'center', paddingVertical: 5 }}> VIEW SOLUTION </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 10, marginTop: 10 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Score</Text>
                            <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.darkGrey, marginBottom: 8, marginTop: 4 }}></View>
                            <PieChart
                                style={{ height: 180, width: 180, alignSelf: 'center' }}
                                valueAccessor={({ item }) => item.amount}
                                value={12}
                                data={this.state.pieData}
                                spacing={0}
                                outerRadius={'95%'}
                            >
                                <PieLabel />
                            </PieChart>
                            <View style={{ flexDirection: 'row', marginTop: 15, alignItems: 'center', alignSelf: 'center' }}>
                                <View style={{ height: 10, width: 10, backgroundColor: '#FFD600' }} />
                                <Text style={{ fontSize: 12, marginStart: 3 }}>Lightning Fast</Text>
                                <View style={{ height: 10, width: 10, backgroundColor: '#43A047', marginStart: 5 }} />
                                <Text style={{ fontSize: 12, marginStart: 3 }}>Perfect</Text>
                                <View style={{ height: 10, width: 10, backgroundColor: '#1E7ECE', marginStart: 5 }} />
                                <Text style={{ fontSize: 12, marginStart: 3 }}>Slow Going</Text>
                                <View style={{ height: 10, width: 10, backgroundColor: '#FB8C00', marginStart: 5 }} />
                                <Text style={{ fontSize: 12, marginStart: 3 }}>Incorrect</Text>
                            </View>
                        </View>
                        <View style={{ padding: 10, marginTop: 15 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Statistics</Text>
                            <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.darkGrey, marginBottom: 8, marginTop: 4 }}></View>
                            <FlatList
                                data={this.state.statisticsData}
                                style={{ width: '100%' }}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        activeOpacity={0.9}>
                                        <View style={{ flexDirection: 'row', width: "100%", height: 15, marginTop: 10, }}>
                                            <Text style={{ fontSize: 11, marginEnd: 10 }}>Q{index + 1 < 10 ? "0" : ''}{index + 1}</Text>
                                            <View style={{ flex: 1, alignContent: 'center', width: '100%', backgroundColor: item.correctStatus == 1 ? COLORS.green1 : COLORS.red1, borderRadius: 25 }}>
                                                <LinearGradient
                                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                    colors={[item.correctStatus == 1 ? COLORS.green : '#FB8C00', item.correctStatus == 1 ? COLORS.green_light : COLORS.red_light]}
                                                    style={[
                                                        styles.inner, { width: item.timetaken + "%" },
                                                    ]}
                                                />
                                                <Animated.Text style={styles.label}>
                                                    {item.timeTakenInSec}s
                                                </Animated.Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                horizontal={false}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </ScrollView>
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

export default SummeryPaperActivity

const styles = StyleSheet.create({
    inner: {
        width: "100%",
        height: 15,
        borderRadius: 25,
    },
    label: {
        fontSize: 11,
        color: COLORS.black,
        position: "absolute",
        zIndex: 1,
        alignSelf: "flex-end",
        paddingEnd: 10
    }
})