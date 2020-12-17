import React, { Component } from 'react'
import { View, Text, Alert, Image, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, AppState } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import AsyncStorage from '@react-native-community/async-storage';
import MathJax from 'react-native-mathjax';
import WebView from 'react-native-webview';
import MESSAGE from '../values/message';
import Pdf from 'react-native-pdf';
import { getMessage, getValue } from '../util/Util';
import LABEL from '../values/label';

var videoBaseURL;

class NotesActivity extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isFromDetailActivity: this.props.navigation.getParam("isFromDetailActivity", true),
            languageId: '',
            topicId: '',
            topicName: '',
            videoURL: '',
            noteData: '',
            pdfURL: '',
            isHTMLAvailable: false,
            isNoteAvailable: false,
            langId: '',
        }
    }

    componentDidMount() {
        this.setStates();
    }

    async setStates() {
        videoBaseURL = await url(STRING.videoBaseURL);

        this.setState({
            topicId: await AsyncStorage.getItem(STRING.TOPICID),
            topicName: await AsyncStorage.getItem(STRING.TOPICNAME),
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            videoURL: await AsyncStorage.getItem(STRING.VIDEOURL),
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })

        this.getScriptHTMLAPI();
    }

    getScriptHTMLAPI() {
        this.setState({
            isLoading: true
        });

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
                        isNoteAvailable: false,
                        isHTMLAvailable: true,
                        pdfURL: source,
                        isLoading: false
                    });
                } else {
                    this.setState({
                        isHTMLAvailable: false,
                        isLoading: false
                    });
                    this.getNoteDataAPI();
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    async getNoteDataAPI() {
        this.setState({
            isLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getTopicNote + "topicId=" + this.state.topicId + "&langId=" + this.state.languageId, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    isLoading: false
                });

                if (responseJson.noteText.length > 0) {

                    this.setState({
                        noteData: responseJson.noteText,
                        isNoteAvailable: true
                    });
                } else {
                    this.setState({
                        isNoteAvailable: false
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
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
                <View style={GLOBALSTYLE.quizContainer}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        <View>
                            <Text style={{ alignSelf: 'center', fontSize: 13.5, color: COLORS.pink, position: 'absolute', fontWeight: 'bold', marginBottom: 10 }} numberOfLines={2} ellipsizeMode='tail' >{this.state.topicName}</Text>
                            <Text style={{ alignSelf: 'center', fontSize: 13.5, color: COLORS.pink }} ></Text>
                            {this.state.isNoteAvailable ?
                                <View style={{ marginTop: 15 }}>
                                    <MathJax
                                        // To set the font size change initial-scale=0.8 from MathJax class
                                        style={{ height: '97%', width: '100%' }} html={this.state.noteData} />
                                </View>
                                :
                                this.state.isHTMLAvailable ?
                                    <View style={{ marginTop: 15, height: '93%', width: '100%' }}>
                                        <Pdf style={{ height: '100%', width: '100%' }}
                                            source={this.state.pdfURL} />
                                    </View>
                                    :
                                    <Text style={{ paddingTop: 20, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noNotes, this.state.langId)}</Text>
                            }
                        </View>
                    }
                </View>

                <View style={{ width: '100%', position: 'absolute', bottom: 0, backgroundColor: COLORS.white, borderTopStartRadius: 25, borderTopEndRadius: 25, borderColor: COLORS.darkGrey, borderWidth: 0.5 }}>
                    <TouchableOpacity
                        onPress={() => { this.state.isFromDetailActivity ? this.props.navigation.goBack(null) : this.props.navigation.replace('videoActivity', { 'isPreAssessment': this.state.isPreAssessment, 'isFromDetailActivity': this.state.isFromDetailActivity }) }}
                        style={{ textAlign: 'center', bottom: 0, padding: 10, color: COLORS.blue, fontWeight: 'bold' }}>
                        <Text style={GLOBALSTYLE.nextPrevBtn}>{this.state.isFromDetailActivity ? getValue(LABEL.close, this.state.langId) : getValue(LABEL.next, this.state.langId)}</Text>
                    </TouchableOpacity>
                </View >
            </View>
        )
    }
}

export default NotesActivity