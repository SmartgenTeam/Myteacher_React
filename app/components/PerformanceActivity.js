import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import MESSAGE from '../values/message';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import GLOBALSTYLE from '../values/style';
import { STRING, url } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
import { PieChart } from 'react-native-svg-charts'
import LinearGradient from 'react-native-linear-gradient';
import PerformancePieLabel from '../util/PerformancePieLabel';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';

var db, userDetails, indexPS = -1, indexPC = -1, indexPT = -1, selectedIndex = 0, totalOverallSubjectPerformance = 0, totalOverallPerformance = 0, resourceBaseURL;

class PerformanceActivity extends Component {

    constructor(props) {
        super(props);

        indexPS = -1;
        indexPC = -1;
        indexPT = -1;
        selectedIndex = 0;
        db = DBMigrationHelper.getInstance();

        this.state = {
            isLoading: false,
            subjects: [],
            selectedSubject: [],
            pieChartData: [],
            performanceObj: {},
            isSubjectLoading: false,
            isSubjectsAvailable: true,
            grade: {},
            userId: '',
            easyTypeId: '',
            mediumTypeId: '',
            selectedChapterName: '',
            hardTypeId: '',
            shouldShowBackNav: false,
            langId: '',
        };
    }

    componentDidMount() {
        this.getUserDetails();
    }

    async getUserDetails() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
        resourceBaseURL = await url(STRING.resourceBaseURL);

        db.getUserDetails(user => {
            if (user == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                userDetails = user;
                this.getTypeDetails();
            }
        });
    }

    getTypeDetails() {
        db.getTypeDetails(typeIDs => {
            if (typeIDs == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                let easy, medium, hard;
                for (let i = 0; i < typeIDs.length; i++) {
                    if (typeIDs.item(i).typeName == 'Easy') {
                        easy = typeIDs.item(i).typeId;
                    } else if (typeIDs.item(i).typeName == 'Medium') {
                        medium = typeIDs.item(i).typeId;
                    } else if (typeIDs.item(i).typeName == 'Hard') {
                        hard = typeIDs.item(i).typeId;
                    }
                }
                this.setState({
                    easyTypeId: easy,
                    mediumTypeId: medium,
                    hardTypeId: hard
                }, () => {
                    this.setStates();
                })
            }
        });
    }

    async setStates() {
        this.setState({
            grade: {
                gradeId: await AsyncStorage.getItem(STRING.GRADEID),
                gradeName: await AsyncStorage.getItem(STRING.GRADENAME),
                boardId: await AsyncStorage.getItem(STRING.BOARDID),
                boardName: await AsyncStorage.getItem(STRING.BOARDNAME),
                languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            },
            userId: userDetails.id
        }, () => {
            this.getGradeFromDBIfNotExist();
        })
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
                    AsyncStorage.setItem(STRING.LANGUAGEID, grades[0].languageId);

                    this.subjectAPI(grades[0]);
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
            AsyncStorage.setItem(STRING.LANGUAGEID, this.state.grade.languageId);

            this.subjectAPI(this.state.grade);
        }
    }

    async subjectAPI(grade) {
        this.setState({
            isLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getGradesDetails + "boardId=" + grade.boardId + "&gradeId=" + grade.gradeId + "&langId=" + grade.languageId, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.length > 0) {
                    this.setState({
                        subjects: responseJson,
                        isSubjectsAvailable: true
                    }, () => {
                        let s = [];
                        for (let i = 0; i < this.state.subjects.length; i++) {
                            s[i] = {
                                subjectName: this.state.subjects[i].subjectName,
                                subjectThumbURL: this.state.subjects[i].images.imageThree,
                            };
                        }

                        let pObj = {
                            totalSubject: this.state.subjects.length,
                            overallPerformance: 0,
                            subjects: s,
                        };

                        this.setState({
                            performanceObj: pObj
                        }, () => {
                            this.getDataAsPerSubject();
                        })
                    });
                } else {
                    this.setState({
                        isSubjectsAvailable: false
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    // getDataAsPerSubject() {
    //     try {
    //         indexPC = -1;

    //         if ((indexPS + 1) < this.state.subjects.length) {
    //             indexPS++;

    //             let sObj = {
    //                 subjectID: this.state.subjects[indexPS].subjectId,
    //                 subjectName: this.state.subjects[indexPS].subjectName,
    //                 subjectThumbURL: this.state.subjects[indexPS].images.imageThree,
    //                 totalChapter: this.state.subjects[indexPS].chapters.length,
    //                 overallPerformance: 0,
    //                 isSelected: false,
    //                 chapters: [],
    //             }

    //             let sData = this.state.performanceObj;
    //             sData.subjects[indexPS] = sObj;

    //             this.setState({
    //                 performanceObj: sData
    //             }, () => {
    //                 console.log(sData);

    //                 this.getDataAsPerChapter(this.state.subjects[indexPS])
    //             })
    //         } else {
    //             console.log("*****DONE****");

    //             endTime = Math.round((new Date()).getTime());
    //             console.log(endTime - startTime);        

    //             let pData = this.state.performanceObj;
    //             pData.overallPerformance = totalOverallPerformance / pData.totalSubject;
    //             console.log(pData);

    //             this.setState({
    //                 performanceObj: pData,
    //                 selectedSubject: pData.subjects[0].chapters,
    //                 isLoading: false
    //             }, () => {
    //                 console.log(this.state.performanceObj.subjects[0].chapters[0]);

    //                 totalOverallPerformance = 0;
    //             })
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    getDataAsPerSubject() {
        try {
            indexPC = -1;
            indexPS = selectedIndex;

            let sObj = {
                subjectID: this.state.subjects[indexPS].subjectId,
                subjectName: this.state.subjects[indexPS].subjectName,
                subjectThumbURL: this.state.subjects[indexPS].images.imageThree,
                totalChapter: this.state.subjects[indexPS].chapters.length,
                overallPerformance: 0,
                isSelected: true,
                chapters: [],
            }

            let sData = this.state.performanceObj;
            sData.subjects[indexPS] = sObj;

            this.setState({
                performanceObj: sData,
                isSubjectLoading: true,
            }, () => {
                this.getDataAsPerChapter(this.state.subjects[indexPS])
            })
        } catch (error) {
            console.log(error);
        }
    }

    getDataAsPerChapter(subject) {
        try {
            indexPT = -1;

            if ((indexPC + 1) < subject.chapters.length) {
                indexPC++;

                db.getCount1(data => {
                    try {
                        let cList = {
                            totalQue: data.totalQuestion,
                            totalDistinctQue: data.totalDistinctQuestion,
                            overallPerformance: data.totalQuestion == 0 ? 0 : ((data.correctQuestion * 100) / data.totalQuestion),
                            correctQuestion: data.correctQuestion,
                            testAttempted: data.testAttempted,
                            totalTime: (data.totalTime == null || data.totalTime == '') ? 0 : data.totalTime,
                            avgTime: data.totalQuestion == 0 ? 0 : ((data.totalTime == null || data.totalTime == '') ? 0 : (data.totalTime / data.totalQuestion).toFixed(2)),
                            totalEasy: data.queCountEasy,
                            correctEasy: data.correctQueCountEasy,
                            percentageEasy: (data.queCountEasy == 0) ? 0 : ((data.correctQueCountEasy * 100) / data.queCountEasy).toFixed(0),
                            totalMedium: data.queCountMedium,
                            correctMedium: data.correctQueCountMedium,
                            percentageMedium: (data.queCountMedium == 0) ? 0 : ((data.correctQueCountMedium * 100) / data.queCountMedium).toFixed(0),
                            totalHard: data.queCountHard,
                            correctHard: data.correctQueCountHard,
                            percentageHard: (data.queCountHard == 0) ? 0 : ((data.correctQueCountHard * 100) / data.queCountHard).toFixed(0),
                            chapterID: subject.chapters[indexPC].chapterId,
                            chapterName: subject.chapters[indexPC].chapterName,
                            isSelected: false,
                            topics: [],
                        };

                        totalOverallSubjectPerformance = totalOverallSubjectPerformance + cList.overallPerformance;

                        let cData = this.state.performanceObj;
                        cData.subjects[indexPS].chapters[indexPC] = cList;

                        this.setState({
                            performanceObj: cData
                        }, () => {
                            // this.getDataAsPerChapter(this.state.subjects[indexPS]);
                            this.getDataAsPerTopic(subject, subject.chapters[indexPC])
                        })
                    } catch (error) {
                        console.log(error);
                    }
                }, userDetails.id, this.state.grade.boardId, this.state.grade.gradeId, subject.subjectId, subject.chapters[indexPC].chapterId, this.state.easyTypeId, this.state.mediumTypeId, this.state.hardTypeIdTypeId);
            } else {

                let sData = this.state.performanceObj;
                sData.subjects[indexPS].overallPerformance = totalOverallSubjectPerformance / sData.subjects[indexPS].totalChapter;

                totalOverallPerformance = totalOverallPerformance + sData.subjects[indexPS].overallPerformance;

                this.setState({
                    performanceObj: sData
                }, () => {
                    totalOverallSubjectPerformance = 0;
                    // this.getDataAsPerSubject();

                    this.setPieChart();
                })
            }
        } catch (error) {
            console.log(error);
        }
    }

    getDataAsPerTopic(subject, chapter) {
        try {
            if ((indexPT + 1) < chapter.topics.length) {
                indexPT++;

                db.getCount2(data => {
                    try {
                        if (data.topicQueCount > 0) {
                            let percentage = (data.correctQueCount * 100) / data.topicQueCount;
                            if (percentage < 60) {
                                db.getTopicName(topicData => {
                                    try {
                                        if (topicData != null) {
                                            let tData = this.state.performanceObj;
                                            let arrSize = tData.subjects[indexPS].chapters[indexPC].topics.length;

                                            if (arrSize <= 5) {
                                                tData.subjects[indexPS].chapters[indexPC].topics[arrSize] = topicData.CategoryDetailName;
                                            }

                                            this.setState({
                                                performanceObj: tData
                                            }, () => {
                                                this.getDataAsPerTopic(subject, subject.chapters[indexPC])
                                            })
                                        } else {
                                            this.getDataAsPerTopic(subject, subject.chapters[indexPC])
                                        }
                                    } catch (error) {
                                        console.log(error);
                                    }
                                }, chapter.topics[indexPT].topicId);
                            } else {
                                this.getDataAsPerTopic(subject, subject.chapters[indexPC])
                            }
                        } else {
                            this.getDataAsPerTopic(subject, subject.chapters[indexPC])
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }, userDetails.id, this.state.grade.boardId, this.state.grade.gradeId, subject.subjectId, chapter.chapterId, chapter.topics[indexPT].topicId);
            } else {
                this.getDataAsPerChapter(this.state.subjects[indexPS]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    setPieChart() {
        let pieData = [];
        let cData = this.state.performanceObj;

        for (let i = 0; i < cData.subjects[indexPS].totalChapter; i++) {
            switch (i) {
                case 0:
                    pieData.push({ key: 1, svg: { fill: '#ef5350' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 1:
                    pieData.push({ key: 2, svg: { fill: '#ec407a' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 2:
                    pieData.push({ key: 3, svg: { fill: '#ab47bc' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 3:
                    pieData.push({ key: 4, svg: { fill: '#7e57c2' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 4:
                    pieData.push({ key: 5, svg: { fill: '#5c6bc0' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 5:
                    pieData.push({ key: 6, svg: { fill: '#42a5f5' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 6:
                    pieData.push({ key: 7, svg: { fill: '#26c6da' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 7:
                    pieData.push({ key: 8, svg: { fill: '#26a69a' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 8:
                    pieData.push({ key: 9, svg: { fill: '#66bb6a' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 9:
                    pieData.push({ key: 10, svg: { fill: '#9ccc65' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 10:
                    pieData.push({ key: 11, svg: { fill: '#d4e157' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 11:
                    pieData.push({ key: 12, svg: { fill: '#ffee58' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 12:
                    pieData.push({ key: 13, svg: { fill: '#ffa726' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 13:
                    pieData.push({ key: 14, svg: { fill: '#ff7043' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 14:
                    pieData.push({ key: 15, svg: { fill: '#8d6e63' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 15:
                    pieData.push({ key: 16, svg: { fill: '#78909c' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 16:
                    pieData.push({ key: 17, svg: { fill: '#9C27B0' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 17:
                    pieData.push({ key: 18, svg: { fill: '#E91E63' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 18:
                    pieData.push({ key: 20, svg: { fill: '#F44336' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 19:
                    pieData.push({ key: 21, svg: { fill: '#2196F3' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 20:
                    pieData.push({ key: 22, svg: { fill: '#CDDC39' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 21:
                    pieData.push({ key: 23, svg: { fill: '#FFC107' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 22:
                    pieData.push({ key: 24, svg: { fill: '#FF5722' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 23:
                    pieData.push({ key: 25, svg: { fill: '#795548' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 22:
                    pieData.push({ key: 26, svg: { fill: '#607D8B' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 25:
                    pieData.push({ key: 27, svg: { fill: '#009688' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 26:
                    pieData.push({ key: 28, svg: { fill: '#FFC107' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 27:
                    pieData.push({ key: 29, svg: { fill: '#00BCD4' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 28:
                    pieData.push({ key: 30, svg: { fill: '#512DA8' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
                case 29:
                    pieData.push({ key: 31, svg: { fill: '#E64A19' }, value: (cData.subjects[indexPS].chapters[i].overallPerformance).toFixed(0) + "%", amount: (cData.subjects[indexPS].totalChapter / 100), onPress: () => this.setChapterLabel(cData.subjects[indexPS].chapters[i].chapterName) });
                    break;
            }
        }

        cData.overallPerformance = totalOverallPerformance / cData.totalSubject;

        this.setState({
            performanceObj: cData,
            selectedSubject: cData.subjects[selectedIndex].chapters,
            pieChartData: pieData,
            isLoading: false,
            isSubjectLoading: false,
            selectedChapterName: ''
        }, () => {
            totalOverallPerformance = 0;
        })
    }

    changeSubject(index) {
        let sData = this.state.performanceObj;
        for (let i = 0; i < sData.subjects.length; i++) {
            sData.subjects[i].isSelected = false;
        }

        this.setState({
            performanceObj: sData,
        }, () => {
            selectedIndex = index;
            this.getDataAsPerSubject();
        })
    }

    setChapterLabel(chapterName) {
        this.setState({
            selectedChapterName: chapterName,
        });
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                {/* <Image
                    style={{ width: 130, height: 130, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_performance.png')}
                /> */}
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 35, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >{getValue(LABEL.performance, this.state.langId)}</Text>

                <View style={{ position: 'absolute', width: '100%', height: '80%', marginTop: 130, }}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        this.state.performanceObj.totalSubject > 0 ?
                            <View style={{ height: '100%', flexDirection: 'column' }}>
                                <FlatList
                                    data={this.state.performanceObj.subjects}
                                    showsHorizontalScrollIndicator={false}
                                    style={{ position: 'absolute' }}
                                    renderItem={({ item: subjectItem, index }) => (
                                        <View style={{ paddingEnd: 10 }}>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={{ alignItems: 'center', height: 80, width: 100, }}
                                                // onPress={() => this.props.navigation.navigate('topicDetailActivity', { 'topicId': item.topicId, 'topicName': item.topicName, 'topicData': item })}>
                                                onPress={() => this.changeSubject(index)}>
                                                <Image
                                                    style={{ height: 55, width: 55, borderRadius: 14, resizeMode: 'contain' }}
                                                    source={{ uri: resourceBaseURL + subjectItem.subjectThumbURL }} />
                                                <Text style={{ color: COLORS.black, width: '100%', textAlign: 'center', textAlignVertical: 'center', position: 'absolute', paddingStart: 8, paddingEnd: 8, bottom: 4, }} numberOfLines={1} ellipsizeMode='tail'>{subjectItem.subjectName}</Text>
                                                {subjectItem.isSelected ?
                                                    <View style={{ width: '85%', alignSelf: 'center', backgroundColor: COLORS.black, height: 1.5, bottom: 0, position: 'absolute' }}></View>
                                                    :
                                                    <View></View>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    //Setting the number of column
                                    horizontal={true}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                                <View style={{ paddingStart: 10, paddingEnd: 10, paddingTop: 10, width: '100%', marginTop: 80 }}>
                                    <FlatList
                                        data={this.state.selectedSubject}
                                        showsVerticalScrollIndicator={false}
                                        style={{ height: '100%' }}
                                        renderItem={({ item: chapterItem, index }) => (
                                            <View>
                                                {index == 0 ?
                                                    <View
                                                        style={{ paddingTop: 20, margin: 10, elevation: 4, backgroundColor: COLORS.white, borderTopStartRadius: 15, borderBottomEndRadius: 15, borderTopEndRadius: 4, borderBottomStartRadius: 4, }}>
                                                        <PieChart
                                                            style={{ height: 180, width: 180, alignSelf: 'center' }}
                                                            valueAccessor={({ item }) => item.amount}
                                                            data={this.state.pieChartData}
                                                            outerRadius={'97%'}
                                                            innerRadius={'42%'}
                                                        >
                                                            <PerformancePieLabel />
                                                        </PieChart>
                                                        <Text style={{ marginTop: 10, color: COLORS.black, fontWeight: 'bold', textAlign: 'center', alignSelf: 'center', textAlignVertical: 'center', height: '100%', position: "absolute" }} numberOfLines={2} ellipsizeMode='tail'>{(this.state.performanceObj.subjects[indexPS].overallPerformance).toFixed(0)}%{"\n"}{getValue(LABEL.overall, this.state.langId)}</Text>
                                                        {this.state.selectedChapterName != '' ?
                                                            <Text style={{ color: COLORS.black, width: '100%', paddingStart: 10, paddingEnd: 10, paddingTop: 5, textAlign: 'center' }} numberOfLines={1} ellipsizeMode='tail'>{this.state.selectedChapterName}</Text>
                                                            :
                                                            <Text style={{ color: COLORS.black, paddingTop: 5, width: '0%' }}></Text>
                                                        }
                                                    </View>
                                                    :
                                                    <View></View>
                                                }
                                                <TouchableOpacity
                                                    activeOpacity={1}
                                                    style={{ margin: 10, elevation: 4, backgroundColor: COLORS.white, borderTopStartRadius: 15, borderBottomEndRadius: 15, borderTopEndRadius: 4, borderBottomStartRadius: 4, }}>
                                                    <View>
                                                        <Text style={{ color: COLORS.black, width: '100%', padding: 12 }} numberOfLines={2} ellipsizeMode='tail'>{chapterItem.chapterName}</Text>
                                                        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 8, alignSelf: 'center', width: '90%' }}>
                                                            <View style={{ flexDirection: 'column', alignSelf: 'center', flex: 0.33 }}>
                                                                <Image
                                                                    style={{ height: 25, width: 25, alignSelf: 'center', resizeMode: 'contain' }}
                                                                    source={require('../images/ic_correct_que.png')} />
                                                                <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 8 }}>{getValue(LABEL.question, this.state.langId)}{"\n"}{getValue(LABEL.correct, this.state.langId)}</Text>
                                                                <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>{chapterItem.correctQuestion}/{chapterItem.totalQue}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'column', alignSelf: 'center', flex: 0.33 }}>
                                                                <Image
                                                                    style={{ height: 25, width: 25, alignSelf: 'center', resizeMode: 'contain' }}
                                                                    source={require('../images/ic_test_attempted.png')} />
                                                                <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 8 }}>{getValue(LABEL.test, this.state.langId)}{"\n"}{getValue(LABEL.attempted, this.state.langId)}</Text>
                                                                <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>{chapterItem.testAttempted}</Text>
                                                                {/* <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>{chapterItem.testAttempted}/{chapterItem.totalDistinctQue}</Text> */}
                                                            </View>
                                                            <View style={{ flexDirection: 'column', alignSelf: 'center', flex: 0.33 }}>
                                                                <Image
                                                                    style={{ height: 25, width: 25, alignSelf: 'center', resizeMode: 'contain' }}
                                                                    source={require('../images/ic_avg_time.png')} />
                                                                <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 8 }}>{getValue(LABEL.avgTime, this.state.langId)}/{"\n"}{getValue(LABEL.question, this.state.langId)}</Text>
                                                                <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>{chapterItem.avgTime}s</Text>
                                                            </View>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', marginTop: 15, alignSelf: 'center', width: '80%' }}>
                                                            <Text style={{ fontSize: 11, flex: 0.2, textAlign: 'center' }}>{getValue(LABEL.easy, this.state.langId)}</Text>
                                                            <View style={{ flex: 0.6, height: 4, alignSelf: 'center', backgroundColor: COLORS.grey_light }}>
                                                                <LinearGradient
                                                                    colors={[chapterItem.percentageEasy > 80 ? COLORS.green : chapterItem.percentageEasy > 35 ? COLORS.orange : COLORS.red,
                                                                    chapterItem.percentageEasy > 80 ? COLORS.green : chapterItem.percentageEasy > 35 ? COLORS.orange : COLORS.red]}
                                                                    style={[
                                                                        styles.inner, { width: chapterItem.percentageEasy + "%" },
                                                                    ]}
                                                                />
                                                            </View>
                                                            <Text style={{ fontSize: 11, textAlign: 'center', flex: 0.2 }}>{chapterItem.percentageEasy}%</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', marginTop: 8, alignSelf: 'center', width: '80%' }}>
                                                            <Text style={{ fontSize: 11, flex: 0.2, textAlign: 'center' }}>{getValue(LABEL.medium, this.state.langId)}</Text>
                                                            <View style={{ flex: 0.6, height: 4, alignSelf: 'center', backgroundColor: COLORS.grey_light }}>
                                                                <LinearGradient
                                                                    colors={[chapterItem.percentageMedium > 80 ? COLORS.green : chapterItem.percentageMedium > 35 ? COLORS.orange : COLORS.red,
                                                                    chapterItem.percentageMedium > 80 ? COLORS.green : chapterItem.percentageMedium > 35 ? COLORS.orange : COLORS.red]}
                                                                    style={[
                                                                        styles.inner, { width: chapterItem.percentageMedium + "%" },
                                                                    ]}
                                                                />
                                                            </View>
                                                            <Text style={{ fontSize: 11, textAlign: 'center', flex: 0.2 }}>{chapterItem.percentageMedium}%</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 8, alignSelf: 'center', width: '80%' }}>
                                                            <Text style={{ fontSize: 11, flex: 0.2, textAlign: 'center' }}>{getValue(LABEL.hard, this.state.langId)}</Text>
                                                            <View style={{ flex: 0.6, height: 4, alignSelf: 'center', backgroundColor: COLORS.grey_light }}>
                                                                <LinearGradient
                                                                    colors={[chapterItem.percentageHard > 80 ? COLORS.green : chapterItem.percentageHard > 35 ? COLORS.orange : COLORS.red,
                                                                    chapterItem.percentageHard > 80 ? COLORS.green : chapterItem.percentageHard > 35 ? COLORS.orange : COLORS.red]}
                                                                    style={[
                                                                        styles.inner, { width: chapterItem.percentageHard + "%" },
                                                                    ]}
                                                                />
                                                            </View>
                                                            <Text style={{ fontSize: 11, textAlign: 'center', flex: 0.2 }}>{chapterItem.percentageHard}%</Text>
                                                        </View>
                                                        {chapterItem.topics.length > 0 ?
                                                            <View>
                                                                <Text style={{ color: COLORS.black, textAlign: 'left', width: '100%', marginStart: 30, marginTop: 12, marginBottom: 10, fontWeight: 'bold', fontSize: 12 }} numberOfLines={2} ellipsizeMode='tail'>{getValue(LABEL.needFocus, this.state.langId)}</Text>
                                                                <FlatList
                                                                    data={chapterItem.topics}
                                                                    renderItem={({ item: topicItem, index }) => (
                                                                        <View style={{ borderRadius: 15, elevation: 1, marginStart: 30, marginEnd: 30, marginBottom: 10, backgroundColor: COLORS.white }}>
                                                                            <Text style={{ color: COLORS.black, width: '100%', textAlignVertical: 'center', paddingStart: 12, paddingEnd: 12, paddingTop: 10, paddingBottom: 10, fontSize: 11.5 }} numberOfLines={1} ellipsizeMode='tail'>{topicItem}</Text>
                                                                        </View>
                                                                    )}
                                                                    //Setting the number of column
                                                                    keyExtractor={(item, index) => index.toString()}
                                                                />
                                                            </View>
                                                            :
                                                            <View></View>
                                                        }
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                    {this.state.isSubjectLoading
                                        ?
                                        <View style={{ margin: 20, position: 'absolute', alignSelf: 'center' }}>
                                            <ActivityIndicator size="small" />
                                        </View>
                                        :
                                        <View></View>
                                    }
                                </View>
                            </View>
                            :
                            <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noSubjects, this.state.langId)}</Text>
                    }
                </View>
            </View >
        )
    }
}

export default PerformanceActivity


const styles = StyleSheet.create({
    inner: {
        width: "100%",
        height: 4,
    }
})