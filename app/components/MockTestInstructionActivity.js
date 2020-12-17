import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import GLOBALSTYLE from '../values/style';
import FooterLayout from './FooterLayout';
import MESSAGE from '../values/message';
import { DrawerActions } from "react-navigation-drawer";
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import SimpleToast from 'react-native-simple-toast';
import RBSheet from "react-native-raw-bottom-sheet";

var db;

class MockTestInstructionActivity extends Component {

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            isLoading: false,
            isYearAvailable: true,
            subjectId: this.props.navigation.getParam("subjectId", ''),
            paperTitle: this.props.navigation.getParam("paperTitle", ''),
            shouldShowBackNav: false,
            itemList: [],
            selectedItem: {},
            languageId: '',
        };
    }

    componentDidMount() {
        this.setStates();
    }

    async setStates() {
        this.setState({
            languageId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })

        this.getPaperListAPI();
    }

    async getPaperListAPI() {
        this.setState({
            isLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getAllMockTestQuestions + "subjectId=" + this.state.subjectId + "&langId=" + this.state.languageId, {
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

                if (responseJson.length > 0) {
                    this.setState({
                        isPaperListAvailable: true,
                        itemList: responseJson,
                    });
                    // this.preparePaperList(responseJson);
                } else {
                    this.setState({
                        isPaperListAvailable: false
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false,
                    isPaperListAvailable: false
                });
            });
    }

    // preparePaperList(responseJson){
    //     let paperList =[], subPaperList = [];
    //     let itemCount = -1, subItemCount = -1;
    //     console.log(responseJson[0]);


    //     for (let i = 0; i < responseJson.length; i++) {
    //         subItemCount++;
    //         if(i % 10 == 0){
    //             itemCount++;
    //             subItemCount = 0;
    //             subPaperList = [];
    //             let startRange = (itemCount*10) + 1;
    //             let endRange = (itemCount+1)*10 > responseJson.length ? responseJson.length : (itemCount+1)*10;

    //             subPaperList[subItemCount] = responseJson[i];

    //             paperList[itemCount] = {
    //                 title: "Q" + startRange + " - " + endRange,
    //                 item: subPaperList
    //             }
    //         } else {
    //             subPaperList[subItemCount] = responseJson[i];
    //         }
    //     }
    //     this.setState({
    //         itemList: paperList,
    //     });     
    // }

    openPaper() {
        let item = this.state.itemList;

        if (item.length > 0) {
            this.props.navigation.replace('quizMockActivity', { 'item': item })
        } else {
            SimpleToast.show(MESSAGE.invalidTest);
        }
    }

    async isReviewTestExist() {
        let SUBJECTID = await AsyncStorage.getItem(STRING.SUBJECTID);
        let CHAPTERID = await AsyncStorage.getItem(STRING.CHAPTERID);

        db.getTimeStamps(data => {
            if (data.length > 0) {
                this.setState({
                    timeStamps: data,
                }, () => {
                    // this.showConfirmDialog();
                    this.RBSheet.open();
                });
            } else {
                this.openPaper();
            }
        }, SUBJECTID, CHAPTERID);
    }

    // showConfirmDialog() {
    //     Alert.alert(
    //         '',
    //         'What do you want to do?',
    //         [
    //             {
    //                 text: 'REVIEW TEST',
    //                 onPress: () => this.openDetail(true)
    //             },
    //             {
    //                 text: 'START NEW TEST',
    //                 onPress: () => this.openDetail(false)
    //             },
    //         ],
    //         { cancelable: false }
    //     )
    // }

    async openDetail(bool) {
        this.RBSheet.close();

        if (bool) {
            this.props.navigation.navigate('reviewActivity', { 'timeStamps': this.state.timeStamps, 'type': '2' })
        } else {
            this.openPaper();
        }
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
                    source={require('../images/img_bg_mock.png')}
                />
                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>
                <Text style={{ marginTop: 50, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.pink, position: 'absolute' }} >{this.state.paperTitle}</Text>
                <View style={GLOBALSTYLE.thumbnailContainer}>
                    <View style={{ height: 70, width: '100%', borderRadius: 14, backgroundColor: COLORS.white, elevation: 5 }}>
                        <View style={{ flexDirection: 'row', padding: 10, marginStart: 10, alignSelf: "flex-start", position: 'absolute' }}>
                            <Image
                                style={{ height: 50, width: 50 }}
                                source={require('../images/img_que2.png')} />
                            <View style={{ flexDirection: 'column', marginStart: 15 }}>
                                <Text style={{ textAlign: 'left', fontSize: 18, color: COLORS.blue, fontWeight: "bold" }} >25</Text>
                                <Text style={{ textAlign: 'left', fontSize: 15, color: COLORS.blue, fontWeight: "bold" }} >Questions</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingEnd: 20, paddingTop: 10, alignSelf: "flex-end", position: 'absolute' }}>
                            <Image
                                style={{ height: 50, width: 50 }}
                                source={require('../images/img_clock2.png')} />
                            <View style={{ flexDirection: 'column', marginStart: 15 }}>
                                <Text style={{ textAlign: 'left', fontSize: 18, color: COLORS.blue, fontWeight: "bold" }} >60</Text>
                                <Text style={{ textAlign: 'left', fontSize: 15, color: COLORS.blue, fontWeight: "bold" }} >Minutes</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 270, marginTop: 20, width: '100%', borderRadius: 14, backgroundColor: COLORS.white, elevation: 5, }}>
                        <Text style={{ textAlign: 'left', fontSize: 15, color: COLORS.blue, fontWeight: "bold", padding: 15 }} >Instruction</Text>
                        <View style={{ flexDirection: 'row', paddingEnd: 50, width: 250, marginTop: 20, alignSelf: 'center' }}>
                            <Image
                                style={{ height: 35, width: 35, resizeMode: 'contain', alignSelf: 'center' }}
                                source={require('../images/img_note.png')} />
                            <Text style={{ textAlign: 'left', fontSize: 12, color: COLORS.blue, paddingStart: 15, fontWeight: "bold" }} >1.0 mark is awarded for correct attempts and 0.0 marks for incorrect attempts.</Text>
                        </View>
                        <View style={{ flexDirection: 'row', paddingEnd: 50, width: 250, marginTop: 20, alignSelf: 'center' }}>
                            <Image
                                style={{ height: 35, width: 35, resizeMode: 'contain', alignSelf: 'center' }}
                                source={require('../images/img_note.png')} />
                            <Text style={{ textAlign: 'left', fontSize: 12, color: COLORS.blue, paddingStart: 15, fontWeight: "bold" }} >Tap on options to select the correct answer.</Text>
                        </View>
                        {this.state.isLoading ?
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{ bottom: 0, position: 'absolute', alignSelf: 'center', marginBottom: 8 }}>
                                <LinearGradient
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    colors={[COLORS.pink, COLORS.pink]}
                                    style={{ width: 200, height: 30, paddingTop: 5, borderRadius: 15, elevation: 4 }}>
                                    <ActivityIndicator color={COLORS.white} />
                                </LinearGradient>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => this.isReviewTestExist()}
                                style={{ bottom: 0, position: 'absolute', alignSelf: 'center', marginBottom: 8 }}>
                                <LinearGradient
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    colors={[COLORS.pink, COLORS.pink]}
                                    style={{ width: 200, height: 30, paddingTop: 5, borderRadius: 15, elevation: 4 }}>
                                    <Text style={styles.submitButtonText}> TEST </Text>
                                </LinearGradient>
                            </TouchableOpacity>
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
                            <Text style={{ marginBottom: 10 }}>Go with...</Text>
                            <TouchableOpacity style={{ width: '100%', padding: 8, flexDirection: 'row', }}
                                activeOpacity={0.8}
                                onPress={() => this.openDetail(false)}>
                                <Image
                                    style={{ height: 20, width: 20 }}
                                    source={require('../images/ic_new_test.png')} />
                                <Text style={{ textAlignVertical: 'center', marginStart: 20 }}>Start new test</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '100%', padding: 8, flexDirection: 'row', }}
                                activeOpacity={0.8}
                                onPress={() => this.openDetail(true)}>
                                <Image
                                    style={{ height: 20, width: 20 }}
                                    source={require('../images/ic_review_test.png')} />
                                <Text style={{ textAlignVertical: 'center', marginStart: 20 }}>Review previous test</Text>
                            </TouchableOpacity>
                        </RBSheet>
                    </View>
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

export default MockTestInstructionActivity

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