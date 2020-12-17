import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native'
import COLORS from '../styles/color';
import { STRING, url } from '../values/string';
import SimpleToast from 'react-native-simple-toast';
import GLOBALSTYLE from '../values/style';
import LinearGradient from 'react-native-linear-gradient';
import MESSAGE from '../values/message';
import { getMessage } from '../util/Util';

class ResetPasswordActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hidePassword: true,
            hideCPassword: true,
            UniqueId: this.props.navigation.getParam("UniqueId", ''),
            newPassword: "",
            confirmNewPassword: "",
            isLoading: false
        }
    }

    checkValidation() {
        const { newPassword, confirmNewPassword } = this.state;

        if (newPassword.length < 8) {
            SimpleToast.show(getMessage(MESSAGE.invalidPassword, this.state.langId));
        } else if (newPassword != confirmNewPassword) {
            SimpleToast.show(getMessage(MESSAGE.passwordNotMatched, this.state.langId));
        } else {
            this.resetPasswordAPI();
        }
    }

    async resetPasswordAPI() {
        this.setState({
            isLoading: true
        });

        var data = {
            UniqueId: this.state.UniqueId,
            Password: this.state.newPassword
        };

        return fetch(await url(STRING.baseURL) + STRING.resetPassword, {
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
                } else {
                    SimpleToast.show(getMessage(MESSAGE.passwordReset, this.state.langId));
                    this.props.navigation.goBack(null);
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    setPasswordVisibility = () => {
        this.setState({ hidePassword: !this.state.hidePassword });
    }

    setCPasswordVisibility = () => {
        this.setState({ hideCPassword: !this.state.hideCPassword });
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
                        style={{ width: 70, height: 70, alignSelf: "center" }}
                        source={require('../images/img_reset.png')}
                    />
                    <Text style={{ marginBottom: 50, paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 22, color: COLORS.darkGrey }} >Reset your passowrd</Text>
                    <View style={GLOBALSTYLE.inputBox}>
                        <TextInput style={{ padding: 8 }}
                            placeholder="New Password"
                            placeholderTextColor={COLORS.darkGrey}
                            secureTextEntry={this.state.hidePassword}
                            returnKeyType={"next"}
                            onSubmitEditing={() => { this.t1.focus(); }}
                            blurOnSubmit={false}
                            onChangeText={
                                newPassword => this.setState({ newPassword })
                            } />
                        <TouchableOpacity activeOpacity={0.8} style={{ position: 'absolute', right: 3, height: 40, width: 35, padding: 2 }} onPress={this.setPasswordVisibility}>
                            <Image source={(this.state.hidePassword) ? require('../images/ic_visibility.png') : require('../images/ic_visibility_off.png')} style={{ resizeMode: 'contain', height: '100%', width: '70%', }} />
                        </TouchableOpacity>
                    </View>
                    <View style={GLOBALSTYLE.inputBox}>
                        <TextInput style={{ padding: 8 }}
                            placeholder="Confirm New Password"
                            placeholderTextColor={COLORS.darkGrey}
                            autoCapitalize="none"
                            secureTextEntry={this.state.hideCPassword}
                            ref={(input) => { this.t1 = input; }}
                            onChangeText={
                                confirmNewPassword => this.setState({ confirmNewPassword })
                            } />
                        <TouchableOpacity activeOpacity={0.8} style={{ position: 'absolute', right: 3, height: 40, width: 35, padding: 2 }} onPress={this.setCPasswordVisibility}>
                            <Image source={(this.state.hideCPassword) ? require('../images/ic_visibility.png') : require('../images/ic_visibility_off.png')} style={{ resizeMode: 'contain', height: '100%', width: '70%', }} />
                        </TouchableOpacity>
                    </View>
                    {this.state.isLoading ?
                        <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={GLOBALSTYLE.submitButton}>
                            <ActivityIndicator color={COLORS.white} />
                        </LinearGradient>
                        :
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => this.checkValidation()}>
                            <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={GLOBALSTYLE.submitButton}>
                                <Text style={styles.submitButtonText}> SUBMIT </Text>
                            </LinearGradient>
                        </TouchableOpacity>}
                </View>
            </View >
        )
    }
}

export default ResetPasswordActivity

const styles = StyleSheet.create({
    container: {
        width: '80%',
        padding: 10,
        marginTop: 150,
        alignSelf: "center",
        position: 'absolute'
    },
    input: {
        padding: 8,
        height: 45,
        marginTop: 20,
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