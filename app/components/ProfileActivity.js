import React, { Component } from 'react'
import { View, Text, TextInput, Image, TouchableOpacity, StatusBar, ScrollView, Animated } from 'react-native'
import RadioForm from 'react-native-simple-radio-button';
import COLORS from '../styles/color';
import MESSAGE from '../values/message';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import LinearGradient from 'react-native-linear-gradient';
import { STRING, url } from '../values/string';
import DatePicker from 'react-native-datepicker'
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
import AsyncStorage from '@react-native-community/async-storage';

var db;
var radio_props = [
    { label: 'Male  ', value: 'Male' },
    { label: 'Female  ', value: 'Female' }
];

class ProfileActivity extends Component {

    constructor(props) {
        super(props);
        db = DBMigrationHelper.getInstance();
        this.state = {
            username: '',
            name: '',
            gender: '',
            genderNumber: -1,
            dob: '',
            email: '',
            mobile: '',
            board: '',
            grade: '',
            city: '',
            progress: 0,
            isEditModeEnabled: false,
            user: {},
            grades: [],
            langId: '',
        };
    }

    componentDidMount() {
        this.getDataFromDB();
    }

    async getDataFromDB() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        })
        await db.getUserDetails(userData => {
            if (userData == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {

                this.setState({
                    user: userData,
                    username: userData.name,
                    name: userData.name,
                    email: userData.email,
                    mobile: userData.phoneNumber + "",
                    gender: userData.gender,
                    genderNumber: userData.gender == 'Male' ? 0 : userData.gender == 'Female' ? 1 : -1,
                    dob: userData.dob,
                    city: userData.districtName,
                });
            }
        });

        await db.getGrades(grade => {
            console.log(grade);

            if (grade.length == 0) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                let g = '';
                for (let i = 0; i < grade.length; i++) {
                    if (i == grade.length - 1) {
                        g = g + grade.item(i).gradeName;
                    } else {
                        g = g + grade.item(i).gradeName + ", ";
                    }
                }
                console.log(g);

                this.setState({
                    grades: grade,
                    board: grade.item(0).boardName,
                    grade: g,
                }, () => this.setProgress());
            }
        });
    }

    setProgress() {
        let count = 0
        if (this.state.name != null && this.state.name.length > 0) {
            count++;
        }
        if (this.state.gender != null && this.state.gender.length > 0) {
            count++;
        }
        if (this.state.dob != null && this.state.dob.length > 0) {
            count++;
        }
        if (this.state.email != null && this.state.email.length > 0) {
            count++;
        }
        if (this.state.mobile != null && this.state.mobile.length > 0) {
            count++;
        }
        if (this.state.board != null && this.state.board.length > 0) {
            count++;
        }
        if (this.state.grade != null && this.state.grade.length > 0) {
            count++;
        }
        if (this.state.city != null && this.state.city.length > 0) {
            count++;
        }
        console.log(count);


        let percentage = (100 * count) / 8;
        this.setState({
            progress: percentage
        });
    }

    editValues() {
        if (this.state.isEditModeEnabled) {
            this.updateProfileAPI();
            this.setState({
                isEditModeEnabled: false
            });
        } else {
            this.setState({
                isEditModeEnabled: true
            });
        }
    }

    async updateProfileAPI() {
        this.setState({
            isLoading: true
        });

        let grade = [];
        for (let i = 0; i < this.state.grades.length; i++) {
            grade[i] = {
                BoardId: this.state.grades.item(0).boardId,
                BoardName: this.state.grades.item(0).boardName,
                GradeId: this.state.grades.item(0).gradeId,
                GradeName: this.state.grades.item(0).gradeName,
                LanguageId: this.state.grades.item(0).languageId
            }
        }

        let data = {
            Id: this.state.user.id,
            Name: this.state.name,
            Email: this.state.email,
            PhoneNumber: this.state.mobile,
            DOB: (this.state.dob == null || this.state.dob == '') ? '' : this.state.dob,
            Gender: this.state.gender,
            StateId: this.state.user.stateId,
            StateName: this.state.user.stateName,
            DistrictId: this.state.user.districtId,
            DistrictName: this.state.user.districtName,
            Grades: grade,
        };

        return fetch(await url(STRING.baseURL) + STRING.updateUserInfo, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    isLoading: false
                });

                if (responseJson.id != null) {
                    db.updateUserData(res => {
                        this.getDataFromDB();
                    }, responseJson);
                } else {
                    this.setState({
                        isSubjectsAvailable: false
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    buttonPressed = () => {
        this.props.navigation.goBack(null)
    };

    render() {
        return (
            <View style={{ height: '100%', width: '100%' }}>
                <StatusBar hidden={true} />
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={require('../images/img_page_bg.png')}
                />

                <TouchableOpacity style={{ justifyContent: 'center', flex: 0.33, position: 'absolute', padding: 12 }}
                    onPress={() => this.props.navigation.goBack(null)}>
                    <Image
                        style={{ height: 25, width: 25, alignSelf: 'flex-start' }}
                        source={require('../images/ic_back_blue.png')} />
                </TouchableOpacity>

                <ScrollView style={{ width: '100%', height: '100%', marginTop: 50, position: 'absolute', paddingHorizontal: 20 }}>
                    <Image
                        source={require('../images/img_user.png')}
                        style={{ resizeMode: 'center', width: 70, height: 70, marginBottom: 10, alignSelf: 'center' }} />

                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 30, color: COLORS.blue, alignSelf: 'center' }} >{this.state.name}</Text>

                    <View style={{ width: '100%', height: 1, backgroundColor: COLORS.darkGrey }} />

                    <Text style={{ fontSize: 12, color: COLORS.black, marginTop: 10 }} >{getValue(LABEL.profileCompletion, this.state.langId)}</Text>

                    <View style={{ flex: 1, marginTop: 10, alignContent: 'center', width: '100%', backgroundColor: COLORS.blue_light, borderRadius: 25, height: 15 }}>
                        <LinearGradient
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            colors={[COLORS.blue2, COLORS.blue1]}
                            style={{ width: this.state.progress + '%', height: 15, borderRadius: 25 }} />
                        <Animated.Text style={{ fontSize: 11, color: COLORS.black, position: "absolute", zIndex: 1, alignSelf: "flex-end", paddingEnd: 10 }}>
                            {this.state.progress}%
                        </Animated.Text>
                    </View>

                    <View style={{ width: '100%', marginTop: 30 }}>

                        <View style={{ width: '100%' }}>
                            <Text style={{ alignSelf: "flex-start", fontSize: 14, fontWeight: 'bold', color: COLORS.black, }} >{getValue(LABEL.profileDetails, this.state.langId)}</Text>
                            <TouchableOpacity
                                activeOpacity={0.6}
                                style={{ alignSelf: "flex-end", position: 'absolute', height: 40, width: 40, padding: 2 }}
                                onPress={() => this.editValues()}>
                                <Image
                                    style={{ height: 20, width: 20 }}
                                    source={!this.state.isEditModeEnabled ? require('../images/ic_edit.png') : require('../images/ic_done.png')} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_profile.png')} />
                            <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5, textAlign: 'right' }}
                                placeholder={getValue(LABEL.name, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t1 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t2.focus(); }}
                                blurOnSubmit={false}
                                editable={this.state.isEditModeEnabled}
                                onChangeText={
                                    name => this.setState({ name })
                                }>
                                {this.state.name}
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_gender.png')} />
                            {this.state.isEditModeEnabled ?
                                <RadioForm
                                    radio_props={radio_props}
                                    initial={this.state.genderNumber}
                                    formHorizontal={true}
                                    buttonSize={10}
                                    buttonOuterSize={20}
                                    buttonColor={this.state.isEditModeEnabled ? COLORS.blue : COLORS.darkGrey}
                                    selectedButtonColor={this.state.isEditModeEnabled ? COLORS.blue : COLORS.darkGrey}
                                    animation={false}
                                    disabled={!this.state.isEditModeEnabled}
                                    onPress={(gender) => { this.setState({ gender: gender }) }}
                                />
                                :
                                <Text style={{ fontSize: 14, marginTop: 5, paddingBottom: 5, color: COLORS.darkGrey, borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%' }} > {this.state.gender}</Text>
                            }
                        </View>
                        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                            {/* <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_dob.png')} /> */}
                            {/* <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5 }}
                                placeholder="Date of Birth"
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t2 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t3.focus(); }}
                                blurOnSubmit={false}
                                editable={this.state.isEditModeEnabled}
                                onChangeText={
                                    dob => this.setState({ dob })
                                }>
                                {this.state.dob}
                            </TextInput> */}
                            <DatePicker
                                date={this.state.dob}
                                mode="date"
                                placeholder={getValue(LABEL.selectDate, this.state.langId)}
                                format="YYYY-MM-DD"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                iconSource={require('../images/ic_dob.png')}
                                customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 9,
                                        marginLeft: 0,
                                        height: 20, width: 20, marginEnd: 20,
                                    },
                                    dateInput: {
                                        paddingStart: 12, borderBottomWidth: 0, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5
                                    },
                                    dateText: {
                                        color: this.state.isEditModeEnabled ? COLORS.black : COLORS.darkGrey, fontSize: 13
                                    }
                                }}
                                onDateChange={(dob) => { this.setState({ dob: dob }) }}
                            />
                        </View>
                        <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_email.png')} />
                            <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5, textAlign: 'right' }}
                                placeholder={getValue(LABEL.email, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t3 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t4.focus(); }}
                                blurOnSubmit={false}
                                editable={false}
                                onChangeText={
                                    email => this.setState({ email })
                                }>
                                {this.state.email}
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_phone_profile.png')} />
                            <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5, textAlign: 'right' }}
                                placeholder={getValue(LABEL.mobileNumber, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t4 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t5.focus(); }}
                                blurOnSubmit={false}
                                editable={false}
                                onChangeText={
                                    mobile => this.setState({ mobile })
                                }>
                                {this.state.mobile}
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_university.png')} />
                            <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5, textAlign: 'right' }}
                                placeholder={getValue(LABEL.board, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t5 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t6.focus(); }}
                                blurOnSubmit={false}
                                editable={false}
                                onChangeText={
                                    board => this.setState({ board })
                                }>
                                {this.state.board}
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_sem.png')} />
                            <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5, textAlign: 'right' }}
                                placeholder={getValue(LABEL.grade, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t6 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t7.focus(); }}
                                blurOnSubmit={false}
                                editable={false}
                                onChangeText={
                                    grade => this.setState({ grade })
                                }>
                                {this.state.grade}
                            </TextInput>
                        </View>
                        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
                            <Image
                                style={{ height: 20, width: 20, marginEnd: 20 }}
                                source={require('../images/ic_city.png')} />
                            <TextInput
                                style={{ borderBottomWidth: 0.5, borderColor: COLORS.darkGrey, width: '100%', paddingBottom: -5, textAlign: 'right' }}
                                placeholder={getValue(LABEL.city, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                keyboardType={'default'}
                                ref={(input) => { this.t7 = input; }}
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                editable={this.state.isEditModeEnabled}
                                onChangeText={
                                    city => this.setState({ city })
                                }>
                                {this.state.city}
                            </TextInput>
                        </View>
                    </View>
                </ScrollView>
            </View >
        )
    }
}

export default ProfileActivity