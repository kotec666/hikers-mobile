import ActivityKit
import ExpoModulesCore
import Foundation

private let onLiveActivityUpdate = "onLiveActivityUpdate"
private let onLiveActivityEnd = "onLiveActivityEnd"
private let onWidgetCompleteActivity = "onWidgetCompleteActivity"
private let onWidgetAction = "onWidgetAction"
private let appGroupIdentifier = "group.run.hikers.app"
private let pendingWidgetActionKey = "pendingWidgetAction"
private let pendingWidgetActivityIdKey = "pendingWidgetActivityId"
private let pendingWidgetElapsedTimeKey = "pendingWidgetElapsedTime"
private let pendingWidgetActionCreatedAtKey = "pendingWidgetActionCreatedAt"
private let widgetActionDarwinNotificationName = "run.hikers.app.liveActivityWidgetAction"

private let widgetActionNotificationCallback: CFNotificationCallback = { _, observer, _, _, _ in
  guard let observer else {
    return
  }

  let module = Unmanaged<ExpoLiveActivityModule>.fromOpaque(observer).takeUnretainedValue()
  module.handleWidgetActionNotification()
}

@available(iOS 16.2, *)
private enum LiveActivityTimer {
  static func startActivity(activityName: String, activityIcon: String) throws -> Activity<LiveActivityAttributes> {
    let attributes = LiveActivityAttributes(activityName: activityName, activityIcon: activityIcon)
    let content = ActivityContent(
      state: LiveActivityAttributes.ContentState(startedAt: Date(), pausedAt: nil),
      staleDate: nil
    )

    return try Activity<LiveActivityAttributes>.request(
      attributes: attributes,
      content: content,
      pushType: nil
    )
  }

  static func pauseActivity(activityId: String?) async -> (activity: Activity<LiveActivityAttributes>, state: LiveActivityAttributes.ContentState)? {
    guard let activity = findActivity(activityId: activityId) else {
      return nil
    }

    let currentState = activity.content.state
    guard currentState.pausedAt == nil else {
      return (activity, currentState)
    }

    let pausedState = LiveActivityAttributes.ContentState(
      startedAt: currentState.startedAt,
      pausedAt: Date(),
      lastLocationTimestamp: currentState.lastLocationTimestamp
    )
    await activity.update(ActivityContent(
      state: pausedState,
      staleDate: nil
    ))

    return (activity, pausedState)
  }

  static func resumeActivity(activityId: String?) async -> (activity: Activity<LiveActivityAttributes>, state: LiveActivityAttributes.ContentState)? {
    guard let activity = findActivity(activityId: activityId) else {
      return nil
    }

    let currentState = activity.content.state
    guard let pausedAt = currentState.pausedAt else {
      return (activity, currentState)
    }

    let elapsedTime = pausedAt.timeIntervalSince(currentState.startedAt)
    let resumedState = LiveActivityAttributes.ContentState(
      startedAt: Date().addingTimeInterval(-elapsedTime),
      pausedAt: nil,
      lastLocationTimestamp: currentState.lastLocationTimestamp
    )
    await activity.update(ActivityContent(
      state: resumedState,
      staleDate: nil
    ))

    return (activity, resumedState)
  }

  static func endActivity(activityId: String?) async -> Activity<LiveActivityAttributes>? {
    guard let activity = findActivity(activityId: activityId) else {
      return nil
    }

    let now = Date()
    let currentState = activity.content.state
    let elapsedTime = currentState.elapsedTime(now: now)
    let finalState = LiveActivityAttributes.ContentState(
      startedAt: now.addingTimeInterval(-elapsedTime),
      pausedAt: now,
      lastLocationTimestamp: currentState.lastLocationTimestamp
    )

    await activity.end(
      ActivityContent(state: finalState, staleDate: nil),
      dismissalPolicy: .immediate
    )

    return activity
  }

  static func updateLastLocationTimestamp(
    activityId: String?,
    timestamp: Double
  ) async -> (activity: Activity<LiveActivityAttributes>, state: LiveActivityAttributes.ContentState)? {
    guard let activity = findActivity(activityId: activityId) else {
      return nil
    }

    let currentState = activity.content.state
    let updatedState = LiveActivityAttributes.ContentState(
      startedAt: currentState.startedAt,
      pausedAt: currentState.pausedAt,
      lastLocationTimestamp: timestamp
    )

    await activity.update(ActivityContent(
      state: updatedState,
      staleDate: nil
    ))

    return (activity, updatedState)
  }

  static func getTimerStatus(activityId: String? = nil) -> [String: Any] {
    guard let activity = findActivity(activityId: activityId) else {
      return [
        "state": "finished",
        "activityId": "",
        "elapsedTime": 0
      ]
    }

    return statusPayload(for: activity)
  }

  static func getActiveActivities() -> [[String: String]] {
    return Activity<LiveActivityAttributes>.activities.map { activity in
      [
        "id": activity.id,
        "activityName": activity.attributes.activityName
      ]
    }
  }

  static func statusPayload(
    for activity: Activity<LiveActivityAttributes>,
    state: LiveActivityAttributes.ContentState? = nil
  ) -> [String: Any] {
    let state = state ?? activity.content.state
    var payload: [String: Any] = [
      "state": state.timerState(),
      "activityId": activity.id,
      "elapsedTime": Int(state.elapsedTime())
    ]

    if let lastLocationTimestamp = state.lastLocationTimestamp {
      payload["lastLocationTimestamp"] = lastLocationTimestamp
    }

    return payload
  }

  private static func findActivity(activityId: String?) -> Activity<LiveActivityAttributes>? {
    if let activityId = activityId, !activityId.isEmpty {
      return Activity<LiveActivityAttributes>.activities.first { $0.id == activityId }
    }

    return Activity<LiveActivityAttributes>.activities.first
  }
}

public class ExpoLiveActivityModule: Module {
  private var isObservingWidgetActions = false

  public func definition() -> ModuleDefinition {
    Name("ExpoLiveActivityModule")

    Events(onLiveActivityUpdate, onLiveActivityEnd, onWidgetCompleteActivity, onWidgetAction)

    OnCreate {
      startObservingWidgetActions()
    }

    OnDestroy {
      stopObservingWidgetActions()
    }

    Function("isLiveActivityAvailable") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }

      return false
    }

    AsyncFunction("startActivity") { (activityName: String, activityIcon: String, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve("")
        return
      }

      do {
        let activity = try LiveActivityTimer.startActivity(
          activityName: activityName,
          activityIcon: activityIcon
        )
        sendEvent(onLiveActivityUpdate, LiveActivityTimer.statusPayload(for: activity))
        promise.resolve(activity.id)
      } catch {
        promise.reject(UnexpectedException(error))
      }
    }

    AsyncFunction("pauseActivity") { (activityId: String?, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve(false)
        return
      }

      Task {
        guard let result = await LiveActivityTimer.pauseActivity(activityId: activityId) else {
          promise.resolve(false)
          return
        }

        sendEvent(onLiveActivityUpdate, LiveActivityTimer.statusPayload(for: result.activity, state: result.state))
        promise.resolve(true)
      }
    }

    AsyncFunction("resumeActivity") { (activityId: String?, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve(false)
        return
      }

      Task {
        guard let result = await LiveActivityTimer.resumeActivity(activityId: activityId) else {
          promise.resolve(false)
          return
        }

        sendEvent(onLiveActivityUpdate, LiveActivityTimer.statusPayload(for: result.activity, state: result.state))
        promise.resolve(true)
      }
    }

    AsyncFunction("updateActivity") { (activityId: String?, lastLocationTimestamp: Double, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve(false)
        return
      }

      Task {
        guard let result = await LiveActivityTimer.updateLastLocationTimestamp(
          activityId: activityId,
          timestamp: lastLocationTimestamp
        ) else {
          promise.resolve(false)
          return
        }

        sendEvent(onLiveActivityUpdate, LiveActivityTimer.statusPayload(for: result.activity, state: result.state))
        promise.resolve(true)
      }
    }

    AsyncFunction("endActivity") { (activityId: String?, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve(false)
        return
      }

      Task {
        guard let activity = await LiveActivityTimer.endActivity(activityId: activityId) else {
          promise.resolve(false)
          return
        }

        let finalState = [
          "id": activity.id,
          "endedAt": Int(Date().timeIntervalSince1970)
        ]

        sendEvent(onLiveActivityEnd, finalState)
        promise.resolve(true)
      }
    }

    AsyncFunction("getTimerStatus") { (promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve([
          "state": "finished",
          "activityId": "",
          "elapsedTime": 0
        ])
        return
      }

      promise.resolve(LiveActivityTimer.getTimerStatus())
    }

    Function("getActiveActivities") { () -> [[String: String]] in
      if #available(iOS 16.2, *) {
        return LiveActivityTimer.getActiveActivities()
      }

      return []
    }

    Function("consumePendingWidgetAction") { () -> [String: Any]? in
      return consumePendingWidgetActionPayload()
    }
  }

  private func startObservingWidgetActions() {
    guard !isObservingWidgetActions else {
      return
    }

    CFNotificationCenterAddObserver(
      CFNotificationCenterGetDarwinNotifyCenter(),
      Unmanaged.passUnretained(self).toOpaque(),
      widgetActionNotificationCallback,
      widgetActionDarwinNotificationName as CFString,
      nil,
      .deliverImmediately
    )
    isObservingWidgetActions = true
  }

  private func stopObservingWidgetActions() {
    guard isObservingWidgetActions else {
      return
    }

    CFNotificationCenterRemoveObserver(
      CFNotificationCenterGetDarwinNotifyCenter(),
      Unmanaged.passUnretained(self).toOpaque(),
      CFNotificationName(widgetActionDarwinNotificationName as CFString),
      nil
    )
    isObservingWidgetActions = false
  }

  fileprivate func handleWidgetActionNotification() {
    DispatchQueue.main.async { [weak self] in
      guard let self, let payload = self.consumePendingWidgetActionPayload() else {
        return
      }

      self.sendEvent(onWidgetAction, payload)

      if let action = payload["action"] as? String, action == "pause" || action == "resume" {
        self.sendEvent(onLiveActivityUpdate, [
          "state": action == "pause" ? "paused" : "active",
          "activityId": payload["activityId"] as? String ?? "",
          "elapsedTime": payload["elapsedTime"] as? Int ?? 0
        ])
      }
    }
  }

  private func consumePendingWidgetActionPayload() -> [String: Any]? {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier),
          let action = defaults.string(forKey: pendingWidgetActionKey) else {
      return nil
    }

    let payload: [String: Any] = [
      "action": action,
      "activityId": defaults.string(forKey: pendingWidgetActivityIdKey) ?? "",
      "elapsedTime": defaults.integer(forKey: pendingWidgetElapsedTimeKey),
      "createdAt": defaults.double(forKey: pendingWidgetActionCreatedAtKey)
    ]

    defaults.removeObject(forKey: pendingWidgetActionKey)
    defaults.removeObject(forKey: pendingWidgetActivityIdKey)
    defaults.removeObject(forKey: pendingWidgetElapsedTimeKey)
    defaults.removeObject(forKey: pendingWidgetActionCreatedAtKey)

    return payload
  }
}
