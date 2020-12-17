import LABEL_DA from "../values/label_da";
import MESSAGE_DA from "../values/message_da";
import LABEL_PS from "../values/label_ps";
import MESSAGE_PS from "../values/message_ps";

var getValue = (key1, languageID) => {
    if (languageID == 'DARI-101') {
        for (var i = 0; i <= LABEL_DA.LABEL_DA.length; i++) {
            for (var key in LABEL_DA.LABEL_DA[i]) {
                if (key == key1) {
                    return LABEL_DA.LABEL_DA[i][key];
                }
            }
        }
    } else {
        for (var i = 0; i <= LABEL_PS.LABEL_PS.length; i++) {
            for (var key in LABEL_PS.LABEL_PS[i]) {
                if (key == key1) {
                    return LABEL_PS.LABEL_PS[i][key];
                }
            }
        }
    }
}

var getMessage = (key1, languageID) => {
    if (languageID == 'DARI-101') {
        for (var i = 0; i <= MESSAGE_DA.MESSAGE_DA.length; i++) {
            for (var key in MESSAGE_DA.MESSAGE_DA[i]) {
                if (key == key1) {
                    return MESSAGE_DA.MESSAGE_DA[i][key];
                }
            }
        }
    } else {
        for (var i = 0; i <= MESSAGE_PS.MESSAGE_PS.length; i++) {
            for (var key in MESSAGE_PS.MESSAGE_PS[i]) {
                if (key == key1) {
                    return MESSAGE_PS.MESSAGE_PS[i][key];
                }
            }
        }
    }
}

export { getValue, getMessage }
