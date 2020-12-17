import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, Alert, Button } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import AsyncStorage from '@react-native-community/async-storage';
import SimpleToast from 'react-native-simple-toast';
import RBSheet from "react-native-raw-bottom-sheet";
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import MESSAGE from '../values/message';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';

var db, resourceBaseURL;

class ChapterPracticeActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            subjectId: this.props.navigation.getParam("subjectId", ''),
            subjectName: this.props.navigation.getParam("subjectName", ''),
            subjectData: this.props.navigation.getParam("subjectData", ''),
            isLoading: false,
            chapters: [],
            timeStamps: [],
            selectedItem: {},
            isChaptersAvailable: true,
            langId: '',
        }
    }

    componentDidMount() {
        this.prepareList();

        this.props.navigation.addListener(
            'didFocus',
            payload => {
                this.prepareList();
            }
        );
    }

    async prepareList() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
        resourceBaseURL = await url(STRING.resourceBaseURL);

        if (this.state.subjectData.chapters.length > 0) {

            var dummy1 = { 'chapterId': 'dummy', 'chapterName': 'dummy' };
            var dummy2 = { 'chapterId': '-1', 'chapterName': getValue(LABEL.subjectQuiz, this.state.langId) };
            var newArray = [];

            newArray = [...newArray, dummy1];
            for (let i = 0; i < this.state.subjectData.chapters.length; i++) {
                newArray = [...newArray, this.state.subjectData.chapters[i]];
            }
            newArray = [...newArray, dummy2];

            this.setLockState(newArray);
        } else {
            this.setState({
                isChaptersAvailable: false
            });
        }
    }

    async setLockState(chapters) {
        let temp = 1;
        for (let i = 0; i < chapters.length; i++) {
            chapters[i] = {
                ...chapters[i],
                visited: false,
                locked: false,
                unlocked: false,
            };

            await db.getChapterData(data => {
                if (data > 0) {
                    chapters[i] = {
                        ...chapters[i],
                        visited: true,
                    };
                    temp = i + 1;
                } else {
                    chapters[i] = {
                        ...chapters[i],
                        locked: true,
                    };
                }

                if (chapters.length - 1 == i) {
                    this.setlastObj(chapters, temp);
                }
            }, this.state.subjectId, chapters[i].chapterId);
        }
    }

    setlastObj(chapters, temp) {
        if (chapters.length - 1 >= temp) {
            chapters[temp] = {
                ...chapters[temp],
                unlocked: true
            };
        }
        if (chapters.length - 1 == temp) {
            chapters[temp] = {
                ...chapters[temp],
                visited: true,
                unlocked: false,
            };
        }

        this.setState({
            chapters: chapters,
            isChaptersAvailable: true
        });
    }

    isReviewTestExist(item, index) {
        if (item.visited || item.unlocked) {
            db.getTimeStamps(data => {
                if (data.length > 0) {
                    console.log(data);

                    this.setState({
                        timeStamps: data,
                        selectedItem: item,
                    }, () => {
                        // this.showConfirmDialog(item, index);
                        this.RBSheet.open();
                    });
                } else {
                    this.setState({
                        selectedItem: item,
                    }, () => {
                        this.openDetail(false);
                    });
                }
            }, this.state.subjectId, item.chapterId);
        } else {
            SimpleToast.show(getMessage(MESSAGE.completeChaps, this.state.langId));
        }
    }

    // showConfirmDialog(item, index) {
    //     Alert.alert(
    //         '',
    //         'What do you want to do?',
    //         [
    //             {
    //                 text: 'REVIEW TEST',
    //                 onPress: () => this.openDetail(item, index, true)
    //             },
    //             {
    //                 text: 'START NEW TEST',
    //                 onPress: () => this.openDetail(item, index, false)
    //             },
    //         ],
    //         { cancelable: false }
    //     )
    // }

    async openDetail(bool) {
        this.RBSheet.close();
        let item = this.state.selectedItem;

        if (item.chapterId == null || item.chapterId == '-1') {
            await AsyncStorage.setItem(STRING.CHAPTERID, '-1');
        } else {
            await AsyncStorage.setItem(STRING.CHAPTERID, item.chapterId);
        }
        await AsyncStorage.setItem(STRING.CHAPTERNAME, item.chapterName);
        await AsyncStorage.setItem(STRING.TOPICID, '');
        await AsyncStorage.setItem(STRING.TOPICNAME, '');

        db.isMataDataExist(item.chapterId, item.chapterName);

        if (bool) {
            this.props.navigation.navigate('reviewActivity', { 'timeStamps': this.state.timeStamps, 'type': '1' })
        } else {
            this.props.navigation.navigate('quizPracticeActivity')
        }
    }

    _keyExtractor = (item, index) => item.id + '' + index;

    _renderItem = ({ item: chapterItem, index }) => (
        <View style={{ transform: [{ scaleY: -1 }] }}>
            <View>
                {
                    (index != 0)
                        ?
                        (index % 2 == 0)
                            ?
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 0.5, flexDirection: 'column' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={{ flex: 1 }}
                                            activeOpacity={0.6}
                                            onPress={() => this.isReviewTestExist(chapterItem, index)}>
                                            <View style={{ flex: 1 }}>
                                                <Text numberOfLines={2} ellipsizeMode='tail' style={{ width: '100%', color: COLORS.black, textAlign: 'right', paddingEnd: 10, alignSelf: 'center' }}>{chapterItem.chapterName}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            onPress={() => this.isReviewTestExist(chapterItem, index)}>
                                            <Image
                                                style={{ height: 30, width: 30, alignSelf: 'baseline' }}
                                                source={chapterItem.unlocked == true ? require('../images/ic_unlock_orange.png') : chapterItem.visited == true ? require('../images/ic_visited_orange.png') : require('../images/ic_lock_orange.png')} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 0.5 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <View style={{ width: '100%', height: 15 }} />
                                        <Image
                                            style={{ height: 80, width: 80, alignSelf: 'flex-start', }}
                                            source={require('../images/img_curve1.png')} />
                                    </View>
                                </View>
                            </View>
                            :
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 0.5 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <View style={{ width: '100%', height: 15 }} />
                                        <Image
                                            style={{ height: 80, width: 80, alignSelf: 'flex-end' }}
                                            source={require('../images/img_curve2.png')} />
                                    </View>
                                </View>
                                <View style={{ flex: 0.5, flexDirection: 'column' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            onPress={() => this.isReviewTestExist(chapterItem, index)}>
                                            <Image
                                                style={{ height: 30, width: 30, alignSelf: 'baseline' }}
                                                source={chapterItem.unlocked == true ? require('../images/ic_unlock_orange.png') : chapterItem.visited == true ? require('../images/ic_visited_orange.png') : require('../images/ic_lock_orange.png')} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ flex: 1 }}
                                            activeOpacity={0.6}
                                            onPress={() => this.isReviewTestExist(chapterItem, index)}>
                                            <View style={{ flex: 1 }}>
                                                <Text numberOfLines={2} ellipsizeMode='tail' style={{ width: '100%', color: COLORS.black, textAlign: 'left', paddingEnd: 5, paddingStart: 5, alignSelf: 'center' }}>{chapterItem.chapterName}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        :
                        <View style={{ height: 60, width: 60, bottom: 10, alignSelf: 'center', justifyContent: 'center' }}>
                            <Image
                                style={{ height: 60, width: 60, alignSelf: 'center' }}
                                source={require('../images/img_start.png')} />
                            <Text style={{ position: 'absolute', color: COLORS.white, alignSelf: 'center' }}>{getValue(LABEL.start, this.state.langId)}</Text>
                        </View>
                }
            </View>
        </View>
    )

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
                    source={{ uri: resourceBaseURL + this.state.subjectData.images.imageTwo }}
                /> */}
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 19, color: this.state.subjectData.images.imageTwoColor, position: 'absolute' }} >{this.state.subjectName}</Text>
                <View style={{ width: '100%', height: '85%', bottom: 40, paddingTop: 10, position: 'absolute' }}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View></View>
                    }
                    {this.state.isChaptersAvailable ?
                        <FlatList
                            style={{ transform: [{ scaleY: -1 }] }}
                            renderItem={this._renderItem}
                            keyExtractor={this._keyExtractor}
                            data={this.state.chapters}
                        />
                        :
                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noChapter, this.state.langId)}</Text>
                    }
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <RBSheet
                        ref={ref => {
                            this.RBSheet = ref;
                        }}
                        height={130}
                        duration={150}
                        customStyles={{
                            container: {
                                padding: 15,
                                borderTopStartRadius: 20,
                                borderTopEndRadius: 20,
                            }
                        }}
                    >
                        <Text style={{ marginBottom: 10 }}>{getValue(LABEL.gowith, this.state.langId)}</Text>
                        <TouchableOpacity style={{ width: '100%', padding: 8, flexDirection: 'row', }}
                            activeOpacity={0.8}
                            onPress={() => this.openDetail(false)}>
                            <Image
                                style={{ height: 20, width: 20, }}
                                source={require('../images/ic_new_test.png')} />
                            <Text style={{ textAlignVertical: 'center', marginStart: 20 }}>{getValue(LABEL.startNew, this.state.langId)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '100%', padding: 8, flexDirection: 'row', }}
                            activeOpacity={0.8}
                            onPress={() => this.openDetail(true)}>
                            <Image
                                style={{ height: 20, width: 20 }}
                                source={require('../images/ic_review_test.png')} />
                            <Text style={{ textAlignVertical: 'center', marginStart: 20 }}>{getValue(LABEL.reviewTest, this.state.langId)}</Text>
                        </TouchableOpacity>
                    </RBSheet>
                </View>
            </View >
        )
    }
}

export default ChapterPracticeActivity

const styles = StyleSheet.create({
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