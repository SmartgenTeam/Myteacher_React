import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import HeaderLayout from './HeaderLayout';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import { getMessage } from '../util/Util';

class TopicActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            chapterid: this.props.navigation.getParam("chapterid", ''),
            chapterName: this.props.navigation.getParam("chapterName", ''),
            chapterData: this.props.navigation.getParam("chapterData", ''),
            isLoading: false,
            topics: [],
            isTopicsAvailable: true
        }
    }

    componentDidMount() {
        if (this.state.chapterData.topics.length > 0) {
            this.setState({
                topics: this.state.chapterData.topics,
                isTopicsAvailable: true
            });
        } else {
            this.setState({
                isTopicsAvailable: false
            });
        }
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    render() {
        return (
            <View style={{ backgroundColor: COLORS.green, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />

                <HeaderLayout onPress={this.buttonPressed} />

                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.white }} >User Name</Text>
                <View style={GLOBALSTYLE.thumbnailContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View></View>
                    }
                    {this.state.isTopicsAvailable ?
                        <FlatList
                            data={this.state.topics}
                            renderItem={({ item }) => (
                                <View style={{ width: '50%', padding: 5 }}>
                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        style={GLOBALSTYLE.imageThumbnailList}
                                        onPress={() => this.props.navigation.navigate('topicDetailActivity', { 'topicId': item.topicId, 'topicName': item.topicName, 'topicData': item })}>
                                        {<Image style={GLOBALSTYLE.imageThumbnailList} source={{ uri: STRING.imgTopicURL + item.ImageName }} />}
                                        <Text style={GLOBALSTYLE.thumbnailTitle} numberOfLines={1} ellipsizeMode='tail'>{item.topicName}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            //Setting the number of column
                            numColumns={2}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        :
                        <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noChapter, this.state.langId)}</Text>
                    }
                </View>

                <Text style={GLOBALSTYLE.thumbnailContainerTitle} numberOfLines={1} ellipsizeMode='tail'>{this.state.chapterName}</Text>

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

export default TopicActivity

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