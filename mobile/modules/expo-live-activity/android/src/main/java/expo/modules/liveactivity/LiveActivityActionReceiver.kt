package expo.modules.liveactivity

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class LiveActivityActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val action = when (intent.action) {
      ACTION_PAUSE -> "pause"
      ACTION_RESUME -> "resume"
      ACTION_COMPLETE -> "complete"
      else -> return
    }
    val activityId = intent.getStringExtra(EXTRA_ACTIVITY_ID) ?: ""

    val module = ExpoLiveActivityModule.sharedInstance
    val elapsed = module?.elapsedSecondsFor(activityId) ?: 0
    val createdAt = System.currentTimeMillis()

    storePendingWidgetAction(context, action, activityId, elapsed, createdAt)

    when (action) {
      "pause" -> module?.pauseActivityInternal(activityId)
      "resume" -> module?.resumeActivityInternal(activityId)
      "complete" -> Unit
    }

    module?.handleWidgetAction(action, activityId, elapsed, createdAt)
  }
}