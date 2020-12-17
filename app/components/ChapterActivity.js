import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import AsyncStorage from '@react-native-community/async-storage';
import FooterLayout from './FooterLayout';
import { DrawerActions } from "react-navigation-drawer";
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import MESSAGE from '../values/message';
import { getMessage } from '../util/Util';

var db, topicThumbBaseURL;

class ChapterActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            subjectId: this.props.navigation.getParam("subjectId", ''),
            subjectName: this.props.navigation.getParam("subjectName", ''),
            subjectData: this.props.navigation.getParam("subjectData", ''),
            isLoading: false,
            chapters: [],
            isChaptersAvailable: true
        }
    }

    async componentDidMount() {
        topicThumbBaseURL = await url(STRING.topicThumbBaseURL);

        if (this.state.subjectData.chapters.length > 0) {
            this.setState({
                chapters: this.state.subjectData.chapters,
                isChaptersAvailable: true
            });
        } else {
            this.setState({
                isChaptersAvailable: false
            });
        }
    }

    async openDetail(item, index) {
        await AsyncStorage.setItem(STRING.CHAPTERID, item.chapterId);
        await AsyncStorage.setItem(STRING.CHAPTERNAME, item.chapterName);
        await AsyncStorage.setItem(STRING.TOPICID, item.topics[index].topicId);
        await AsyncStorage.setItem(STRING.TOPICNAME, item.topics[index].topicName);
        await AsyncStorage.setItem(STRING.VIDEOURL, item.topics[index].videoUrl + "");

        db.isMataDataExist(item.chapterId, item.chapterName);
        db.isMataDataExist(item.topics[index].topicId, item.topics[index].topicName);

        // db.isTopicViwed(isTopicVisited => {
        //     if (isTopicVisited) {
        //         this.props.navigation.navigate('topicDetailActivity', { 'topicdetail': item.topics[index] })
        //     } else {
        //         this.props.navigation.navigate('quizActivity', { 'isPreAssessment': true, 'isFromDetailActivity': false })
        //     }
        // }, item.topics[index].topicId);
        this.props.navigation.navigate('topicDetailActivity', { 'topicdetail': item.topics[index], 'chapters': item, 'subjectId': this.state.subjectId, 'topicId': item.topics[index].topicId })
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
                    source={{ uri: topicThumbBaseURL + this.state.subjectData.images.imageTwo }}
                /> */}
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 19, color: this.state.subjectData.images.imageTwoColor, position: 'absolute' }} >{this.state.subjectName}</Text>
                <View style={{ width: '100%', height: '73%', paddingTop: 10, marginTop: 150, alignSelf: 'center', position: 'absolute', bottom: 45 }}>
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
                            data={this.state.chapters}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item: chapterItem }) => (
                                <View style={{ width: '100%' }}>
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ marginTop: 15, color: this.state.subjectData.images.imageTwoColor, paddingRight:20, fontSize:15 }}>{chapterItem.chapterName}</Text>
                                    <View style={{ backgroundColor: COLORS.grey, width: '100%', height: 0.9, marginTop: 5, marginBottom: 15 }} />

                                    {chapterItem.topics.length > 0 ?
                                        <FlatList
                                            showsHorizontalScrollIndicator={false}
                                            data={chapterItem.topics}
                                            renderItem={({ item, index }) => (
                                                <View style={{ paddingEnd: 10 }}>
                                                    <TouchableOpacity
                                                        activeOpacity={0.6}
                                                        style={GLOBALSTYLE.imageThumbnailList}
                                                        // onPress={() => this.props.navigation.navigate('topicDetailActivity', { 'topicId': item.topicId, 'topicName': item.topicName, 'topicData': item })}>
                                                        onPress={() => this.openDetail(chapterItem, index)}>
                                                        {
                                                            <Image
                                                                style={{ height: '100%', width: '100%', borderRadius: 14 }}
                                                                source={{ uri: topicThumbBaseURL + item.thumbPath }} />}
                                                        <Text style={GLOBALSTYLE.thumbnailTitle} numberOfLines={2} ellipsizeMode='tail'>{item.topicName}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            //Setting the number of column
                                            horizontal={true}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                        :
                                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noTopic, this.state.langId)}</Text>
                                    }
                                </View>
                            )}
                            //Setting the number of column
                            keyExtractor={(item, index) => index.toString()}
                        />
                        :
                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noChapter, this.state.langId)}</Text>
                    }
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

export default ChapterActivity

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