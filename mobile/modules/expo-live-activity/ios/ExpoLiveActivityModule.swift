import ActivityKit
import ExpoModulesCore
import Foundation

private let onLiveActivityUpdate = "onLiveActivityUpdate"
private let onLiveActivityEnd = "onLiveActivityEnd"
private let onWidgetCompleteActivity = "onWidgetCompleteActivity"
private let appGroupIdentifier = "group.run.hikers.app"
private let pendingWidgetActionKey = "pendingWidgetAction"
private let pendingWidgetActivityIdKey = "pendingWidgetActivityId"
private let pendingWidgetElapsedTimeKey = "pendingWidgetElapsedTime"
private let pendingWidgetActionCreatedAtKey = "pendingWidgetActionCreatedAt"

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

  static func pauseActivity(activityId: String?) async -> Activity<LiveActivityAttributes>? {
    guard let activity = findActivity(activityId: activityId) else {
      return nil
    }

    let currentState = activity.content.state
    guard currentState.pausedAt == nil else {
      return activity
    }

    await activity.update(ActivityContent(
      state: LiveActivityAttributes.ContentState(startedAt: currentState.startedAt, pausedAt: Date()),
      staleDate: nil
    ))

    return activity
  }

  static func resumeActivity(activityId: String?) async -> Activity<LiveActivityAttributes>? {
    guard let activity = findActivity(activityId: activityId) else {
      return nil
    }

    let currentState = activity.content.state
    guard let pausedAt = currentState.pausedAt else {
      return activity
    }

    let elapsedTime = pausedAt.timeIntervalSince(currentState.startedAt)
    await activity.update(ActivityContent(
      state: LiveActivityAttributes.ContentState(
        startedAt: Date().addingTimeInterval(-elapsedTime),
        pausedAt: nil
      ),
      staleDate: nil
    ))

    return activity
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
      pausedAt: now
    )

    await activity.end(
      ActivityContent(state: finalState, staleDate: nil),
      dismissalPolicy: .immediate
    )

    return activity
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

  static func statusPayload(for activity: Activity<LiveActivityAttributes>) -> [String: Any] {
    let state = activity.content.state

    return [
      "state": state.timerState(),
      "activityId": activity.id,
      "elapsedTime": Int(state.elapsedTime())
    ]
  }

  private static func findActivity(activityId: String?) -> Activity<LiveActivityAttributes>? {
    if let activityId = activityId, !activityId.isEmpty {
      return Activity<LiveActivityAttributes>.activities.first { $0.id == activityId }
    }

    return Activity<LiveActivityAttributes>.activities.first
  }
}

public class ExpoLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoLiveActivityModule")

    Events(onLiveActivityUpdate, onLiveActivityEnd, onWidgetCompleteActivity)

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
        guard let activity = await LiveActivityTimer.pauseActivity(activityId: activityId) else {
          promise.resolve(false)
          return
        }

        sendEvent(onLiveActivityUpdate, LiveActivityTimer.statusPayload(for: activity))
        promise.resolve(true)
      }
    }

    AsyncFunction("resumeActivity") { (activityId: String?, promise: Promise) in
      guard #available(iOS 16.2, *) else {
        promise.resolve(false)
        return
      }

      Task {
        guard let activity = await LiveActivityTimer.resumeActivity(activityId: activityId) else {
          promise.resolve(false)
          return
        }

        sendEvent(onLiveActivityUpdate, LiveActivityTimer.statusPayload(for: activity))
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
}
