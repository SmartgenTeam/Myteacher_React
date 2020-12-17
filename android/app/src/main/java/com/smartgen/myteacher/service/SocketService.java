/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.smartgen.myteacher.service;

import android.annotation.TargetApi;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.smartgen.myteacher.BuildConfig;
import com.smartgen.myteacher.util.PreferenceConnector;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author kakkadn
 */
public class SocketService extends Service {
    private ServerSocket serverSocket;
    private Socket socket;

    void I_l() {
        try {
            try {
                serverSocket = assignPort(); // Creating a server socket, bound to the specified port
//                serverSocket = new ServerSocket(6580); // Creating a server socket, bound to the specified port
            } catch (Exception e) {
                e.printStackTrace();
            }

            while (true) {
                socket = serverSocket.accept();
                new DecryptNUnTweakFile(this, serverSocket, socket, threadPool);
//                new DecryptNUnTweakFile_ST_Old(serverSocket, socket);
//                new DecryptNUnTweakFile_ST(serverSocket, socket);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                serverSocket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    ExecutorService threadPool = Executors.newFixedThreadPool(20);

    private ServerSocket assignPort() {

        ServerSocket serverSocket = null;
        for (int j = 1111; j < 9999; j++) {
            try {
                serverSocket = new ServerSocket(j);// Creating a server socket, bound to the specified port
                PreferenceConnector.writeInteger(this, PreferenceConnector.PORT, j);
                break;
            } catch (Exception e) {
            }
        }
        return serverSocket;
    }

    @TargetApi(Build.VERSION_CODES.O)
    private void startMyOwnForeground() {
        String NOTIFICATION_CHANNEL_ID = BuildConfig.APPLICATION_ID;
        String channelName = BuildConfig.APPLICATION_ID + "_SERVICE";
        NotificationChannel chan = new NotificationChannel(NOTIFICATION_CHANNEL_ID, channelName, NotificationManager.IMPORTANCE_NONE);
        chan.setLightColor(Color.BLUE);
        chan.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        assert manager != null;
        manager.createNotificationChannel(chan);

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID);
        Notification notification = notificationBuilder.setOngoing(true)
                .setContentTitle("Happy to serve")
                .setPriority(NotificationManager.IMPORTANCE_HIGH)
                .setCategory(Notification.CATEGORY_SERVICE)
                .build();
        startForeground(2, notification);
    }

    Thread l = new Thread(new Runnable() {
        @Override
        public void run() {
            try {
                I_l();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    });


    @Override
    public void onCreate() {
        super.onCreate();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                startMyOwnForeground();
//            else
//                startForeground(1, new NotificationData());

            l.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        return Service.START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            stopForeground(true);
            stopSelf();
        }
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            stopForeground(true);
            stopSelf();
        }
    }
}
