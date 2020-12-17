import React, { Component } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StatusBar, StyleSheet, ActivityIndicator, TextInput } from 'react-native'
import { CheckBox } from 'react-native-elements'
import COLORS from '../styles/color';
import MESSAGE from '../values/message';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import LinearGradient from 'react-native-linear-gradient';
import SimpleToast from 'react-native-simple-toast';
import RazorpayCheckout from 'react-native-razorpay';
import { STRING, url } from '../values/string';
import GLOBALSTYLE from '../values/style';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';
import AsyncStorage from '@react-native-community/async-storage';

var db, selectedItems = [], gst = '0', resourceBaseURL;

class BuyPackageActivity extends Component {

    constructor(props) {
        super(props);

        db = DBMigrationHelper.getInstance();
        this.state = {
            grades: [],
            isGradesAvailable: false,
            isLoading: true,
            isProcessing: false,
            referralCode: '',
            promoCode: '',
            ispromocodeApplied: false,
            promoCodeAppliedText: '',
            discountOnGrade: '',
            scratchCard: '',
            isScratchCardApplied: false,
            scratchCardAppliedText: '',
            discountedTotalAmount: 0,
            grandTotal: 0,
            amount: 0,
            discountedAmount: 0,
            amountWithGST: 0,
            gstText: '',
            proceedText: '',
            userDetails: '',
            orderID: '',
            langId: '',
        };
    }

    componentDidMount() {
        this.getUserData();

        // this.props.navigation.addListener(
        //     'didFocus',
        //     payload => {
        //         console.log("didFocus");
        //         this.getUserData();
        //     }
        // );
    }

    async getUserData() {
        this.setState({
            langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
            proceedText: getValue(LABEL.PROCEED, this.state.langId)
        })
        resourceBaseURL = await url(STRING.resourceBaseURL);

        selectedItems = [];

        db.getUserDetails(user => {
            if (user == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                this.setState({
                    userDetails: user
                }, () => {
                    this.getGradeData();
                });
            }
        });
    }

    getGradeData() {
        db.getGrades(gradeDetails => {
            if (gradeDetails == null) {
                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
            } else {
                let gDetail = [];
                for (let i = 0; i < gradeDetails.length; i++) {
                    gDetail[i] = gradeDetails.item(i);
                }

                for (let i = 0; i < gDetail.length; i++) {
                    gDetail[i] = {
                        ...gDetail[i],
                        isSelected: false
                    }
                }

                this.setState({
                    grades: gDetail,
                    isLoading: false,
                    isGradesAvailable: true
                }, () => {

                });
            }
        });
    }

    onCheckBoxClick(item, index) {
        let gradeObj = this.state.grades;
        if (item.isSelected) {
            gradeObj[index].isSelected = false;
            selectedItems.splice(selectedItems.indexOf(item.gradeId), 1);

            let a = (selectedItems.includes(this.state.discountOnGrade)) ? this.state.discountedAmount : 0;
            let b = this.state.grandTotal - Number(item.actualAmount);

            this.setState({
                grades: gradeObj,
                discountedTotalAmount: a,
                grandTotal: b,
                amount: b - a,
                amountWithGST: 0,
            }, () => {
                this.calculateGST();
            })
        } else {
            gradeObj[index].isSelected = true;
            selectedItems[selectedItems.length] = item.gradeId;

            let a = (selectedItems.includes(this.state.discountOnGrade)) ? this.state.discountedAmount : 0;
            let b = this.state.grandTotal + Number(item.actualAmount);

            this.setState({
                grades: gradeObj,
                discountedTotalAmount: a,
                grandTotal: b,
                amount: b - a,
                amountWithGST: 0,
            }, () => {
                this.calculateGST();
            })
        }
    }

    calculateGST() {
        let gstCharge = 0;
        if (gst == null) {
            gstCharge = (this.state.amount * 18) / 100;
            this.setState({
                gstText: getValue(LABEL.GST, this.state.langId) + " 18%: " + gstCharge,
                amountWithGST: this.state.amount + gstCharge,
            }, () => {
                this.setButtonText();
            })
        } else if (gst == '0') {
            this.setState({
                gstText: '',
                amountWithGST: this.state.amount + gstCharge,
            }, () => {
                this.setButtonText();
            })
        } else if (gst.length > 0) {
            gstCharge = (this.state.amount * Number(gst)) / 100;
            this.setState({
                gstText: getValue(LABEL.GST, this.state.langId) + " " + gst + "%: " + gstCharge,
                amountWithGST: this.state.amount + gstCharge,
            }, () => {
                this.setButtonText();
            })
        }
    }

    setButtonText() {
        if (this.state.isScratchCardApplied) {
            this.setState({
                proceedText: getValue(LABEL.PROCEED, this.state.langId)
            })
        } else {
            if (this.state.amountWithGST > 0) {
                this.setState({
                    proceedText: getValue(LABEL.proceedToPay, this.state.langId) + " " + this.state.amountWithGST + " INR"
                })
            } else {
                this.setState({
                    proceedText: getValue(LABEL.PROCEED, this.state.langId)
                })
            }
        }
    }

    async orderIDAPI() {
        if (selectedItems.length > 0) {
            this.setState({
                isProcessing: true
            });

            var data = {
                Amount: Number(this.state.amountWithGST) * 100,
                UserId: this.state.userDetails.email
            };

            return fetch(await url(STRING.baseURL) + STRING.createRazorPayOrder, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        isProcessing: false
                    });

                    if (responseJson.id.length > 0) {
                        this.setState({
                            orderID: responseJson.id,
                        }, () => {
                            this.initiatePayment(data.Amount);
                        });
                    } else {
                        SimpleToast.show(getMessage(MESSAGE.orderNotGenerated, this.state.langId));
                    }
                })
                .catch((error) => {
                    this.setState({
                        isProcessing: false,
                    });
                });
        } else {
            SimpleToast.show(getMessage(MESSAGE.selectSems, this.state.langId));
        }
    }

    async promoCodeAPI() {
        this.setState({
            isProcessing: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getPromoCodeDetails + this.state.promoCode, {
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
                    isProcessing: false
                });

                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    this.setState({
                        discountedAmount: responseJson.promoDiscount,
                        discountedTotalAmount: responseJson.promoDiscount,
                        discountOnGrade: responseJson.gradeId,
                        amount: (selectedItems.includes(responseJson.gradeId)) ? (this.state.amount - responseJson.promoDiscount) : this.state.amount,
                        amountWithGST: 0,
                        ispromocodeApplied: true,
                        promoCodeAppliedText: getValue(LABEL.promoDis, this.state.langId) + ' ' + responseJson.promoDiscount + ' INR on ' + responseJson.gradeName,
                    }, () => {
                        this.calculateGST();
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    isProcessing: false,
                });
            });
    }

    async scratchCardAPI() {
        this.setState({
            isProcessing: true
        });

        return fetch(await url(STRING.baseURL) + STRING.getScratchCardDetails + this.state.scratchCard, {
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
                    isProcessing: false
                });

                if (statusCode == 400) {
                    SimpleToast.show(responseJson.message);
                } else {
                    db.getOneGrade(grade => {
                        if (grade == null) {
                            SimpleToast.show(getMessage(MESSAGE.gradeNotEnrolled, this.state.langId) + responseJson.gradeName);
                        } else {
                            if (grade.transactionId != null && grade.transactionId != '' && grade.transactionId != 'null') {
                                SimpleToast.show(getMessage(MESSAGE.gradeAlreadyPurchased, this.state.langId));
                            } else {
                                this.setState({
                                    isScratchCardApplied: true,
                                    scratchCardAppliedText: getValue(LABEL.scratchApplied, this.state.langId) + ' ' + responseJson.gradeName,
                                }, () => {
                                    this.updateSemesterAPI(null, responseJson);
                                })
                            }
                        }
                    }, responseJson.gradeId);
                }
            })
            .catch((error) => {
                this.setState({
                    isProcessing: false,
                });
            });
    }

    initiatePayment(amount) {
        var options = {
            description: 'MyTeacher App',
            image: resourceBaseURL + 'noimage.png',
            currency: 'INR',
            key: 'rzp_test_T3tuSIDZofAwuF',
            amount: amount,
            name: this.state.userDetails.name,
            order_id: this.state.orderID,//Replace this with an order_id created using Orders API. Learn more at https://razorpay.com/docs/api/orders.
            prefill: {
                email: this.state.userDetails.email,
                contact: this.state.userDetails.phoneNumber,
                name: this.state.userDetails.name
            },
            theme: { color: COLORS.blue }
        }

        RazorpayCheckout.open(options).then((data) => {
            this.updateSemesterAPI(data, null);
        }).catch((error) => {
            SimpleToast.show(error.description);
        });
    }

    async updateSemesterAPI(orderData, scratchCardData) {

        try {
            let jsonArray = [], jsonObject = {}, fullURL = '';
            if (orderData == null) {
                fullURL = await url(STRING.baseURL) + STRING.paymentCallback + 'true';
                this.state.grades.forEach(element => {
                    if (element.GradeId == scratchCardData.GradeId) {
                        jsonArray[0] = {
                            GradeId: scratchCardData.gradeId,
                            LanguageId: scratchCardData.languageID,
                            ActualAmount: element.actualAmount,
                            PaidAmount: 0,
                        };
                    }
                })

                jsonObject = {
                    EmailId: this.state.userDetails.email,
                    TransactionId: '',
                    OrderId: '',
                    SignatureId: '',
                    PromoCode: '',
                    ReferalCode: '',
                    ScratchCard: this.state.scratchCard,
                    GradesDetail: jsonArray,
                };
            } else {
                fullURL = await url(STRING.baseURL) + STRING.paymentCallback + 'false';
                let count = 0;
                this.state.grades.forEach(element => {
                    let discount = 0;
                    if (element.gradeId == this.state.discountOnGrade) {
                        discount = this.state.discountedTotalAmount;
                    } else {
                        discount = 0;
                    }
                    let gstAmount = (Number(element.actualAmount) * gst) / 100;

                    if (selectedItems.includes(element.gradeId)) {
                        jsonArray[count] = {
                            GradeId: element.gradeId,
                            LanguageId: element.languageId,
                            ActualAmount: element.actualAmount,
                            PaidAmount: ((Number(element.actualAmount) - discount) + gstAmount).toFixed(0),
                        }
                        count++;
                    }
                });

                jsonObject = {
                    EmailId: this.state.userDetails.email,
                    TransactionId: orderData.razorpay_payment_id,
                    OrderId: this.state.orderID,
                    SignatureId: orderData.razorpay_signature,
                    PromoCode: this.state.promoCode,
                    ReferalCode: this.state.referralCode,
                    ScratchCard: '',
                    GradesDetail: jsonArray,
                };
            }

            this.setState({
                isProcessing: true
            });

            return fetch(fullURL, {
                method: 'POST',
                body: JSON.stringify(jsonObject),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        isProcessing: false
                    });

                    if (responseJson.length > 0) {
                        db.updateGrades(data => {
                            if (data == 400) {
                                SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
                            } else {
                                this.setState({
                                    proceedText: getValue(LABEL.PROCEED, this.state.langId),
                                    promoCodeAppliedText: '',
                                    ispromocodeApplied: false,
                                })
                                this.getUserData();
                            }
                        }, responseJson);
                    } else {
                        SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
                    }
                })
                .catch((error) => {
                    this.setState({
                        isProcessing: false,
                    });
                });
        } catch (error) {
            console.log(error);
        }


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
                <Text style={{ marginTop: 35, padding: 12, textAlign: 'left', fontSize: 18, color: COLORS.blue, position: 'absolute' }} >{getValue(LABEL.buyPackages, this.state.langId)}</Text>

                <View style={{ alignSelf: 'center', marginTop: 150, position: 'absolute', width: '80%', height: '55%' }}>
                    {this.state.isLoading
                        ?
                        <View style={{ margin: 15 }}>
                            <ActivityIndicator size="small" />
                        </View>
                        :
                        this.state.isGradesAvailable ?
                            <FlatList
                                data={this.state.grades}
                                style={{ alignSelf: 'center', width: '100%' }}
                                renderItem={({ item, index }) => (
                                    <View style={{ backgroundColor: COLORS.white, elevation: 4, borderColor: COLORS.white, borderRadius: 10, margin: 6 }}>
                                        <CheckBox
                                            disabled={item.transactionId != null && item.transactionId != '' && item.transactionId != 'null' ? true : false}
                                            title={item.gradeName}
                                            checked={item.isSelected}
                                            checkedIcon={<Image source={require('../images/ic_checked.png')} />}
                                            uncheckedIcon={(item.transactionId != null && item.transactionId != '' && item.transactionId != 'null') ? <Image source={require('../images/ic_unchecked_grey.png')} /> : <Image source={require('../images/ic_unchecked.png')} />}
                                            containerStyle={{ backgroundColor: COLORS.white, borderColor: COLORS.white, borderRadius: 10, height: 70 }}
                                            textStyle={{ color: (item.transactionId != null && item.transactionId != '' && item.transactionId != 'null') ? '#9f9e9e' : COLORS.black }}
                                            onPress={() => this.onCheckBoxClick(item, index)} />
                                        {item.transactionId != null && item.transactionId != '' && item.transactionId != 'null' ?
                                            <Text style={{ color: COLORS.darkGrey, position: 'absolute', bottom: 10, right: 20 }} numberOfLines={1}>{getValue(LABEL.expiryOn, this.state.langId)} {item.endDate.substring(0, item.endDate.indexOf("T"))}</Text>
                                            :
                                            <Text style={{ color: COLORS.darkGrey, position: 'absolute', bottom: 10, right: 20 }} numberOfLines={1}>{getValue(LABEL.price, this.state.langId)} {'\u20B9'}{item.actualAmount}</Text>
                                        }
                                    </View>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            <Text style={{ paddingTop: 15, paddingBottom: 5, textAlign: 'center', fontSize: 16, color: COLORS.darkGrey }} >{getMessage(MESSAGE.noGrades, this.state.langId)}</Text>
                    }
                </View>

                <View style={{ width: '100%', flexDirection: 'column', alignSelf: "center", position: 'absolute', bottom: 0 }}>
                    {/* <TouchableOpacity style={{ justifyContent: 'center', flex: 0.25 }} onPress={() => this.props.navigation.navigate('')}> */}
                    <View>
                        {this.state.isScratchCardApplied ?
                            <Text style={{ backgroundColor: COLORS.grey_light, textAlignVertical: 'center', height: 40, marginTop: 5, paddingStart: 10 }}>{this.state.scratchCardAppliedText}</Text>
                            :
                            <TextInput style={{ backgroundColor: COLORS.grey_light, height: 40, marginTop: 5, paddingStart: 10 }} placeholder={getValue(LABEL.haveScratch, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                onChangeText={
                                    scratchCard => this.setState({ scratchCard })
                                }>
                            </TextInput>
                        }
                        <TouchableOpacity
                            style={{ alignSelf: 'flex-end', position: 'absolute', height: '100%' }}
                            onPress={() => { this.scratchCardAPI() }}>
                            {this.state.isScratchCardApplied ?
                                <Text style={{ height: '100%', textAlignVertical: 'center', color: COLORS.blue, paddingEnd: 8 }}></Text>
                                :
                                <Text style={{ height: '100%', textAlignVertical: 'center', color: COLORS.blue, paddingEnd: 8 }}> {getValue(LABEL.aPPLY, this.state.langId)} </Text>
                            }
                        </TouchableOpacity>
                    </View>
                    <View>
                        {this.state.ispromocodeApplied ?
                            <Text style={{ backgroundColor: COLORS.grey_light, textAlignVertical: 'center', height: 40, marginTop: 5, paddingStart: 10 }}>{this.state.promoCodeAppliedText}</Text>
                            :
                            <TextInput style={{ backgroundColor: COLORS.grey_light, height: 40, marginTop: 5, paddingStart: 10 }} placeholder={getValue(LABEL.havePromo, this.state.langId)}
                                placeholderTextColor={COLORS.darkGrey}
                                onChangeText={
                                    promoCode => this.setState({ promoCode })
                                }>
                            </TextInput>
                        }
                        <TouchableOpacity
                            style={{ alignSelf: 'flex-end', position: 'absolute', height: '100%' }}
                            onPress={() => { this.promoCodeAPI() }}>
                            {this.state.ispromocodeApplied ?
                                <Text style={{ height: '100%', textAlignVertical: 'center', color: COLORS.blue, paddingEnd: 8 }}></Text>
                                :
                                <Text style={{ height: '100%', textAlignVertical: 'center', color: COLORS.blue, paddingEnd: 8 }}> {getValue(LABEL.aPPLY, this.state.langId)} </Text>
                            }
                        </TouchableOpacity>
                    </View>
                    {/* <TextInput style={{ backgroundColor: COLORS.grey_light, height: 40, marginTop: 5, paddingStart: 10 }} placeholder="Having referral code?"
                        placeholderTextColor={COLORS.darkGrey}
                        onChangeText={
                            referralCode => this.setState({ referralCode })
                        }>
                    </TextInput> */}
                    <Text style={{ alignSelf: 'center' }}>{this.state.gstText}</Text>
                    {this.state.isProcessing ?
                        <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={{ height: 35, borderRadius: 5, margin: 4, justifyContent: 'center' }}>
                            <ActivityIndicator color={COLORS.white} />
                        </LinearGradient>
                        :
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => this.orderIDAPI()}>
                            <LinearGradient colors={[COLORS.orange_top, COLORS.orange_bottom]} style={{ height: 35, borderRadius: 5, margin: 4 }}>
                                <Text style={styles.submitButtonText}>{this.state.proceedText}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    }
                </View>
            </View >
        )
    }
}

export default BuyPackageActivity

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
        textAlign: 'center',
        height: '100%',
        textAlignVertical: 'center'
    }
})