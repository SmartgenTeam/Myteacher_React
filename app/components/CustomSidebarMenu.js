//This is an example code for Navigation Drawer with Custom Side bar//
import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { DrawerActions } from "react-navigation-drawer";
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import COLORS from '../styles/color';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import { STRING, url } from '../values/string';
import LABEL from '../values/label';
import { getValue, getMessage } from '../util/Util';

var db;

export default class CustomSidebarMenu extends Component {
  constructor() {
    super();

    db = DBMigrationHelper.getInstance();
    this.items = [];

    this.state = {
      username: '',
      gradeName: '',
    };
  }

  async componentDidMount() {
    this.setState({
      langId: await AsyncStorage.getItem(STRING.LANGUAGEID),
    }, () => {
      console.log('langId', this.state.langId);
      this.items = [
        {
          navOptionThumb: require('../images/ic_my_account.png'),
          navOptionName: getValue(LABEL.profile, this.state.langId),
          screenToNavigate: 'profileActivity',
        },
        {
          navOptionThumb: require('../images/ic_notification1.png'),
          navOptionName: getValue(LABEL.notification, this.state.langId),
          screenToNavigate: 'notificationActivity',
        },
        {
          navOptionThumb: require('../images/ic_upgrade.png'),
          navOptionName: getValue(LABEL.buyPackages, this.state.langId),
          screenToNavigate: 'buyPackageActivity',
        },
        {
          navOptionThumb: require('../images/ic_refer.png'),
          navOptionName: getValue(LABEL.refer, this.state.langId),
          screenToNavigate: 'referEarnActivity',
        },
        // {
        //   navOptionThumb: require('../images/ic_wallet.png'),
        //   navOptionName: 'LABEL.myWallet',
        //   screenToNavigate: 'walletActivity',
        // },
        {
          navOptionThumb: require('../images/ic_support.png'),
          navOptionName: getValue(LABEL.contactUs, this.state.langId),
          screenToNavigate: 'contactUsActivity',
        },
        {
          navOptionThumb: require('../images/ic_logout.png'),
          navOptionName: getValue(LABEL.logout, this.state.langId),
          screenToNavigate: 'NavScreen3',
        },
      ];
    });

    this.getUserData();

    this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.getUserData();
      }
    );
  }

  getUserData() {
    db.getUserDetails(user => {
      if (user == null) {
        SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
      } else {
        this.setState({
          username: user.name
        }, () => this.setGrade());
      }
    });
  }

  async setGrade() {
    this.setState({
      gradeName: await AsyncStorage.getItem(STRING.GRADENAME),
      gradeId: await AsyncStorage.getItem(STRING.GRADEID),
    }, () => {
      db.getOneGrade(grade => {
        if (grade == null) {
          SimpleToast.show(getMessage(MESSAGE.wentWrong, this.state.langId));
        } else {
          this.setState({
            gradeName: grade.gradeName,
          })
        }
      }, this.state.gradeId);
    })
  }

  logoutUser() {
    db.logoutUser();

    AsyncStorage.setItem(STRING.USERNAME, '');
    AsyncStorage.setItem(STRING.PASSWORD, '');
    AsyncStorage.setItem(STRING.GRADEID, '');
    AsyncStorage.setItem(STRING.GRADENAME, '');

    this.props.navigation.replace('loginActivity');
  }

  render() {
    return (
      <View style={styles.sideMenuContainer}>
        <Image
          style={{ width: '100%', height: '100%' }}
          source={require('../images/img_sidebar_bg.png')}
        />
        <ScrollView style={{ width: '100%', height: '100%', position: 'absolute' }}>
          <Image
            source={require('../images/img_user.png')}
            style={styles.sideMenuProfileIcon}
          />
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: COLORS.blue, alignSelf: 'center' }} >{this.state.username}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              this.props.navigation.navigate('gradeActivity')
              this.props.navigation.dispatch(DrawerActions.closeDrawer())
            }}>
            <View style={{ flexDirection: 'row', marginBottom: 30, alignContent: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.black, alignSelf: 'center', textAlign: 'center' }} >{this.state.gradeName}</Text>
              <Image
                style={{ height: 15, width: 15, alignSelf: 'center' }}
                source={require('../images/ic_next_black.png')} />
            </View>
          </TouchableOpacity>

          {this.items.length != 0 ?
            <View style={{ width: '100%' }}>
              {this.items.map((item, key) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}
                  key={key}>
                  <View style={{ marginRight: 10, marginLeft: 20 }}>
                    <Image
                      style={{ height: 25, width: 25, alignSelf: 'center' }}
                      source={item.navOptionThumb} />
                  </View>
                  <Text
                    style={{
                      marginLeft: 15,
                      fontSize: 15,
                      color: COLORS.black,
                    }}
                    onPress={() => {
                      if (key != this.items.length - 1) {
                        global.currentScreenIndex = key;
                        this.props.navigation.navigate(item.screenToNavigate);
                        this.props.navigation.dispatch(DrawerActions.closeDrawer());
                      } else {
                        this.logoutUser();
                      }
                    }}>
                    {item.navOptionName}
                  </Text>
                </View>
              ))}
            </View>
            :
            null
          }
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  sideMenuContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 70,
    height: 70,
    marginTop: 30,
    marginBottom: 10,
    alignSelf: 'center'
  },
});