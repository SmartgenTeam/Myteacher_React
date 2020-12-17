import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native'
import COLORS from '../styles/color';
import SimpleToast from 'react-native-simple-toast';
import { STRING, url } from '../values/string';
import MESSAGE from '../values/message';
import GLOBALSTYLE from '../values/style';
import LinearGradient from 'react-native-linear-gradient';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
import AsyncStorage from '@react-native-community/async-storage';

class ForgotPasswordActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userInput: "",
            isLoading: false,
            langId: '',
        }
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
    }

    checkValidation() {
        const { userInput } = this.state;

        if (userInput.length <= 0) {
            SimpleToast.show(getMessage(MESSAGE.enterEmailOrPass, this.state.langId));
        } else {
            this.verifyDataAPI();
        }
    }

    async verifyDataAPI() {
        this.setState({
            isLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getUserPhoneNumber + this.state.userInput, {
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
                this.setState({
                    isLoading: false
                });
                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    this.props.navigation.replace('otpActivity', { "emailID": responseJson.email, "mobileNumber": responseJson.phoneNumber });
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
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                <View style={styles.container} >
                    <Image
                        style={{ width: 70, height: 70, alignSelf: "center" }}
                        source={require('../images/img_forgot.png')}
                    />
                    <Text style={{ marginBottom: 20, paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 22, color: COLORS.darkGrey }} >{getValue(LABEL.forgetPass, this.state.langId)}</Text>
                    <TextInput style={GLOBALSTYLE.inputBox}
                        placeholder="Email Address/Mobile Number"
                        placeholderTextColor={COLORS.darkGrey}
                        autoCapitalize="none"
                        onChangeText={
                            userInput => this.setState({ userInput })
                        } />

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
            </View >
        )
    }
}

export default ForgotPasswordActivity

const styles = StyleSheet.create({
    container: {
        width: '80%',
        padding: 10,
        borderRadius: 8,
        alignSelf: "center",
        position: 'absolute',
        marginTop: 150
    },
    input: {
        padding: 8,
        height: 45,
        marginTop: 80,
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
    }
})