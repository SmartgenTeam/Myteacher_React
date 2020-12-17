import React, { Component } from 'react'
import { View, Text, Share, Image, TouchableOpacity, StatusBar, Linking, ActivityIndicator, Button } from 'react-native'
import COLORS from '../styles/color';
import LinearGradient from 'react-native-linear-gradient';
import GLOBALSTYLE from '../values/style';
import { getMessage, getValue } from '../util/Util';
import LABEL from '../values/label';
import { STRING, url } from '../values/string';
import MESSAGE from '../values/message';
import AsyncStorage from '@react-native-community/async-storage';

class ReferEarnActivity extends Component {

    constructor(props) {
        super(props);

        this.state = {
            langId: '',
        };
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        });
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    shareApp() {
        Share.share(
            {
                title: "Share with",
                url: 'https://play.google.com/store/apps/details?id=com.smartgen.myteacher',
                message: 'Sometimes ‘Difficult means Easy’. Join me on MyTeacher and experience the Edvantage app for your Optimized and Balanced Learning.\n\n'
                    + 'Click here and install MyTeacher - https://play.google.com/store/apps/details?id=com.smartgen.myteacher'
            }
        );
    }

    render() {
        return (
            <View style={{ height: '100%', width: '100%', backgroundColor: COLORS.white }}>

                <StatusBar hidden={true} />

                <LinearGradient
                    style={{ width: '100%', height: 260, position: 'absolute', }}
                    colors={[COLORS.blueDark, COLORS.white]}>
                    <Text
                        onPress={() => this.shareApp()}
                        style={{ marginTop: 40, alignSelf: 'center', alignContent: 'center', fontSize: 13, borderColor: COLORS.white, borderRadius: 5, borderWidth: 1, color: COLORS.white, padding: 10 }}>{getValue(LABEL.inviteFriend, this.state.langId)}</Text>
                    <Text style={{ marginTop: 20, alignSelf: 'center', alignContent: 'center', fontSize: 16, color: COLORS.white }}>{getValue(LABEL.inviteFriend, this.state.langId)}</Text>
                    <Image
                        style={{ height: 100, width: 170, marginTop: 20, alignSelf: 'center', resizeMode: 'contain' }}
                        source={require('../images/img_child.png')} />
                </LinearGradient>

                <TouchableOpacity style={{ position: 'absolute', marginStart: 12, marginTop: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25 }}
                        source={require('../images/ic_back_white.png')} />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 290, width: '100%' }}>
                    <View style={{ flexDirection: 'column', alignSelf: 'center', flex: 0.3 }}>
                        <Image
                            style={{ height: 60, width: 60, marginTop: 20, alignSelf: 'center', resizeMode: 'contain' }}
                            source={require('../images/ic_refer1.png')} />
                        <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.enjoyLearning, this.state.langId)}</Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.blue, height: 1, flex: 0.05, alignSelf: 'center' }} />
                    <View style={{ flexDirection: 'column', alignSelf: 'center', flex: 0.3 }}>
                        <Image
                            style={{ height: 60, width: 60, marginTop: 20, alignSelf: 'center', resizeMode: 'contain' }}
                            source={require('../images/ic_refer2.png')} />
                        <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.installApp, this.state.langId)}</Text>
                    </View>
                    <View style={{ backgroundColor: COLORS.blue, height: 1, flex: 0.05, alignSelf: 'center' }} />
                    <View style={{ flexDirection: 'column', alignSelf: 'center', flex: 0.3 }}>
                        <Image
                            style={{ height: 60, width: 60, marginTop: 20, alignSelf: 'center', resizeMode: 'contain' }}
                            source={require('../images/ic_refer3.png')} />
                        <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>{getMessage(MESSAGE.enjoyLearning, this.state.langId)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 60 }}
                    onPress={() => this.shareApp()}>
                    <Image
                        style={{ height: 40, width: 130, resizeMode: 'contain' }}
                        source={require('../images/img_refer_now.png')} />
                </TouchableOpacity>

            </View >
        )
    }
}

export default ReferEarnActivity