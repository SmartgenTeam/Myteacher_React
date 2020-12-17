import React, { Component } from 'react'
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, StatusBar, Alert, Linking, Modal } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import SimpleToast from 'react-native-simple-toast';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import MESSAGE from '../values/message';
import GLOBALSTYLE from '../values/style';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
import VersionCheck from 'react-native-version-check';

var db, deviceID, SYNC_SPAN = 200;

class LoginActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            userName: "",
            password: "",
            isLoading: false,
            hidePassword: true,
            langId: '',
            shouldShowConfirmation: false,
            appURL: '',
        }
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        });
        this.readConfigFile();
    }

    readConfigFile() {
        this.setState({
            isLoading: true
        });

        return fetch('https://step-up-content.s3.ap-south-1.amazonaws.com/com.smartgen.myteacher.txt', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': 0
            }
        })
            .then(response => {
                const statusCode = response.status;
                const data = response.json();
                return Promise.all([statusCode, data]);
            })
            .then(([statusCode, responseJson]) => {
                this.setState({
                    isLoading: false
                });

                console.log(responseJson.baseURL);
                if (statusCode == 400) {
                    this.setState({
                        isLoading: false
                    });
                    SimpleToast.show(responseJson.message);
                } else {
                    if (responseJson.shouldCheckAppVersion == 'true') {
                        console.log("IF");
                        VersionCheck.needUpdate().then(async res => {
                            console.log('res', res);
                            if (res != undefined && res.isNeeded) {
                                this.setState({
                                    shouldShowConfirmation: true,
                                    appURL: res.storeUrl,
                                })
                            } else {
                                this.writeValues(responseJson);
                            }
                        });
                    } else {
                        this.writeValues(responseJson);
                    }
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    writeValues(responseJson) {
        AsyncStorage.setItem(STRING.baseURL, responseJson.baseURL);
        AsyncStorage.setItem(STRING.resourceBaseURL, responseJson.resourseBaseURL);
        AsyncStorage.setItem(STRING.videoBaseURL, responseJson.contentBaseURL);
        AsyncStorage.setItem(STRING.topicThumbBaseURL, responseJson.topicThumbBaseURL);
        AsyncStorage.setItem(STRING.liveClassBaseUrl, responseJson.baseURL.replace("/Raccount", ""));

        this.doFurther();
    }

    doFurther = async () => {
        try {
            let uName = await AsyncStorage.getItem(STRING.USERNAME);
            let pass = await AsyncStorage.getItem(STRING.PASSWORD);

            if (uName != null && uName.length != 0) {
                this.setState({
                    userName: uName,
                    password: pass
                }, () => {
                    this.getdeviceId();
                    this.loginAPI();
                });
            } else {
                this.getdeviceId();
            }
        } catch (e) {
            console.log(e);
        }
    }

    async getdeviceId() {
        deviceID = DeviceInfo.getUniqueId();

        // console.log(await url(STRING.USERNAME));
    }

    checkValidation() {
        const { userName, password } = this.state;

        if (userName.length <= 0) {
            SimpleToast.show(getMessage(MESSAGE.enterUserName, this.state.langId));
        } else if (password == '') {
            SimpleToast.show(getMessage(MESSAGE.enterPassword, this.state.langId));
        } else {
            this.loginAPI();
        }
    }

    async loginAPI() {
        this.setState({
            isLoading: true
        });

        var data = {
            UniqueId: this.state.userName,
            Password: this.state.password,
            DeviceID: deviceID,
        };

        return fetch(await url(STRING.baseURL) + STRING.loginURL, {
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
                // this.setState({
                //     isLoading: false
                // });

                if (statusCode == 400) {
                    this.setState({
                        isLoading: false
                    });
                    SimpleToast.show(responseJson.message);
                } else {
                    db.insertUser(code => {
                        if (code == 400) {
                            SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
                        } else {
                            AsyncStorage.setItem(STRING.USERNAME, this.state.userName);
                            AsyncStorage.setItem(STRING.PASSWORD, this.state.password);
                            AsyncStorage.setItem(STRING.ISFROMLOGIN, 'true');

                            db.getQuizDataCount(quizCount => {
                                console.log('quizCount', quizCount);
                                if (quizCount == 0) {
                                    this.quizReSyncAPI(0, responseJson.id);
                                } else {
                                    db.getQuizMetaDataCount(metacount => {
                                        console.log('metacount', metacount);
                                        if (metacount == 0) {
                                            this.mataDataReSyncAPI(0, responseJson.id);
                                        } else {
                                            this.launchActivity();
                                        }
                                    });
                                }
                            }, responseJson.id);
                        }
                    }, responseJson);
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    async quizReSyncAPI(startPosition, userId) {
        // this.setState({
        //     isLoading: true
        // });

        var data = {
            UserId: userId,
            TableName: 'quizusagedata',
            StartValue: startPosition,
            EndValue: SYNC_SPAN
        };

        return fetch(await url(STRING.baseURL) + STRING.usageReSync, {
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
                // this.setState({
                //     isLoading: false
                // });

                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    if (responseJson.length > 0) {
                        db.insertQuizData(code => {
                            if (responseJson.length < SYNC_SPAN) {
                                db.getQuizMetaDataCount(count => {
                                    if (count == 0) {
                                        this.mataDataReSyncAPI(0, userId);
                                    } else {
                                        this.launchActivity();
                                    }
                                }, responseJson.id);
                            } else {
                                this.quizReSyncAPI(startPosition + SYNC_SPAN, userId)
                            }
                        }, responseJson, true);
                    } else {
                        db.getQuizMetaDataCount(count => {
                            if (count == 0) {
                                this.mataDataReSyncAPI(0, userId);
                            } else {
                                this.launchActivity();
                            }
                        }, responseJson.id);
                    }
                }
            })
            .catch((error) => {
                db.getQuizMetaDataCount(count => {
                    if (count == 0) {
                        this.mataDataReSyncAPI(0, userId);
                    } else {
                        this.launchActivity();
                    }
                }, responseJson.id);

                this.setState({
                    isLoading: false
                });
            });
    }

    async mataDataReSyncAPI(startPosition, userId) {
        // this.setState({
        //     isLoading: true
        // });

        var data = {
            UserId: userId,
            TableName: 'syllabusmetadata',
            StartValue: startPosition,
            EndValue: SYNC_SPAN
        };

        console.log(await url(STRING.baseURL) + STRING.usageReSync);
        return fetch(await url(STRING.baseURL) + STRING.usageReSync, {
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
                // this.setState({
                //     isLoading: false
                // });

                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    if (responseJson.length > 0) {
                        db.insertSyllabusMetaData(code => {
                            if (responseJson.length < SYNC_SPAN) {
                                this.launchActivity();
                            } else {
                                this.mataDataReSyncAPI(startPosition + SYNC_SPAN, userId)
                            }
                        }, null, null, responseJson);
                    } else {
                        this.launchActivity();
                    }
                }
            })
            .catch((error) => {
                this.launchActivity();

                this.setState({
                    isLoading: false
                });
            });
    }

    launchActivity() {
        console.log('***DONE***');
        this.setState({
            isLoading: false
        }, () => {
            this.props.navigation.replace('dashBoardActivity', { "isFromDashBoardActivity": '111' });
        });
    }

    submitUpdate() {
        Linking.openURL(this.state.appURL);
    }

    setPasswordVisibility = () => {
        this.setState({ hidePassword: !this.state.hidePassword });
    }

    render() {
        return (
            <View style={{ backgroundColor: COLORS.white, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg2.png')}
                />
                {/* <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                <View style={styles.container}>
                    <Image
                        style={{ width: 80, height: 80, alignSelf: "center", margin: 20 }}
                        source={require('../images/img_mid2.png')}
                    />
                    <TextInput style={GLOBALSTYLE.inputBox}
                        placeholder={getValue(LABEL.email, this.state.langId)}
                        placeholderTextColor={COLORS.darkGrey}
                        keyboardType={'default'}
                        ref={(input) => { this.t1 = input; }}
                        returnKeyType={"next"}
                        onSubmitEditing={() => { this.t2.focus(); }}
                        blurOnSubmit={false}
                        keyboardType={'email-address'}
                        onChangeText={
                            userName => this.setState({ userName })
                        }>
                        {this.state.userName}
                    </TextInput>

                    <View style={GLOBALSTYLE.inputBox}>
                        <TextInput style={{ paddingStart: -8, textAlign: 'right' }}
                            placeholder={getValue(LABEL.password, this.state.langId)}
                            placeholderTextColor={COLORS.darkGrey}
                            ref={(input) => { this.t2 = input; }}
                            secureTextEntry={this.state.hidePassword}
                            onChangeText={
                                password => this.setState({ password })
                            }>
                            {this.state.password}
                        </TextInput>
                        <TouchableOpacity activeOpacity={0.8} style={{ position: 'absolute', right: 3, height: 40, width: 35, padding: 2 }} onPress={this.setPasswordVisibility}>
                            <Image source={(this.state.hidePassword) ? require('../images/ic_visibility.png') : require('../images/ic_visibility_off.png')} style={{ resizeMode: 'contain', height: '100%', width: '70%', }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ paddingTop: 15, paddingBottom: 5, fontSize: 12, alignSelf: 'flex-start' }}
                        onPress={() => this.props.navigation.navigate('forgotPasswordActivity')} >{getValue(LABEL.forgotPass, this.state.langId)}</Text>
                    {this.state.isLoading ?
                        <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={GLOBALSTYLE.submitButton}>
                            <ActivityIndicator color={COLORS.white} />
                        </LinearGradient>
                        :
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.checkValidation()}>
                            <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={GLOBALSTYLE.submitButton}>
                                <Text style={styles.submitButtonText}> {getValue(LABEL.submit, this.state.langId)} </Text>
                            </LinearGradient>
                        </TouchableOpacity>}
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ paddingBottom: 5, textAlign: 'right', fontSize: 13 }}
                            onPress={() => this.props.navigation.navigate('signUpActivity')} >{getValue(LABEL.signUp, this.state.langId)}</Text>
                    </View>
                </View>

                <View style={styles.container1} >
                    <Modal
                        visible={this.state.shouldShowConfirmation}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={styles.MainAlertView}>
                                <Image style={{ height: 60, marginTop: 5, resizeMode: 'contain', }} source={require('../images/img_alert_abstract.png')} />
                                <Text style={styles.AlertMessage}>{getMessage(MESSAGE.updateAvailable, this.state.langId)}</Text>
                                <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                    <TouchableOpacity style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.submitUpdate()} activeOpacity={0.7} >
                                        <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                        <Text style={styles.TextStyle}>{getValue(LABEL.update, this.state.langId)}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        )
    }
}

export default LoginActivity

const styles = StyleSheet.create({
    container: {
        width: '80%',
        padding: 20,
        marginBottom: 100,
        alignSelf: "center",
        position: 'absolute', //Here is the trick
        bottom: 0, //Here is the trick
    },
    input: {
        padding: 8,
        height: 45,
        marginTop: 30,
        borderWidth: 0.01,
        borderRadius: 4,
        elevation: 2
    },
    submitButtonText: {
        color: COLORS.white,
        textAlign: 'center'
    },
    MainAlertView: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        elevation: 40,
        height: 150,
        width: '80%',
    },
    AlertMessage: {
        fontSize: 14,
        color: COLORS.black,
        textAlign: 'center',
        padding: 5,
        bottom: 40,
        position: 'absolute',
    },
    container1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20
    },
    TextStyle: {
        color: COLORS.white,
        textAlign: 'center',
        fontSize: 14,
        position: 'absolute'
    }
})