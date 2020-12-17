import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, PanResponder, BackHandler } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-community/async-storage';
import KeepAwake from 'react-native-keep-awake';

var videoURL, videoBaseURL;

import { NativeModules } from 'react-native';
import LABEL from '../values/label';
import { getValue } from '../util/Util';
import Orientation from 'react-native-orientation';
var ServiceModule = NativeModules.ServiceModule;

class VideoActivity extends Component {

    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.stopTouch = this.visibleInteractivePoints.bind(this);

        this.state = {
            isLoading: false,
            isFromDetailActivity: this.props.navigation.getParam("isFromDetailActivity", true),
            languageId: '',
            topicId: '',
            topicName: '',
            videoURL: 'http://www.dummyurl.com/dummy.mp4',
            fileName: '',
            isNoteAvailable: false,
            langId: '',
            iconName: require('../images/ic_full_screen.png'),
            getViewX: 0,
            getViewY: 0,
            shouldHideInteractivePoints: false,
            interactiveData: [],
            interactiveQuestionData: [],
            videoDuration: 0,
            setX: [],
            isPaused: false,
        }
    }

    componentDidMount() {
        KeepAwake.activate();
        this.setStates();
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => { },
            onPanResponderMove: (evt, gestureState) => { },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                this.visibleInteractivePoints();
            },
            onPanResponderTerminate: (evt, gestureState) => { },
            onShouldBlockNativeResponder: (evt, gestureState) => { true; },
        });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    async setStates() {
        videoBaseURL = await url(STRING.videoBaseURL);

        this.setState({
            topicId: await AsyncStorage.getItem(STRING.TOPICID),
            topicName: await AsyncStorage.getItem(STRING.TOPICNAME),
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            fileName: await AsyncStorage.getItem(STRING.VIDEOURL),
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })


        // ServiceModule.getDynamicPort((err) => {
        // }, (PORT) => {
        //     videoURL = STRING.servieBaseURL + PORT + "/" + videoBaseURL + this.state.fileName;

        //     this.setState({
        //         videoURL: videoURL,
        //     })
        // });
        this.setState({
            videoURL: videoBaseURL + this.state.fileName,
        }, () => {
            console.log(this.state.videoURL);
        });

        this.getInteractivePointsAPI();
    }

    goBack() {
        Orientation.lockToPortrait();
        this.props.navigation.goBack(null)
    }

    handleBackButtonClick() {
        this.goBack();
        return true;
    }

    doFullScreen() {
        Orientation.getOrientation((err, orientation) => {
            if (orientation === 'PORTRAIT') {
                Orientation.lockToLandscape();
                this.setState({
                    iconName: require('../images/ic_small_screen.png'),
                    interactiveData: this.state.interactiveData,
                });
            } else {
                Orientation.lockToPortrait();
                this.setState({
                    iconName: require('../images/ic_full_screen.png'),
                    interactiveData: this.state.interactiveData,
                });
            }
        })
    }

    async getInteractivePointsAPI() {
        this.setState({
            isLoading: true,
        });

        console.log(await url(STRING.liveClassBaseUrl) + STRING.topicInteractive + this.state.topicId + "&language=" + this.state.languageId);
        return fetch(await url(STRING.liveClassBaseUrl) + STRING.topicInteractive + this.state.topicId + "&language=" + this.state.languageId, {
            // return fetch('http://3.6.66.252:5001/api/InteractiveVideo/TopicInteractive?id=PH12041&language=ENG-101', {
            method: 'GET',
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
                    this.setState({
                        interactiveData: responseJson.quizDetailsList,
                        interactiveQuestionData: responseJson.quizDetailsList,
                        isLoading: false,
                    }, () => {
                    });
                } else {
                    this.setState({
                        isLiveClassAvailable: false,
                        isLoading: false,
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    displayOptions() {
        if (this.state.shouldHideInteractivePoints || this.state.isLoading || this.state.setX.length <= 0) {
            return null
        } else {
            console.log('FINAL: ', this.state.setX);
            return this.state.setX.map(data => (
                <View
                    style={{ position: 'absolute', right: data, top: this.state.getViewY - 40 }}>
                    <Image
                        style={{ width: 25, height: 25, }}
                        source={require('../images/img_brainstrom.png')}
                    />
                </View>
            ));
        }
    }

    visibleInteractivePoints() {
        clearInterval(this.interval);
        this.interval = setInterval(() =>
            this.setState({
                shouldHideInteractivePoints: true,
            }, () => {
                clearInterval(this.interval);
            })
            , 4900);
        this.setState({
            shouldHideInteractivePoints: false,
        })
    }

    setInteractiveAxis(event) {
        let setX = [];
        for (let i = 0; i < this.state.interactiveData.length; i++) {
            let x1 = 50;
            let x2 = this.state.getViewX - 50;
            let temp = (this.state.interactiveData[i].duration * 100) / event.duration

            setX[i] = ((x1 + ((x2 - x1) * temp) / 100) - 5);
        }

        this.setState({
            videoDuration: event.duration,
            setX: setX
        }, () => {
            this.visibleInteractivePoints();
        });
    }

    checkForPoints(seekPos) {
        this.state.interactiveQuestionData.forEach(element => {
            if (element.duration < seekPos) {
                this.setState({
                    isPaused: true,
                    interactiveQuestionData: this.state.interactiveQuestionData.splice(1, this.state.interactiveQuestionData.length - 1),
                }, () => {
                    this.props.navigation.navigate('quizInteractiveActivity', { 'data': element });
                });
                return true;
            }
        });
    }

    render() {
        return (
            <View style={{ backgroundColor: COLORS.black, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                {/* <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                /> */}
                {/* <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                {/* <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity> */}
                <View style={{ opacity: 1, backgroundColor: COLORS.black, height: '90%', width: '100%', position: 'absolute', marginTop: 50 }}>
                    {/* <Video source={{ 
                        uri: this.state.videoURL,
                        headers: {
                            'Referer': 'http://3.7.171.194/'
                        }
                     }}   // Can be a URL or a local file.

                        ref={(ref) => {
                            this.player = ref
                        }}                                      // Store reference
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        style={styles.backgroundVideo}
                        controls={true} /> */}
                    <Video source={{
                        uri: this.state.videoURL,
                        headers: {
                            'Referer': 'http://3.7.171.194/'
                        }
                    }}   // Can be a URL or a local file.
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        style={styles.backgroundVideo}
                        controls={true}
                        paused={this.state.isPaused}
                        onLoad={event => {
                            this.setInteractiveAxis(event)
                        }}
                        onProgress={event => {
                            this.checkForPoints(Number(event.currentTime))
                        }}
                        onLayout={event => {
                            const layout = event.nativeEvent.layout;
                            this.setState({
                                getViewX: layout.width,
                                getViewY: layout.height,
                            });
                        }}
                        {...this._panResponder.panHandlers} />
                    {this.displayOptions()}
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ justifyContent: 'center', alignSelf: 'flex-end', position: 'absolute', padding: 8, marginEnd: 10, marginTop: 10, borderRadius: 8, }}
                    onPress={() => this.doFullScreen()}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={this.state.iconName} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 8, marginStart: 10, marginTop: 10, borderRadius: 8, }}
                    onPress={() => this.goBack()}>
                    <Image
                        style={{ height: 20, width: 20, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_white.png')} />
                </TouchableOpacity>


                {/* <View style={{ width: '100%', position: 'absolute', bottom: 0, backgroundColor: COLORS.white, borderTopStartRadius: 25, borderTopEndRadius: 25, borderColor: COLORS.darkGrey, borderWidth: 0.5 }}>
                    <TouchableOpacity
                        onPress={() => { this.state.isFromDetailActivity ? this.props.navigation.goBack(null) : this.props.navigation.replace('quizActivity', { 'isPreAssessment': false }) }}
                        style={{ textAlign: 'center', bottom: 0, padding: 10, color: COLORS.blue, fontWeight: 'bold' }}>
                        <Text style={GLOBALSTYLE.nextPrevBtn}>{this.state.isFromDetailActivity ? getValue(LABEL.close, this.state.langId) : getValue(LABEL.next, this.state.langId)}</Text>
                    </TouchableOpacity>
                </View> */}
            </View >
        )
    }
}

export default VideoActivity

var styles = StyleSheet.create({
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 25,
        right: 0,
    },
});