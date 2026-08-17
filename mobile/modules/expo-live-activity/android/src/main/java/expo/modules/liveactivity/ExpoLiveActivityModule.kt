package expo.modules.liveactivity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.ConcurrentHashMap

internal const val CHANNEL_ID = "workout-live-activity"
internal const val NOTIFICATION_TAG = "workout-live-activity"
internal const val NOTIFICATION_ID = 6201

internal const val ACTION_PAUSE = "run.hikers.app.LIVE_ACTIVITY_PAUSE"
internal const val ACTION_RESUME = "run.hikers.app.LIVE_ACTIVITY_RESUME"
internal const val ACTION_COMPLETE = "run.hikers.app.LIVE_ACTIVITY_COMPLETE"

internal const val EXTRA_ACTIVITY_ID = "activityId"
internal const val EXTRA_ACTION = "widgetAction"

internal const val PREFS_NAME = "expo_live_activity"
internal const val PREFS_PENDING_ACTION = "pendingWidgetAction"
internal const val PREFS_PENDING_ACTIVITY_ID = "pendingWidgetActivityId"
internal const val PREFS_PENDING_ELAPSED = "pendingWidgetElapsedTime"
internal const val PREFS_PENDING_CREATED_AT = "pendingWidgetActionCreatedAt"

private val ACCENT_COLOR = android.graphics.Color.parseColor("#22CB5A")

internal fun storePendingWidgetAction(context: Context, action: String, activityId: String, elapsed: Long, createdAt: Long) {
  context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    .edit()
    .putString(PREFS_PENDING_ACTION, action)
    .putString(PREFS_PENDING_ACTIVITY_ID, activityId)
    .putLong(PREFS_PENDING_ELAPSED, elapsed)
    .putLong(PREFS_PENDING_CREATED_AT, createdAt)
    .apply()
}

private data class ActivityState(
  val activityName: String,
  val activityIcon: String,
  var startedAt: Long,
  var pausedAt: Long?,
  var lastLocationTimestamp: Long?,
  var distanceText: String,
  var speedText: String,
  var averageSpeedText: String,
  var timeRunningLabel: String,
  var timePausedLabel: String,
  var distanceLabel: String,
  var speedLabel: String,
  var averageSpeedLabel: String,
  var speedUnitLabel: String,
  var pauseActionLabel: String,
  var resumeActionLabel: String,
  var completeActionLabel: String,
)

class ExpoLiveActivityModule : Module() {
  companion object {
    @Volatile
    var sharedInstance: ExpoLiveActivityModule? = null
      private set
  }

  private val activities = ConcurrentHashMap<String, ActivityState>()
  private var latestActivityId: String? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoLiveActivityModule")

    Events("onLiveActivityUpdate", "onLiveActivityEnd", "onWidgetCompleteActivity", "onWidgetAction")

    OnCreate {
      sharedInstance = this@ExpoLiveActivityModule
      createChannel()
    }

    OnDestroy {
      if (sharedInstance === this@ExpoLiveActivityModule) {
        sharedInstance = null
      }
    }

    OnNewIntent { intent ->
      val action = intent.getStringExtra(EXTRA_ACTION)
      if (action == null) return@OnNewIntent
      val activityId = intent.getStringExtra(EXTRA_ACTIVITY_ID) ?: ""
      println("[LiveActivities] onNewIntent action=$action activityId=$activityId")
      val elapsed = elapsedSecondsFor(activityId)
      val createdAt = System.currentTimeMillis()
      val context = appContext.reactContext
      if (context != null) {
        storePendingWidgetAction(context, action, activityId, elapsed, createdAt)
      }
      handleWidgetAction(action, activityId, elapsed, createdAt)
    }

    Function("isLiveActivityAvailable") {
      true
    }

    AsyncFunction("startActivity") { activityName: String, activityIcon: String, labels: Map<String, String>, startedAtTimestamp: Double?, pausedAtTimestamp: Double?, promise: Promise ->
      promise.resolve(startActivityInternal(activityName, activityIcon, labels, startedAtTimestamp, pausedAtTimestamp))
    }

    AsyncFunction("pauseActivity") { activityId: String?, promise: Promise ->
      promise.resolve(pauseActivityInternal(activityId))
    }

    AsyncFunction("resumeActivity") { activityId: String?, promise: Promise ->
      promise.resolve(resumeActivityInternal(activityId))
    }

    AsyncFunction("updateActivity") { activityId: String?, distanceText: String, speedText: String, averageSpeedText: String, lastLocationTimestamp: Double, labels: Map<String, String>, promise: Promise ->
      promise.resolve(updateActivityInternal(activityId, distanceText, speedText, averageSpeedText, lastLocationTimestamp, labels))
    }

    AsyncFunction("endActivity") { activityId: String?, promise: Promise ->
      promise.resolve(endActivityInternal(activityId))
    }

    AsyncFunction("getTimerStatus") { promise: Promise ->
      val id = latestActivityId
      if (id == null || !activities.containsKey(id)) {
        promise.resolve(
          mapOf(
            "state" to "finished",
            "activityId" to "",
            "elapsedTime" to 0,
          )
        )
      } else {
        promise.resolve(statusPayload(id))
      }
    }

    Function("getActiveActivities") {
      activities.map { (id, state) ->
        mapOf(
          "id" to id,
          "activityName" to state.activityName,
          "activityIcon" to state.activityIcon,
        )
      }
    }

    Function("consumePendingWidgetAction") {
      val context = appContext.reactContext ?: return@Function null
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val action = prefs.getString(PREFS_PENDING_ACTION, null) ?: return@Function null
      val payload = mapOf(
        "action" to action,
        "activityId" to (prefs.getString(PREFS_PENDING_ACTIVITY_ID, "") ?: ""),
        "elapsedTime" to prefs.getLong(PREFS_PENDING_ELAPSED, 0),
        "createdAt" to prefs.getLong(PREFS_PENDING_CREATED_AT, 0),
      )
      prefs.edit().clear().apply()
      payload
    }
  }

  fun elapsedSecondsFor(activityId: String): Long {
    val state = activities[activityId] ?: return 0
    return elapsedMillis(state) / 1000
  }

  fun pauseActivityInternal(activityId: String?): Boolean {
    val id = resolveActivityId(activityId) ?: return false
    val state = activities[id] ?: return false
    if (state.pausedAt != null) return true
    state.pausedAt = System.currentTimeMillis()
    postNotification(id)
    sendEvent("onLiveActivityUpdate", statusPayload(id))
    return true
  }

  fun resumeActivityInternal(activityId: String?): Boolean {
    val id = resolveActivityId(activityId) ?: return false
    val state = activities[id] ?: return false
    val pausedAt = state.pausedAt ?: return true
    val elapsed = (pausedAt - state.startedAt).coerceAtLeast(0)
    state.startedAt = System.currentTimeMillis() - elapsed
    state.pausedAt = null
    postNotification(id)
    sendEvent("onLiveActivityUpdate", statusPayload(id))
    return true
  }

  fun endActivityInternal(activityId: String?): Boolean {
    val id = resolveActivityId(activityId) ?: return false
    activities.remove(id)
    if (latestActivityId == id) {
      latestActivityId = null
    }
    val context = appContext.reactContext
    if (context != null) {
      val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      try {
        notificationManager.cancel(NOTIFICATION_TAG, NOTIFICATION_ID)
      } catch (e: Exception) {
        println("[LiveActivities] failed to cancel notification: ${e.message}")
      }
    }
    sendEvent("onLiveActivityEnd", mapOf("id" to id, "endedAt" to (System.currentTimeMillis() / 1000)))
    return true
  }

  fun handleWidgetAction(action: String, activityId: String, elapsedTime: Long, createdAt: Long) {
    sendEvent(
      "onWidgetAction",
      mapOf(
        "action" to action,
        "activityId" to activityId,
        "elapsedTime" to elapsedTime,
        "createdAt" to createdAt,
      )
    )
    val context = appContext.reactContext
    if (context != null) {
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().clear().apply()
    }
  }

  private fun startActivityInternal(
    activityName: String,
    activityIcon: String,
    labels: Map<String, String>,
    startedAtTimestamp: Double?,
    pausedAtTimestamp: Double?,
  ): String {
    val startedAt = startedAtTimestamp?.toLong() ?: System.currentTimeMillis()
    val activityId = "live-activity-$startedAt"

    activities[activityId] = ActivityState(
      activityName = activityName,
      activityIcon = activityIcon,
      startedAt = startedAt,
      pausedAt = pausedAtTimestamp?.toLong(),
      lastLocationTimestamp = null,
      distanceText = "0",
      speedText = "0",
      averageSpeedText = "0",
      timeRunningLabel = labels["timeRunning"] ?: "",
      timePausedLabel = labels["timePaused"] ?: "",
      distanceLabel = labels["distance"] ?: "",
      speedLabel = labels["speed"] ?: "",
      averageSpeedLabel = labels["averageSpeed"] ?: "",
      speedUnitLabel = labels["speedUnit"] ?: "",
      pauseActionLabel = labels["pauseActionLabel"] ?: "",
      resumeActionLabel = labels["resumeActionLabel"] ?: "",
      completeActionLabel = labels["completeActionLabel"] ?: "",
    )
    latestActivityId = activityId

    postNotification(activityId)
    sendEvent("onLiveActivityUpdate", statusPayload(activityId))
    return activityId
  }

  private fun updateActivityInternal(
    activityId: String?,
    distanceText: String,
    speedText: String,
    averageSpeedText: String,
    lastLocationTimestamp: Double,
    labels: Map<String, String>,
  ): Boolean {
    val id = resolveActivityId(activityId) ?: return false
    val state = activities[id] ?: return false
    state.distanceText = distanceText
    state.speedText = speedText
    state.averageSpeedText = averageSpeedText
    if (lastLocationTimestamp > 0) {
      state.lastLocationTimestamp = lastLocationTimestamp.toLong()
    }
    labels["timeRunning"]?.let { state.timeRunningLabel = it }
    labels["timePaused"]?.let { state.timePausedLabel = it }
    labels["distance"]?.let { state.distanceLabel = it }
    labels["speed"]?.let { state.speedLabel = it }
    labels["averageSpeed"]?.let { state.averageSpeedLabel = it }
    labels["speedUnit"]?.let { state.speedUnitLabel = it }
    labels["pauseActionLabel"]?.let { state.pauseActionLabel = it }
    labels["resumeActionLabel"]?.let { state.resumeActionLabel = it }
    labels["completeActionLabel"]?.let { state.completeActionLabel = it }

    postNotification(id)
    sendEvent("onLiveActivityUpdate", statusPayload(id))
    return true
  }

  private fun resolveActivityId(activityId: String?): String? {
    if (activityId != null && activities.containsKey(activityId)) {
      return activityId
    }
    val latest = latestActivityId
    if (latest != null && activities.containsKey(latest)) {
      return latest
    }
    return activities.keys.firstOrNull()
  }

  private fun elapsedMillis(state: ActivityState): Long {
    val end = state.pausedAt ?: System.currentTimeMillis()
    return (end - state.startedAt).coerceAtLeast(0)
  }

  private fun statusPayload(activityId: String): Map<String, Any> {
    val state = activities[activityId] ?: return mapOf(
      "state" to "finished",
      "activityId" to "",
      "elapsedTime" to 0,
    )
    val payload = mutableMapOf<String, Any>(
      "state" to if (state.pausedAt != null) "paused" else "active",
      "activityId" to activityId,
      "elapsedTime" to (elapsedMillis(state) / 1000),
    )
    state.lastLocationTimestamp?.let { payload["lastLocationTimestamp"] = it }
    payload["distanceText"] = state.distanceText
    payload["speedText"] = state.speedText
    payload["averageSpeedText"] = state.averageSpeedText
    return payload
  }

  private fun createChannel() {
    val context = appContext.reactContext ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Workout live activity",
        NotificationManager.IMPORTANCE_LOW,
      ).apply {
        description = "Live workout progress"
        enableVibration(false)
        setShowBadge(false)
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      }
      val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      try {
        notificationManager.createNotificationChannel(channel)
      } catch (e: Exception) {
        println("[LiveActivities] failed to create channel: ${e.message}")
      }
    }
  }

  private fun postNotification(activityId: String) {
    val state = activities[activityId] ?: return
    val context = appContext.reactContext ?: return
    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(context)
    }

    val isPaused = state.pausedAt != null
    val elapsedText = formatElapsed(elapsedMillis(state))

    builder
      .setSmallIcon(getIconResId(state.activityIcon))
      .setContentTitle(state.activityName)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setCategory(Notification.CATEGORY_PROGRESS)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setColor(ACCENT_COLOR)

    val unit = state.speedUnitLabel.removeSurrounding("(", ")").trim()
    val speedLabel = state.speedLabel.removeSuffix(" ($unit)").ifBlank { state.speedLabel }
    val averageSpeedLabel = state.averageSpeedLabel.removeSuffix(" ($unit)").ifBlank { state.averageSpeedLabel }

    val bigText = buildString {
      appendLine("${state.distanceLabel}: ${state.distanceText}")
      appendLine("$speedLabel: ${state.speedText} $unit")
      append("$averageSpeedLabel: ${state.averageSpeedText} $unit")
    }
    builder.setStyle(Notification.BigTextStyle().bigText(bigText))

    if (isPaused) {
      builder.setUsesChronometer(false)
      builder.setShowWhen(false)
      builder.setContentText(elapsedText)
    } else {
      builder.setUsesChronometer(true)
      builder.setWhen(state.startedAt)
      builder.setShowWhen(true)
      builder.setContentText("${state.distanceLabel}: ${state.distanceText}")
    }

    val launchIntent = pendingLaunchIntent(context, activityId)
    builder.setContentIntent(launchIntent)

    addActions(builder, state, activityId)

    requestPromotedOngoing(builder)

    try {
      notificationManager.notify(NOTIFICATION_TAG, NOTIFICATION_ID, builder.build())
    } catch (e: Exception) {
      println("[LiveActivities] failed to post notification: ${e.message}")
    }
  }

  private fun addActions(builder: Notification.Builder, state: ActivityState, activityId: String) {
    val context = appContext.reactContext ?: return
    if (state.pausedAt != null) {
      builder.addAction(
        0,
        state.resumeActionLabel.ifBlank { "Resume" },
        actionPendingIntent(context, ACTION_RESUME, activityId),
      )
    } else {
      builder.addAction(
        0,
        state.pauseActionLabel.ifBlank { "Pause" },
        actionPendingIntent(context, ACTION_PAUSE, activityId),
      )
    }
    builder.addAction(
      0,
      state.completeActionLabel.ifBlank { "Finish" },
      completePendingIntent(context, activityId),
    )
  }

  private fun actionPendingIntent(context: Context, action: String, activityId: String): PendingIntent {
    val intent = Intent(context, LiveActivityActionReceiver::class.java)
      .setAction(action)
      .putExtra(EXTRA_ACTIVITY_ID, activityId)
    val requestCode = (activityId.hashCode() and 0x7fffffff) or (action.hashCode() and 0xffff)
    return PendingIntent.getBroadcast(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun completePendingIntent(context: Context, activityId: String): PendingIntent {
    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val intent = launchIntent?.addFlags(
      Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
    ) ?: Intent(context, LiveActivityActionReceiver::class.java)
    intent.putExtra(EXTRA_ACTION, ACTION_COMPLETE)
    intent.putExtra(EXTRA_ACTIVITY_ID, activityId)
    val requestCode = (activityId.hashCode() and 0x7fffffff) or (ACTION_COMPLETE.hashCode() and 0xffff)
    return PendingIntent.getActivity(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun pendingLaunchIntent(context: Context, activityId: String): PendingIntent {
    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val intent = launchIntent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      ?: Intent(context, LiveActivityActionReceiver::class.java)
    return PendingIntent.getActivity(
      context,
      activityId.hashCode() and 0x7fffffff,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun requestPromotedOngoing(builder: Notification.Builder) {
    try {
      val method = Notification.Builder::class.java.getMethod("setRequestPromotedOngoing", Boolean::class.javaPrimitiveType)
      method.invoke(builder, true)
    } catch (e: Exception) {
      // API < 36.1 (Android 16 QPR1) — промоушен в Live Update не поддерживается
    }
  }

  private fun getIconResId(icon: String): Int {
    val name = when (icon.uppercase()) {
      "RUNNING" -> "ic_activity_running"
      "WALKING" -> "ic_activity_walking"
      "BIKING" -> "ic_activity_biking"
      else -> "ic_activity_workout"
    }
    val context = appContext.reactContext ?: return android.R.drawable.ic_menu_compass
    val resId = context.resources.getIdentifier(name, "drawable", context.packageName)
    return if (resId != 0) resId else android.R.drawable.ic_menu_compass
  }

  private fun formatElapsed(millis: Long): String {
    val totalSeconds = millis / 1000
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return if (hours > 0) {
      String.format("%02d:%02d:%02d", hours, minutes, seconds)
    } else {
      String.format("%02d:%02d", minutes, seconds)
    }
  }
}