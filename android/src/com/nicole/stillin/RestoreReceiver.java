package com.nicole.stillin;
import android.content.*;
public class RestoreReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c,Intent i){State.fire(c);}
}
