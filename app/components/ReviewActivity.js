import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, Animated } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import * as scale from 'd3-scale'
import LinearGradient from 'react-native-linear-gradient';

var db, count = 0, times = [];

class ReviewActivity extends Component {

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        count = 0;
        times = [];
        db = DBMigrationHelper.getInstance();

        this.state = {
            data: this.props.navigation.getParam("data", ''),
            timeStamps: this.props.navigation.getParam("timeStamps", ''),
            type: this.props.navigation.getParam("type", '1'),
            timeStampDetail: [],
            scoreData: [],
            graphData: [],
        };
    }

    componentDidMount() {
        this.getTestScore();
    }

    getTestScore() {
        try {
            if (count < this.state.timeStamps.length) {
                db.getTimeStampDetails(data => {
                    if (data != null) {
                        let ids = [], selections = [];
                        for (let i = 0; i < data.length; i++) {
                            ids[i] = data.item(i).questionCode;
                            selections[i] = {
                                correctOption: data.item(i).correctOption,
                                givenAnswer: data.item(i).givenAnswer,
                                timeTaken: data.item(i).timeTaken,
                            }
                        }

                        times.push({
                            categoryType: this.state.type,
                            questionCodes: ids,
                            selections: selections,
                        })

                        this.setState({
                            timeStampDetail: times
                        }, () => {
                            count++;
                            this.getTestScore();
                        });
                    }
                }, this.state.timeStamps.item(count).timeStamp);
            } else {
                count = 0;
                this.getCount3();
            }
        } catch (error) {
            console.log(error);
        }
    }

    getCount3() {
        try {
            if (count < this.state.timeStamps.length) {
                let qData = [...this.state.timeStampDetail];

                db.getCount3(data => {
                    if (data != null) {
                        qData[count] = {
                            ...qData[count],
                            percentage: data.percentage,
                            totalCorrectQuestion: data.totalCorrectQuestion,
                            totalQuestion: data.totalQuestion,
                        };

                        this.setState({
                            timeStampDetail: qData
                        }, () => {
                            count++;
                            this.getCount3();
                        });
                    }
                }, this.state.timeStamps.item(count).timeStamp);
            } else {
                this.setState({
                    scoreData: this.state.timeStampDetail,
                }, () => {
                    // console.log(this.state.scoreData);
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    performClick(item) {
        this.props.navigation.replace('quizReviewActivity', { 'reviewQuestionData': item })
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
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >Review Summary</Text>
                <View style={{ width: '90%', height: '75%', marginTop: 150, alignSelf: 'center', position: 'absolute', backgroundColor: COLORS.white, elevation: 5, borderRadius: 8 }}>
                    <View style={{ padding: 10, marginTop: 15 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Score</Text>
                        <View style={{ height: 0.5, width: '100%', backgroundColor: COLORS.darkGrey, marginBottom: 8, marginTop: 4 }}></View>
                        <FlatList
                            data={this.state.scoreData}
                            style={{ width: '100%', height: '93%' }}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.performClick(item)}>
                                    <View style={{ alignContent: 'center', height: 50, margin: 10, elevation: 4, backgroundColor: COLORS.white, borderRadius: 10, padding: 5 }}>
                                        <Text style={{ fontSize: 11, marginEnd: 10 }}>Test {index + 1 < 10 ? "0" : ''}{index + 1}</Text>
                                        <View style={{ width: '100%', marginTop: 8, height: 15, backgroundColor: item.percentage > 70 ? COLORS.green1 : item.percentage > 40 ? COLORS.red1 : '#FAF1EE', borderRadius: 25 }}>
                                            <LinearGradient
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                colors={[item.percentage > 70 ? COLORS.green : item.percentage > 40 ? '#FB8C00' : '#FF0904', item.percentage > 70 ? COLORS.green_light : item.percentage > 40 ? COLORS.red_light : '#FFCCCC']}
                                                style={[
                                                    styles.inner, { width: item.percentage + "%" },
                                                ]}
                                            />
                                            <Animated.Text style={styles.label}>
                                                {item.totalCorrectQuestion}/{item.totalQuestion}
                                                </Animated.Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            horizontal={false}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View >
            </View >
        )
    }
}

export default ReviewActivity

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