import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, Modal } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import AsyncStorage from '@react-native-community/async-storage';
import FooterLayout from './FooterLayout';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerActions } from "react-navigation-drawer";
import GLOBALSTYLE from '../values/style';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import MESSAGE from '../values/message';
import { getMessage, getValue } from '../util/Util';
import LABEL from '../values/label';
import SimpleToast from 'react-native-simple-toast';

var db, topicThumbBaseURL, count = 0, videoBaseURL;

class TopicDetailActivity extends Component {

    constructor(props) {

        count = 0;
        db = DBMigrationHelper.getInstance();

        super(props);
        this.state = {
            topicId: this.props.navigation.getParam("topicId", ''),
            subjectId: this.props.navigation.getParam("subjectId", ''),
            topicName: '',
            topicdetail: this.props.navigation.getParam("topicdetail", ''),
            chapterItem: this.props.navigation.getParam("chapters", ''),
            isLoading: false,
            langId: '',
            isTeacherResourceAvailable: false,
            ischeckingReview: false,
            shouldShowConfirmation: false,
            shouldShowPreConfirmation: false,
            shouldShowPostConfirmation_1: false,
            shouldShowPostConfirmation_2: false,
            postAssessmentData: {},
            isPDFExist: false,
        };
    }

    async componentDidMount() {
        videoBaseURL = await url(STRING.videoBaseURL);
        this.setStates();

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.syncQuizRecords(this.state.languageId);
            }
        );
    }

    async setStates() {
        topicThumbBaseURL = await url(STRING.topicThumbBaseURL);

        this.setState({
            topicName: await AsyncStorage.getItem(STRING.TOPICNAME),
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })

        this.isPDFExist();
    }

    async openDetail(item, index) {
        await AsyncStorage.setItem(STRING.TOPICID, item.topics[index].topicId);
        await AsyncStorage.setItem(STRING.TOPICNAME, item.topics[index].topicName);
        await AsyncStorage.setItem(STRING.VIDEOURL, item.topics[index].videoUrl + "");

        db.isMataDataExist(item.topics[index].topicId, item.topics[index].topicName);

        // db.isTopicViwed(isTopicVisited => {
        //     if (isTopicVisited) {
        //         this.props.navigation.navigate('topicDetailActivity', { 'topicdetail': item.topics[index] })
        //     } else {
        //         this.props.navigation.navigate('quizActivity', { 'isPreAssessment': true, 'isFromDetailActivity': false })
        //     }
        // }, item.topics[index].topicId);
        this.props.navigation.replace('topicDetailActivity', { 'topicdetail': item.topics[index], 'chapters': this.state.chapterItem })
    }

    isReviewTestExist(item) {
        db.getTopicTimeStamps(data => {
            if (data.length > 0) {
                this.setState({
                    timeStampDetail: []
                }, () => {
                    times = [];
                    correct = 0;
                    incorrect = 0;
                    answered = 0;
                    unAnswered = 0;

                    this.getTestScore(data);
                });
            } else {
                if (item == null) {
                    this.setState({
                        shouldShowPreConfirmation: true
                    });
                } else {
                    this.props.navigation.navigate('quizTeacherActivity', { 'itemData': item })
                }
            }
        }, this.state.subjectId, this.state.topicId, item == null ? STRING.PreAssessment : STRING.PostAssessment);
    }

    getTestScore(timeStamps) {
        try {
            if (count < timeStamps.length) {
                db.getTimeStampDetails(data => {
                    if (data != null) {
                        let ids = [], selections = [];

                        for (let i = 0; i < data.length; i++) {
                            ids[i] = data.item(i).questionCode;
                            if (data.item(i).givenAnswer == data.item(i).correctOption) {
                                correct++;
                            }
                            if (data.item(i).isAttempted) {
                                answered++;
                            } else {
                                unAnswered++;
                            }

                            selections[i] = {
                                isCorrect: data.item(i).givenAnswer == data.item(i).correctOption,
                                givenAnswer: data.item(i).givenAnswer,
                                timeTaken: data.item(i).timeTaken,
                            }
                        }

                        times.push({
                            categoryType: 1,
                            questionCodes: ids,
                            selections: selections,
                            percentage: (correct * 100) / selections.length,
                            correct: correct,
                            wrong: selections.length - correct,
                            unAnswered: unAnswered,
                        });

                        for (let i = 0; i < this.state.timeStampDetail.length; i++) {
                            let percentage1 = times[0].percentage;
                            let percentage2 = this.state.timeStampDetail[i].percentage;

                            if (percentage2 > percentage1) {
                                times[0] = this.state.timeStampDetail[i];
                            }
                        }

                        this.setState({
                            timeStampDetail: times
                        }, () => {
                            count++;
                            times = [];
                            correct = 0;
                            incorrect = 0;
                            answered = 0;
                            unAnswered = 0;
                            this.getTestScore(timeStamps);
                        });
                    }
                }, timeStamps.item(count).timeStamp);
            } else {
                count = 0;
                // this.getCount3(timeStamps);
                this.props.navigation.navigate('quizReviewTeacherActivity', { 'reviewQuestionData': this.state.timeStampDetail[0], 'data': this.state.timeStampDetail[0].selections, 'percentage': this.state.timeStampDetail[0].percentage, 'correct': this.state.timeStampDetail[0].correct, 'wrong': this.state.timeStampDetail[0].wrong, 'unAnswered': this.state.timeStampDetail[0].unAnswered });
            }
        } catch (error) {
            console.log('1', error);
        }
    }

    isPreAssessmentAttempted(resourceID, path) {
        db.getTopicTimeStamps(data => {
            if (data.length > 0 || !this.state.topicdetail.isPreAssessment) {
                if (resourceID == 2) {
                    this.props.navigation.navigate('notesActivity', { 'isFromDetailActivity': true });
                } else if (resourceID == 3) {
                    this.props.navigation.navigate('videoActivity', { 'isFromDetailActivity': true, isEncrypted: true });
                } else if (resourceID == 4) {
                    this.props.navigation.navigate('notesActivity', { 'isFromDetailActivity': true })
                } else if (resourceID == 5) {
                    this.props.navigation.navigate('youTubeVideoActivity', { 'isFromDetailActivity': true, url: ('https://www.youtube.com/embed/' + path.substring(path.indexOf("=") + 1, path.indexOf("&t=") < 0 ? path.length : path.indexOf("&t="))) });
                } else if (resourceID == 1) {
                    this.isPostAssessmentAttempted();
                }
            } else {
                SimpleToast.show(getMessage(MESSAGE.completePreTest, this.state.langId));
            }
        }, this.state.subjectId, this.state.topicId, STRING.PreAssessment);
    }

    isPostAssessmentAttempted() {
        db.getTopicTimeStamps(data => {
            console.log(data.length);
            if (data.length == 2) {
                this.reviewPostAssessment();
            } else if (data.length == 1) {
                db.getCount3(data => {
                    if (data != null) {
                        this.setState({
                            shouldShowPostConfirmation_2: true,
                            postAssessmentData: data,
                        });
                    }
                }, data.item(0).timeStamp);
            } else {
                this.setState({
                    shouldShowPostConfirmation_1: true
                });
            }
        }, this.state.subjectId, this.state.topicId, STRING.PostAssessment);
    }

    reviewPostAssessment() {
        db.getTopicTimeStamps(data => {
            if (data.length > 0) {
                this.setState({
                    timeStampDetail: []
                }, () => {
                    times = [];
                    correct = 0;
                    incorrect = 0;
                    answered = 0;
                    unAnswered = 0;

                    this.getTestScore(data);
                });
            }
        }, this.state.subjectId, this.state.topicId, STRING.PostAssessment);
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    syncQuizRecords(languageId) {
        console.log('syncQuizRecords');
        db.getUnSyncedQuizData(data => {
            let qData = [];

            if (data != null) {
                try {
                    for (let i = 0; i < data.length; i++) {
                        qData[i] = {
                            QId: data.item(i).qId,
                            QuestionCode: data.item(i).questionCode,
                            TypeId: data.item(i).typeId,
                            ComplexityId: data.item(i).complexityId,
                            BoardId: data.item(i).boardId,
                            GradeId: data.item(i).gradeId,
                            SubjectId: data.item(i).subjectId,
                            ChapterId: data.item(i).chapterId,
                            TopicId: data.item(i).topicId,
                            LanguageId: data.item(i).languageId,
                            UserId: data.item(i).userId,
                            CorrectOption: data.item(i).correctOption,
                            GivenAnswer: data.item(i).givenAnswer,
                            TimeTaken: data.item(i).timeTaken,
                            TimeStamp: data.item(i).timeStamp,
                            Status: 'true',
                        }
                    }

                    this.syncMataRecords(qData, languageId);
                } catch (error) {
                    console.log(error);
                }
            } else {
                this.syncMataRecords(qData, languageId);
            }
        });
    }

    syncMataRecords(quizData, languageId) {

        db.getUnSyncedMataData(data => {
            console.log('data', data);
            let finalObj = {
                QuizUsageDatas: quizData,
                SyllabusMetaDatas: [],
            }

            if (data != null) {
                try {
                    let metaData = [];
                    for (let i = 0; i < data.length; i++) {
                        metaData[i] = {
                            SId: data.item(i).sId,
                            CategoryDetailId: data.item(i).CategoryDetailId,
                            CategoryDetailName: data.item(i).CategoryDetailName,
                            LanguageId: languageId,
                            UserId: this.state.userId,
                            Status: 'true',
                        }
                    }

                    finalObj = {
                        QuizUsageDatas: quizData,
                        SyllabusMetaDatas: metaData,
                    }

                    this.usageSyncAPI(finalObj);

                } catch (error) {
                    console.log(error);
                }
            } else {
                this.usageSyncAPI(finalObj);
            }
        });
    }

    async usageSyncAPI(data) {
        console.log(data);

        if (data.QuizUsageDatas.length == 0 && data.SyllabusMetaDatas.length == 0) {
            console.log('Data is empty');
            return;
        }

        return fetch(await url(STRING.baseURL) + STRING.syncUsageData, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then(response => {
                const statusCode = response.status;
                const data = response.json();
                return Promise.all([statusCode, data]);
            })
            .then(([statusCode, responseJson]) => {
                if (statusCode == 200) {
                    db.updateStatus();
                }
            })
            .catch((error) => {
                console.log(error);

            });
    }

    isPDFExist() {
        console.log(videoBaseURL + this.state.topicId + "/" + this.state.topicId + ".pdf");

        let source = {
            uri: videoBaseURL + this.state.topicId + "/" + this.state.topicId + ".pdf",
            cache: true
        };

        return fetch(source.uri, {
            method: 'HEAD',
        })
            .then(response => {
                const statusCode = response.status;
                return Promise.all([statusCode]);
            })
            .then(([statusCode]) => {
                if (statusCode == 200) {
                    this.setState({
                        isPDFExist: true
                    });
                } else {
                    this.setState({
                        isPDFExist: false
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isPDFExist: false
                });
            });
    }

    render() {
        return (
            <View style={{ backgroundColor: COLORS.green, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>

                <View style={{ width: '100%', height: '90%', position: 'absolute', marginTop: 45 }}>
                    <View style={{ width: '100%', height: 250 }}>
                        <Image style={{ width: '100%', height: "100%" }}
                            source={{ uri: 'https://my-teacher-aal.s3.ap-south-1.amazonaws.com/images/' + this.state.topicdetail.thumbPath }} />
                        <Text style={{ color: COLORS.white, width: '100%', textAlign: 'center', textAlignVertical: 'center', height: 40, backgroundColor: 'rgba(10,55,0,0.5)', position: 'absolute', paddingLeft: 8, paddingRight: 8, bottom: 0 }} numberOfLines={2} ellipsizeMode='tail'>{this.state.topicName}</Text>
                    </View>
                    <ScrollView style={{ marginTop: 15, marginBottom: 20 }}>
                        <View style={{ width: '90%', elevation: 8, backgroundColor: COLORS.white, borderRadius: 8, alignSelf: "center", margin: 10 }}>
                            {/* <Text style={{ alignSelf: 'center', paddingTop: 8, paddingBottom: 8, color: COLORS.blue }}>{getValue(LABEL.teacherResource, this.state.langId)}</Text> */}
                            <ScrollView horizontal={true}>
                                <View style={{ width: '100%', height: 45, marginBottom: 8, marginTop: 8, flexDirection: 'row', alignSelf: "center" }} numCoumnls={2}>
                                    {this.state.topicdetail.isPreAssessment
                                        ?
                                        <TouchableOpacity style={{ justifyContent: 'center', width: 100 }} onPress={() => this.isReviewTestExist(null)}>
                                            <Image
                                                style={{ height: 25, width: 25, alignSelf: 'center' }}
                                                source={require('../images/ic_quiz.png')} />
                                            <Text style={{ alignSelf: 'center', paddingTop: 4, color: COLORS.blue, fontSize: 10 }}>{getValue(LABEL.preTest, this.state.langId)}</Text>
                                        </TouchableOpacity>
                                        :
                                        <View></View>
                                    }
                                    {this.state.topicdetail.isNote
                                        ?
                                        this.state.isPDFExist ?
                                            <TouchableOpacity style={{ justifyContent: 'center', width: 100 }} onPress={() => this.isPreAssessmentAttempted(2)}>
                                                <Image
                                                    style={{ height: 25, width: 20, alignSelf: 'center' }}
                                                    source={require('../images/ic_notes.png')} />
                                                <Text style={{ alignSelf: 'center', paddingTop: 4, color: COLORS.blue, fontSize: 10 }}>{getValue(LABEL.notes, this.state.langId)}</Text>
                                            </TouchableOpacity>
                                            :
                                            null
                                        :
                                        <View></View>
                                    }
                                    {this.state.topicdetail.isVideo
                                        ?
                                        <TouchableOpacity style={{ justifyContent: 'center', width: 100 }} onPress={() => this.isPreAssessmentAttempted(3)}>
                                            <Image
                                                style={{ height: 25, width: 25, alignSelf: 'center' }}
                                                source={require('../images/ic_video.png')} />
                                            <Text style={{ alignSelf: 'center', paddingTop: 4, color: COLORS.blue, fontSize: 10 }}>{getValue(LABEL.video, this.state.langId)}</Text>
                                        </TouchableOpacity>
                                        :
                                        <View></View>
                                    }
                                    {this.state.topicdetail.isPostAssessment
                                        ?
                                        <TouchableOpacity style={{ justifyContent: 'center', width: 100 }} onPress={() => this.isPreAssessmentAttempted(1)}>
                                            <Image
                                                style={{ height: 25, width: 25, alignSelf: 'center' }}
                                                source={require('../images/ic_quiz.png')} />
                                            <Text style={{ alignSelf: 'center', paddingTop: 4, color: COLORS.blue, fontSize: 10 }}>{getValue(LABEL.postTest, this.state.langId)}</Text>
                                        </TouchableOpacity>
                                        :
                                        <View></View>
                                    }
                                </View>
                            </ScrollView>
                        </View>
                        {/* <View style={{ marginTop: 15, marginBottom: 15, width: '90%', elevation: 8, backgroundColor: COLORS.white, borderRadius: 8, alignSelf: "center" }}>
                            <Text style={{ alignSelf: 'center', paddingTop: 8, paddingBottom: 8, color: COLORS.blue }}>Teacher Resource</Text>
                            <View style={{ width: '100%', height: 45, marginBottom: 8, flexDirection: 'row', alignSelf: "center" }} numCoumnls={2}>
                                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}>
                                    <Image
                                        style={{ height: 25, width: 20, alignSelf: 'center' }}
                                        source={require('../images/ic_document.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}>
                                    <Image
                                        style={{ height: 25, width: 20, alignSelf: 'center' }}
                                        source={require('../images/ic_weblink.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}>
                                    <Image
                                        style={{ height: 25, width: 25, alignSelf: 'center' }}
                                        source={require('../images/ic_youtube.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}>
                                    <Image
                                        style={{ height: 25, width: 25, alignSelf: 'center' }}
                                        source={require('../images/ic_video.png')} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}>
                                    <Image
                                        style={{ height: 25, width: 25, alignSelf: 'center' }}
                                        source={require('../images/ic_quiz.png')} />
                                </TouchableOpacity>
                            </View>
                        </View> */}

                        <Text style={{ padding: 10, color: COLORS.blue, }}>{getValue(LABEL.recommendedTopics, this.state.langId)}</Text>
                        {this.state.chapterItem.topics.length > 0 ?
                            <FlatList
                                data={this.state.chapterItem.topics}
                                renderItem={({ item, index }) => (
                                    this.state.topicdetail.topicId != item.topicId ?
                                        <View style={{ paddingEnd: 10 }}>
                                            <TouchableOpacity
                                                activeOpacity={0.6}
                                                style={GLOBALSTYLE.imageThumbnailList}
                                                // onPress={() => this.props.navigation.navigate('topicDetailActivity', { 'topicId': item.topicId, 'topicName': item.topicName, 'topicData': item })}>
                                                onPress={() => this.openDetail(this.state.chapterItem, index)}>
                                                {
                                                    <Image
                                                        style={{ height: '100%', width: '100%', borderRadius: 14 }}
                                                        source={{ uri: topicThumbBaseURL + item.thumbPath }} />}
                                                <Text style={GLOBALSTYLE.thumbnailTitle} numberOfLines={2} ellipsizeMode='tail'>{item.topicName}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        :
                                        <View></View>
                                )}
                                //Setting the number of column
                                horizontal={true}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noTopic, this.state.langId)}</Text>
                        }
                    </ScrollView>
                </View>

                <View style={styles.alertContainer} >
                    <Modal
                        visible={this.state.shouldShowConfirmation}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Image style={{ height: 70, resizeMode: 'contain', }} source={require('../images/img_alert_abstract.png')} />
                                <Text style={styles.AlertMessage}>Your test is under review by teacher</Text>
                                <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowConfirmation: false })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.ok, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    </Modal>
                </View>

                <View style={styles.alertContainer} >
                    <Modal
                        visible={this.state.shouldShowPreConfirmation}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Text style={{ fontSize: 16, color: COLORS.black, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.beginTest, this.state.langId)}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.darkGrey, textAlign: 'center', marginTop: 4 }}>{getMessage(MESSAGE.youWillHave, this.state.langId)} {'\n'} {getMessage(MESSAGE.finishTest, this.state.langId)}</Text>
                                <Text style={{ fontSize: 15, color: COLORS.black, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.areYouReady, this.state.langId)}</Text>
                                <View style={{ flexDirection: 'row', bottom: 30, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: 0.5, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowPreConfirmation: false }, () => { this.props.navigation.navigate('quizActivity', { 'isPreAssessment': true, 'isFromDetailActivity': true }); })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.ok, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 0.5, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowPreConfirmation: false, })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.CANCEL, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ fontSize: 12, color: COLORS.red, textAlign: 'center', bottom: 8, position: 'absolute' }}>{getMessage(MESSAGE.notGraded, this.state.langId)}</Text>
                            </View>
                        </View>
                    </Modal>
                </View>

                <View style={styles.alertContainer} >
                    <Modal
                        visible={this.state.shouldShowPostConfirmation_1}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Text style={{ fontSize: 16, color: COLORS.black, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.completePostTest, this.state.langId)}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.darkGrey, textAlign: 'center', marginTop: 4 }}>{getMessage(MESSAGE.youWillHave, this.state.langId)} {'\n'} {getMessage(MESSAGE.finishTest, this.state.langId)}</Text>
                                <Text style={{ fontSize: 15, color: COLORS.black, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.areYouReady, this.state.langId)}</Text>
                                <View style={{ flexDirection: 'row', bottom: 30, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: 0.5, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowPostConfirmation_1: false }, () => { this.props.navigation.navigate('quizActivity', { 'isPreAssessment': false, 'isFromDetailActivity': true }); })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.ok, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 0.5, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowPostConfirmation_1: false, })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.CANCEL, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ fontSize: 12, color: COLORS.red, textAlign: 'center', marginTop: 4, bottom: 8, position: 'absolute' }}>{getMessage(MESSAGE.gradedTest, this.state.langId)}</Text>
                            </View>
                        </View>
                    </Modal>
                </View>

                <View style={styles.alertContainer} >
                    <Modal
                        visible={this.state.shouldShowPostConfirmation_2}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Text style={{ fontSize: 16, color: COLORS.black, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.completePostTest, this.state.langId)}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.darkGrey, textAlign: 'center', marginTop: 4 }}>{getMessage(MESSAGE.scoreIs, this.state.langId)} {this.state.postAssessmentData.totalCorrectQuestion + " / " + this.state.postAssessmentData.totalQuestion}</Text>
                                <Text style={{ fontSize: 15, color: COLORS.black, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.tryAgain, this.state.langId)}</Text>
                                <View style={{ flexDirection: 'row', bottom: 33, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: 0.5, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowPostConfirmation_2: false }, () => { this.props.navigation.navigate('quizActivity', { 'isPreAssessment': false, 'isFromDetailActivity': true }); })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.ok, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 0.5, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ shouldShowPostConfirmation_2: false, })} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.CANCEL, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ fontSize: 11, color: COLORS.darkGrey, textAlign: 'center', marginTop: 4, bottom: 5, position: 'absolute' }}>{getMessage(MESSAGE.testAgain, this.state.langId)}{'\n'}{getMessage(MESSAGE.highestScore, this.state.langId)}</Text>
                            </View>
                        </View>
                    </Modal>
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

export default TopicDetailActivity

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
    alertContainer: {
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
        height: 160,
        width: '80%',
    },
    TextStyle: {
        color: COLORS.white,
        textAlign: 'center',
        fontSize: 14,
        position: 'absolute'
    }
})