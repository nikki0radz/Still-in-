package com.nicole.stillin;
/** Pure time calculation shared with JVM tests. Deadlines are persisted timestamps. */
public final class Schedule {
 private static final long MINUTE=60000L;
 public static long next(long now,long due){
  long early=due-30*MINUTE;
  if(now<early)return early;
  if(now<due)return due;
  // Retry an overdue reminder every 15 minutes without extending the original deadline.
  return due+((now-due)/(15*MINUTE)+1)*(15*MINUTE);
 }
}
