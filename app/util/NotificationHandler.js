import PushNotification from 'react-native-push-notification';
import DBMigrationHelper from '../dbhelper/DBMigrationHelper';
import { STRING, url } from '../values/string';
import SimpleToast from 'react-native-simple-toast';
var db;

class NotificationHandler {
  constructor() {
    db = DBMigrationHelper.getInstance();
  }

  onNotification(notification) {
    console.log('NOtu:', notification);

    this.storeNotification(notification);

    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  onRegister(token) {
    console.log('NotificationHandler:', token);

    this.syncToken(token.token);

    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

  attachRegister(handler) {
    this._onRegister = handler;
  }

  attachNotification(handler) {
    this._onNotification = handler;
  }

  storeNotification(notification) {
    try {
      let date = (new Date().getDate() <= 9) ? '0' + new Date().getDate() : new Date().getDate();
      let month = ((new Date().getMonth() + 1) <= 9) ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
      let year = (new Date().getFullYear() <= 9) ? '0' + new Date().getFullYear() : new Date().getFullYear();
      let hours = (new Date().getHours() <= 9) ? '0' + new Date().getHours() : new Date().getHours();
      let min = (new Date().getMinutes() <= 9) ? '0' + new Date().getMinutes() : new Date().getMinutes();
      let str = date + "-" + month + "-" + year + " " + hours + ":" + min;

      db.insertNotificationData(null, notification.title, str, notification.message);
    } catch (error) {
      console.log(error);
    }
  }

  syncToken(token) {
    db.getUserDetails(user => {
      this.updateDeviceTokenAPI(user.email, token)
    });
  }

  async updateDeviceTokenAPI(email, token) {
    var data = {
      Email: email,
      DeviceToken: token
    };

    return fetch(await url(STRING.baseURL) + STRING.updateDeviceToken, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then(response => {
        const statusCode = response.status;
        const data = response;
        return Promise.all([statusCode, data]);
      })
      .then(([statusCode, responseJson]) => {

        if (statusCode == 400) {
          this.setState({
            isLoading: false
          });
          SimpleToast.show(responseJson.message);
        } else {
          console.log("Token Updated");
        }
      })
      .catch((error) => {
      });

  }
}

const handler = new NotificationHandler();

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: handler.onRegister.bind(handler),

  // (required) Called when a remote or local notification is opened or received
  onNotification: handler.onNotification.bind(handler),

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  requestPermissions: true,
});

export default handler;
