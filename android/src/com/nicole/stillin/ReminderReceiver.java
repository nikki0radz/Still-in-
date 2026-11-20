package com.nicole.stillin;
import android.app.*;import android.content.*;
public class ReminderReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c,Intent i){if("com.nicole.stillin.TEST".equals(i.getAction())){State.channels(c);Notification n=new Notification.Builder(c,State.ALERTS).setSmallIcon(R.drawable.ic_notification).setContentTitle("Still In? · Test reminder").setContentText("This is what a removal reminder sounds like.").setContentIntent(State.open(c)).setAutoCancel(true).setCategory(Notification.CATEGORY_ALARM).build();c.getSystemService(NotificationManager.class).notify(99,n);}else State.fire(c);}
}
