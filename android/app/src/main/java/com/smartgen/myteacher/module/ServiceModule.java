package com.smartgen.myteacher.module;

import android.content.Intent;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.smartgen.myteacher.service.SocketService;
import com.smartgen.myteacher.util.PreferenceConnector;

public class ServiceModule extends ReactContextBaseJavaModule {

    public ServiceModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() {
        return "ServiceModule";
    }

    @ReactMethod
    public void startService() {
        try {
            getCurrentActivity().startService(new Intent(getCurrentActivity(), SocketService.class));
        } catch (IllegalViewOperationException e) {
        }
    }

    @ReactMethod
    public void getDynamicPort(Callback errorCallback, Callback successCallback) {
        try {
            successCallback.invoke(PreferenceConnector.readInteger(getCurrentActivity(), PreferenceConnector.PORT, -1));
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }
}
