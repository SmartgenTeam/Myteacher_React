import React, { Component } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ScrollView, StatusBar, Picker, ActivityIndicator, Modal, FlatList } from 'react-native'
import { CheckBox } from 'react-native-elements'
import COLORS from '../styles/color';
import SimpleToast from 'react-native-simple-toast';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
import MESSAGE from '../values/message';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
import AsyncStorage from '@react-native-community/async-storage';

var selectedGradeIDs = [], selectedGradeName = [], deviceID;

class SignUpActivity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hidePassword: true,
            hideCPassword: true,
            isLoading: false,
            isStateLoading: false,
            isCityLoading: true,
            isBoardLoading: false,
            isGradeLoading: true,
            userName: '',
            email: '',
            mobileNumber: '',
            password: '',
            confirmPassword: '',
            stateAndCity: [],
            boardAndGrade: [],
            selectedStateType: '',
            selectedStateID: '',
            selectedCityType: '',
            selectedCityID: '',
            selectedBoardType: '',
            selectedBoardID: '',
            selectedGradeType: '',
            selectedGradeName: '',
            selectedGradeID: '',
            selectedStateData: '',
            selectedBoardData: '',
            selectedLangID: '',
            gradeItems: [],
            gradeList: [],
            shouldShowConfirmation: false,
            isGradesAvailable: false,
            langId: '',
        }
    }

    async componentDidMount() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
        });
        this.getdeviceId();
        this.registrationDataAPI();
    }

    getdeviceId() {
        deviceID = DeviceInfo.getUniqueId();
    }

    checkValidation() {
        const { userName, email, mobileNumber, password, confirmPassword, selectedCityID, selectedStateID, selectedGradeID, selectedBoardID } = this.state;

        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/;

        if (userName.length < 2) {
            SimpleToast.show(getMessage(MESSAGE.enterValidName, this.state.langId));
        } else if (email == '' || reg.test(email) == false) {
            SimpleToast.show(getMessage(MESSAGE.enterValidEmail, this.state.langId));
        } else if (mobileNumber.length != 10) {
            SimpleToast.show(getMessage(MESSAGE.enterValidMobile, this.state.langId));
        } else if (password.length < 8) {
            SimpleToast.show(getMessage(MESSAGE.invalidPassword, this.state.langId));
        } else if (password != confirmPassword) {
            SimpleToast.show(getMessage(MESSAGE.passwordNotMatched, this.state.langId));
        } else if (selectedStateID == '' || selectedStateID == '-1') {
            SimpleToast.show(getMessage(MESSAGE.selectState, this.state.langId));
        } else if (selectedCityID == '' || selectedCityID == '-1') {
            SimpleToast.show(getMessage(MESSAGE.selectCity, this.state.langId));
        } else if (selectedBoardID == '' || selectedBoardID == '-1') {
            SimpleToast.show(getMessage(MESSAGE.selectBoard, this.state.langId));
        } else if (selectedGradeIDs.length == 0) {
            SimpleToast.show(getMessage(MESSAGE.selectGrade, this.state.langId));
        } else {
            this.verifyDataAPI();
        }
    }

    async registrationDataAPI() {
        this.setState({
            isStateLoading: true,
            isCityLoading: true,
            isBoardLoading: true,
            isGradeLoading: true
        });

        return fetch(await url(STRING.baseURL) + STRING.registrationDataURL, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    isStateLoading: false,
                    isBoardLoading: false
                });

                let dummyStateAndCity = [], dummyBoardAndGrade = [];
                for (let i = 0; i < responseJson.stateAndCity.length + 1; i++) {
                    if (i == 0) {
                        dummyStateAndCity[i] = { state: { stateName: "Select Province", stateId: '-1' }, cities: [] }
                    } else {
                        dummyStateAndCity[i] = responseJson.stateAndCity[i - 1];
                    }

                    let dummyCity = []
                    for (let j = 0; j < dummyStateAndCity[i].cities.length + 1; j++) {
                        if (j == 0) {
                            dummyCity[j] = { cityName: "Select City", cityId: '-1' }
                        } else {
                            dummyCity[j] = dummyStateAndCity[i].cities[j - 1];
                        }
                    }

                    dummyStateAndCity[i] = {
                        ...dummyStateAndCity[i],
                        cities: dummyCity
                    };
                }

                for (let i = 0; i < responseJson.boardAndGrade.length + 1; i++) {
                    if (i == 0) {
                        dummyBoardAndGrade[i] = { board: { categoryDetailName: "Select Board", categoryDetailId: '-1' }, grades: [] }
                    } else {
                        dummyBoardAndGrade[i] = responseJson.boardAndGrade[i - 1];
                    }
                }

                if (responseJson.stateAndCity.length > 0) {
                    this.setState({
                        stateAndCity: dummyStateAndCity
                    });
                } else {
                    SimpleToast.show(getMessage(MESSAGE.stateNotAvailable, this.state.langId));
                }

                if (responseJson.boardAndGrade.length > 0) {
                    this.setState({
                        boardAndGrade: dummyBoardAndGrade
                    });
                } else {
                    SimpleToast.show(getMessage(MESSAGE.boardNotAvailable, this.state.langId));
                }
            })
            .catch((error) => {
                this.setState({
                    isStateLoading: false,
                    isBoardLoading: false
                });
            });
    }

    async verifyDataAPI() {
        this.setState({
            isLoading: true
        });

        let gs = [];
        for (let i = 0; i < selectedGradeIDs.length; i++) {
            gs[i] = {
                GradeId: selectedGradeIDs[i],
                GradeName: selectedGradeName[i],
                BoardId: this.state.selectedBoardID,
                BoardName: this.state.selectedBoardType,
                LanguageId: this.state.selectedLangID
            }
        }

        var dataToSend = {
            Password: this.state.password,
            Name: this.state.userName,
            Email: this.state.email,
            PhoneNumber: this.state.mobileNumber,
            StateId: this.state.selectedStateID,
            StateName: this.state.selectedStateType,
            DistrictId: this.state.selectedCityID,
            DistrictName: this.state.selectedCityType,
            DeviceID: deviceID,
            Grades: gs,
        };

        var data = {
            Email: this.state.email,
            PhoneNumber: this.state.mobileNumber
        };

        return fetch(await url(STRING.baseURL) + STRING.isValidUserInfo, {
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
                    this.props.navigation.replace('otpActivity', { "emailID": this.state.email, "mobileNumber": this.state.mobileNumber, "dataToSend": dataToSend });
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false
                });
            });
    }

    onStatePickerValueChange = (itemValue, itemIndex) => {
        this.setState({
            selectedStateType: this.state.stateAndCity[itemIndex].state.stateName,
            selectedStateID: this.state.stateAndCity[itemIndex].state.stateId
        }, () => {
            try {
                this.setState({
                    selectedStateData: this.state.stateAndCity[itemIndex],
                    selectedCityType: this.state.stateAndCity[itemIndex].cities[0].cityName,
                    selectedCityID: this.state.stateAndCity[itemIndex].cities[0].cityId,
                    isCityLoading: false,
                });
            } catch (e) {
                this.setState({
                    selectedCityType: "-1",
                    selectedCityID: "-1",
                    selectedStateData: { cities: [{ cityName: LABEL.citiesNotAvilable, cityId: -1 }] },
                    isCityLoading: false
                });
            }
        }
        );
    }

    onCityPickerValueChange = (itemValue, itemIndex) => {
        this.setState({
            selectedCityType: this.state.selectedStateData.cities[itemIndex].cityName,
            selectedCityID: this.state.selectedStateData.cities[itemIndex].cityId
        }, () => {
        }
        );
    }

    onBoardPickerValueChange = (itemValue, itemIndex) => {
        if (itemIndex == 0) {
            this.setState({
                selectedBoardType: 'Select Board',
                selectedGradeName: getValue(LABEL.selectGrades, this.state.langId),
                selectedBoardID: '-1',
            }, () => {
                selectedGradeIDs = [];
                selectedGradeName = [];
            });
        } else {
            this.setState({
                selectedBoardType: this.state.boardAndGrade[itemIndex].board.categoryDetailName,
                selectedBoardID: this.state.boardAndGrade[itemIndex].board.categoryDetailId
            }, () => {
                try {
                    let grades = [];
                    for (let i = 0; i < this.state.boardAndGrade[itemIndex].grades.length; i++) {
                        grades[i] = {
                            gradeName: this.state.boardAndGrade[itemIndex].grades[i].categoryDetailName,
                            gradeId: this.state.boardAndGrade[itemIndex].grades[i].categoryDetailId,
                            gradeLanguageId: this.state.boardAndGrade[itemIndex].board.languageId,
                            isSelected: false,
                        }
                    }
                    this.setState({
                        selectedBoardData: this.state.boardAndGrade[itemIndex],
                        selectedLangID: this.state.boardAndGrade[itemIndex].board.languageId,
                        selectedGradeType: this.state.boardAndGrade[itemIndex].grades[0].categoryDetailName,
                        selectedGradeID: this.state.boardAndGrade[itemIndex].grades[0].categoryDetailId,
                        isGradeLoading: false,
                        gradeList: grades,
                        isGradesAvailable: true,
                        selectedGradeName: grades.length == 0 ? getValue(LABEL.gradeNotAvailabel, this.state.langId) : getValue(LABEL.selectGrade, this.state.langId),
                    }, () => {
                        this.onCancelmGrade();
                    });
                } catch (e) {
                    this.setState({
                        selectedGradeType: "-1",
                        selectedGradeID: "-1",
                        selectedBoardData: { grades: [{ categoryDetailName: getValue(LABEL.gradeNotAvailabel, this.state.langId), categoryDetailId: -1 }] },
                        isGradeLoading: false,
                        isGradesAvailable: false,
                    });
                }
            }
            );
        }
    }

    onGradePickerValueChange = (itemValue, itemIndex) => {
        this.setState({
            selectedGradeType: this.state.selectedBoardData.grades[itemIndex].categoryDetailName,
            selectedGradeID: this.state.selectedBoardData.grades[itemIndex].categoryDetailId,
            selectedLangID: this.state.selectedBoardData.grades[itemIndex].languageId
        }, () => {
        }
        );
    }

    loadStateTypes() {
        return this.state.stateAndCity.map(states => (
            <Picker.Item label={states.state.stateName} value={states.state.stateName} key={states.state.stateId} />
        ))
    }

    loadCityTypes() {
        // if (this.state.selectedStateData.cities.length == 0) {
        //     this.setState({
        //         selectedCityID: "-1"
        //     });
        //     return <Picker.Item label="City not available" value="City not available" key="-1" />
        // }

        return this.state.selectedStateData.cities.map(cities => (
            <Picker.Item label={cities.cityName} value={cities.cityName} key={cities.cityId} />
        ))
    }

    loadBoardTypes() {
        return this.state.boardAndGrade.map(board => (
            <Picker.Item label={board.board.categoryDetailName} value={board.board.categoryDetailName} key={board.board.categoryDetailId} />
        ))
    }

    loadGradeTypes() {
        // if (this.state.selectedBoardData.grades.length == 0) {
        //     this.setState({
        //         selectedGradeID: "-1"
        //     });
        //     return <Picker.Item label="Grade not available" value="Grade not available" key="-1" />
        // }

        return this.state.selectedBoardData.grades.map(grade => (
            <Picker.Item label={grade.categoryDetailName} value={grade.categoryDetailName} key={grade.categoryDetailId} />
        ))
    }

    showGradeSelection() {
        this.setState({
            shouldShowConfirmation: true,
        })
    }

    onCheckBoxClick(item, index) {
        // let gradeObj = this.state.gradeList;
        // if (item.isSelected) {
        //     gradeObj[index].isSelected = false;
        //     selectedGradeIDs.splice(selectedGradeIDs.indexOf(item.gradeId), 1);
        //     selectedGradeName.splice(selectedGradeName.indexOf(item.gradeName), 1);

        //     this.setState({
        //         gradeList: gradeObj,
        //     }, () => {

        //     })
        // } else {
        //     gradeObj[index].isSelected = true;
        //     selectedGradeIDs[selectedGradeIDs.length] = item.gradeId;
        //     selectedGradeName[selectedGradeName.length] = item.gradeName;

        //     this.setState({
        //         gradeList: gradeObj,
        //     }, () => {

        //     })
        // }

        selectedGradeIDs[0] = item.gradeId;
        selectedGradeName[0] = item.gradeName;

        let gNames = '';

        if (selectedGradeName.length > 0) {
            for (let i = 0; i < selectedGradeName.length; i++) {
                if (i == 0) {
                    gNames = selectedGradeName[i];
                } else {
                    gNames = gNames + ", " + selectedGradeName[i];
                }
            }
        } else {
            gNames = getValue(LABEL.selectGrades, this.state.langId)
        }
        this.setState({
            shouldShowConfirmation: false,
            selectedGradeName: gNames,
        });
    }

    onConfirmGrade() {
        let gNames = '';

        if (selectedGradeName.length > 0) {
            for (let i = 0; i < selectedGradeName.length; i++) {
                if (i == 0) {
                    gNames = selectedGradeName[i];
                } else {
                    gNames = gNames + ", " + selectedGradeName[i];
                }
            }
        } else {
            gNames = getValue(LABEL.selectGrades, this.state.langId)
        }
        this.setState({
            shouldShowConfirmation: false,
            selectedGradeName: gNames,
        });
    }

    onCancelmGrade() {
        let gNames = getValue(LABEL.selectGrades, this.state.langId)

        let grades = [];
        for (let i = 0; i < this.state.selectedBoardData.grades.length; i++) {
            grades[i] = {
                gradeName: this.state.selectedBoardData.grades[i].categoryDetailName,
                gradeId: this.state.selectedBoardData.grades[i].categoryDetailId,
                gradeLanguageId: this.state.selectedBoardData.board.languageId,
                isSelected: false,
            }
        }

        selectedGradeIDs = [];
        selectedGradeName = [];

        this.setState({
            shouldShowConfirmation: false,
            selectedGradeName: gNames,
            gradeList: grades,
        });
    }

    onSelectedItemsChange = selectedItems => {
        this.setState({ selectedItems });
    };

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
                    source={require('../images/img_page_bg2.png')}
                />
                {/* <Image
                    style={{ width: 150, height: 150, alignSelf: "flex-end", position: 'absolute', }}
                    source={require('../images/img_bg_wc.png')}
                /> */}
                <ScrollView style={{ position: 'absolute', alignSelf: 'center', width: '90%', height: '100%' }}>
                    <View style={styles.container}>
                        <Image
                            style={{ marginTop: 80, width: 100, height: 100, alignSelf: "center", margin: 20 }}
                            source={require('../images/img_mid2.png')}
                        />
                        <TextInput style={GLOBALSTYLE.inputBox}
                            placeholder={getValue(LABEL.name, this.state.langId)}
                            placeholderTextColor={COLORS.darkGrey}
                            keyboardType={'default'}
                            ref={(input) => { this.t1 = input; }}
                            returnKeyType={"next"}
                            onSubmitEditing={() => { this.t2.focus(); }}
                            blurOnSubmit={false}
                            onChangeText={
                                userName => this.setState({ userName })
                            } />
                        <TextInput style={GLOBALSTYLE.inputBox}
                            placeholder={getValue(LABEL.email, this.state.langId)}
                            placeholderTextColor={COLORS.darkGrey}
                            keyboardType={'email-address'}
                            ref={(input) => { this.t2 = input; }}
                            returnKeyType={"next"}
                            onSubmitEditing={() => { this.t3.focus(); }}
                            blurOnSubmit={false}
                            onChangeText={
                                email => this.setState({ email })
                            } />
                        <TextInput style={GLOBALSTYLE.inputBox}
                            placeholder={getValue(LABEL.moNumber, this.state.langId)}
                            placeholderTextColor={COLORS.darkGrey}
                            keyboardType={'phone-pad'}
                            ref={(input) => { this.t3 = input; }}
                            returnKeyType={"next"}
                            onSubmitEditing={() => { this.t4.focus(); }}
                            blurOnSubmit={false}
                            onChangeText={
                                mobileNumber => this.setState({ mobileNumber })
                            } />
                        <View style={GLOBALSTYLE.inputBox}>
                            {this.state.isStateLoading ?
                                <View style={{ margin: 15 }}>
                                    <ActivityIndicator size="small" />
                                </View>
                                :
                                <Picker
                                    selectedValue={this.state.selectedStateType}
                                    onValueChange={this.onStatePickerValueChange}>
                                    {this.loadStateTypes()}
                                </Picker>}
                        </View>
                        <View style={GLOBALSTYLE.inputBox}>
                            {this.state.isCityLoading ?
                                <View style={{ margin: 15 }}>
                                    <ActivityIndicator size="small" />
                                </View>
                                :
                                <Picker
                                    selectedValue={this.state.selectedCityType}
                                    onValueChange={this.onCityPickerValueChange}>
                                    {this.loadCityTypes()}
                                </Picker>}
                        </View>
                        <View style={GLOBALSTYLE.inputBox}>
                            {this.state.isBoardLoading ?
                                <View style={{ margin: 15 }}>
                                    <ActivityIndicator size="small" />
                                </View>
                                :
                                <Picker
                                    selectedValue={this.state.selectedBoardType}
                                    onValueChange={this.onBoardPickerValueChange}>
                                    {this.loadBoardTypes()}
                                </Picker>}
                        </View>
                        <View style={GLOBALSTYLE.inputBox}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={{ justifyContent: 'center', height: 40, padding: 2 }}
                                onPress={() => this.state.gradeList.length == 0 ? null : this.showGradeSelection()}>
                                <Text style={{ fontSize: 15, color: COLORS.black }} numberOfLines={2} ellipsizeMode='tail'> {this.state.selectedGradeName}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={GLOBALSTYLE.inputBox}>
                            <TextInput style={{ padding: 8, textAlign: 'right' }}
                                placeholder={getValue(LABEL.password, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                secureTextEntry={this.state.hidePassword}
                                ref={(input) => { this.t4 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t5.focus(); }}
                                blurOnSubmit={false}
                                onChangeText={
                                    password => this.setState({ password })
                                } />
                            <TouchableOpacity activeOpacity={0.8} style={{ position: 'absolute', right: 3, height: 40, width: 35, padding: 2 }} onPress={this.setPasswordVisibility}>
                                <Image source={(this.state.hidePassword) ? require('../images/ic_visibility.png') : require('../images/ic_visibility_off.png')} style={{ resizeMode: 'contain', height: '100%', width: '70%', }} />
                            </TouchableOpacity>
                        </View>
                        <View style={GLOBALSTYLE.inputBox}>
                            <TextInput style={{ padding: 8, textAlign: 'right' }}
                                placeholder={getValue(LABEL.cPassword, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                secureTextEntry={this.state.hideCPassword}
                                ref={(input) => { this.t5 = input; }}
                                returnKeyType={"next"}
                                onSubmitEditing={() => { this.t5.focus(); }}
                                onChangeText={
                                    confirmPassword => this.setState({ confirmPassword })
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
                                    <Text style={styles.submitButtonText}> {getValue(LABEL.submit, this.state.langId)} </Text>
                                </LinearGradient>
                            </TouchableOpacity>}
                    </View>
                </ScrollView>

                <View style={styles.containerAlert} >
                    <Modal
                        visible={this.state.shouldShowConfirmation}
                        transparent={true}
                        animationType={"fade"}
                        onRequestClose={() => { }} >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            {this.state.isGradesAvailable ?
                                <View style={styles.MainAlertView}>
                                    <Text style={{ height: 25, fontSize: 16, color: COLORS.black, marginTop: 5 }}>{getValue(LABEL.selectGrades, this.state.langId)}</Text>
                                    <FlatList
                                        data={this.state.gradeList}
                                        style={{ alignSelf: 'center', width: '90%', marginBottom: 45 }}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                    style={{ backgroundColor: COLORS.white, borderColor: COLORS.white, borderRadius: 10, margin: 6 }}
                                                    onPress={() => this.onCheckBoxClick(item, index)}
                                                    activeOpacity={0.7} >
                                                    {/* <View style={{ backgroundColor: COLORS.white, borderColor: COLORS.white, borderRadius: 10, margin: 6 }}> */}
                                                    {/* <CheckBox
                                                        title={item.gradeName}
                                                        checked={item.isSelected}
                                                        checkedIcon={<Image source={require('../images/ic_checked.png')} />}
                                                        uncheckedIcon={<Image source={require('../images/ic_unchecked.png')} />}
                                                        containerStyle={{ borderColor: COLORS.white, elevation: 0, height: 25 }}
                                                        textStyle={{ color: COLORS.black }}
                                                        onPress={() => this.onCheckBoxClick(item, index)} /> */}
                                                    <Text style={{ height: 25, fontSize: 18, color: COLORS.black, fontWeight: 'bold' }}>{item.gradeName}</Text>
                                                    {/* </View> */}
                                                </TouchableOpacity>
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                    {/* <View style={{ flexDirection: 'row', bottom: 8, position: 'absolute' }}>
                                        <TouchableOpacity
                                            style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => this.onConfirmGrade()}
                                            activeOpacity={0.7} >
                                            <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_submit.png')} />
                                            <Text style={styles.TextStyle}>{getValue(LABEL.CONFIRM, this.state.langId)}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ flex: this.state.isTimeUps == false ? 0.5 : 1.0, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => this.onCancelmGrade()}
                                            activeOpacity={0.7} >
                                            <Image style={{ height: 27, resizeMode: 'contain', alignSelf: 'center' }} source={require('../images/img_back_cancel.png')} />
                                            <Text style={styles.TextStyle}>{getValue(LABEL.CANCEL, this.state.langId)}</Text>
                                        </TouchableOpacity>
                                    </View> */}
                                </View>
                                :
                                <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noGrades, this.state.langId)}</Text>}
                        </View>
                    </Modal>
                </View>
            </View>
        )
    }
}

export default SignUpActivity

const styles = StyleSheet.create({
    container: {
        padding: 15
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
    checkBox: {
        color: 'blue',
        margin: 15,
        height: 40
    },
    containerAlert: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20
    },
    MainAlertView: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        elevation: 40,
        height: 300,
        width: '75%',
    },
    TextStyle: {
        color: COLORS.white,
        textAlign: 'center',
        fontSize: 14,
        position: 'absolute'
    },
})