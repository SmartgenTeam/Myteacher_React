import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import SimpleToast from 'react-native-simple-toast';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import MESSAGE from '../values/message';
import GLOBALSTYLE from '../values/style';
import LinearGradient from 'react-native-linear-gradient';
import { getMessage, getValue } from '../util/Util';
import LABEL from '../values/label';
var db;

class OTPActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            emailID: this.props.navigation.getParam("emailID", ''),
            mobileNumber: this.props.navigation.getParam("mobileNumber", ''),
            dataToSend: this.props.navigation.getParam("dataToSend", ''),
            generatedOTP: this.generateNumber(),
            enteredOTP: '',
            isLoading: false,
            langId: '',
        }
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
        this.generateNumber();
        this.sendOTPAPI();
    }

    checkValidation() {
        const { generatedOTP, enteredOTP } = this.state;

        if (enteredOTP.length != 6) {
            SimpleToast.show(getMessage(MESSAGE.enterOTP, this.state.langId));
        } else if (enteredOTP != generatedOTP) {
            SimpleToast.show(getMessage(MESSAGE.invalidOTP, this.state.langId));
        } else {
            if (this.state.dataToSend.length == 0) {
                this.props.navigation.replace('resetPasswordActivity', { "UniqueId": this.state.emailID });
            } else {
                this.registerUserAPI();
            }
        }
    }

    generateNumber = () => {
        const random = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        return random;
    }

    sendOTPAPI() {
        this.setState({
            isLoading: true
        });

        return fetch(STRING.sendOTP + this.state.mobileNumber + "&msg=" + this.state.generatedOTP + " " + getMessage(MESSAGE.otpMsg, this.state.langId), {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((responseJson) => {
                this.setState({
                    isLoading: false
                });
                this.sendOTPByMailAPI();
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    async sendOTPByMailAPI() {
        this.setState({
            isLoading: true
        });

        var data = {
            EmailId: this.state.emailID,
            Otp: this.state.generatedOTP,
            Subject: getMessage(MESSAGE.mailSubject, this.state.langId)
        };

        return fetch(await url(STRING.baseURL) + STRING.sendOTPByMail, {
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

                this.setState({
                    isLoading: false
                });
                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    async registerUserAPI() {
        this.setState({
            isLoading: true
        });

        console.log(this.state.dataToSend);

        return fetch(await url(STRING.baseURL) + STRING.registrationURL, {
            method: 'POST',
            body: JSON.stringify(this.state.dataToSend),
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
                this.setState({
                    isLoading: false
                });

                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    db.insertUser(code => {
                        if (code == 400) {
                            SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
                        } else {
                            AsyncStorage.setItem(STRING.USERNAME, this.state.dataToSend.Email);
                            AsyncStorage.setItem(STRING.PASSWORD, this.state.dataToSend.Password);

                            this.props.navigation.replace('dashBoardActivity');
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

    render() {
        return (
            <View style={{ backgroundColor: COLORS.white, height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />
                {/* <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute' }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                <View style={styles.container}>
                    <Image
                        style={{ width: 110, height: 90, alignSelf: "center" }}
                        source={require('../images/img_otp.png')}
                    />
                    <Text style={{ marginBottom: 10, paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 22, color: COLORS.darkGrey }} >{getValue(LABEL.enterotp, this.state.langId)}</Text>
                    <View>
                        <Text style={{ fontSize: 14, marginBottom: 30, marginStart: 20, marginEnd: 20, textAlign: 'center', color: COLORS.darkGrey }} >{getMessage(MESSAGE.otpMsg1, this.state.langId)} {this.state.mobileNumber} {getMessage(MESSAGE.otpMsg2, this.state.langId)} {this.state.emailID}</Text>
                        <TextInput style={styles.input}
                            maxLength={6}
                            placeholderTextColor={COLORS.darkGrey}
                            keyboardType={'number-pad'}
                            onChangeText={
                                enteredOTP => this.setState({ enteredOTP })
                            } />
                        {/* <OtpInputs
                            inputStyles={{fontSize:14, width: 25, backgroundColor:COLORS.grey, paddingRight:-30, marginRight:30, marginLeft:-20, alignContent:"center"}}
                            handleChange={code => this.setState({ enteredOTP: code })}
                            numberOfInputs={6}
                        /> */}
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
                    </View>
                </View>
            </View >
        )
    }
}

export default OTPActivity

const styles = StyleSheet.create({
    container: {
        width: '85%',
        padding: 10,
        marginTop: 150,
        alignSelf: "center",
        position: 'absolute'
    },
    input: {
        height: 60,
        width: 200,
        alignSelf: "center",
        textAlign: "center",
        marginTop: 20,
        borderWidth: 0.01,
        borderRadius: 4,
        elevation: 2,
        fontSize: 30,
        marginBottom: 20
    },
    submitButton: {
        backgroundColor: COLORS.pink,
        padding: 10,
        marginEnd: 50,
        marginStart: 50,
        height: 40,
        marginTop: 30,
        borderRadius: 4,
        elevation: 3
    },
    submitButtonText: {
        color: COLORS.white,
        textAlign: 'center'
    }
})