import AppIntents
import ActivityKit
import Foundation
import WidgetKit
internal import ExpoLiveActivity

private let widgetActionDarwinNotificationName = "run.hikers.app.liveActivityWidgetAction"

@available(iOS 16.2, *)
struct PauseIntent: AppIntent, LiveActivityIntent {
    static var title: LocalizedStringResource = "Pause Timer"
    static var description: IntentDescription = "Pauses the current timer."

    @Parameter(title: "Activity ID")
    var activityId: String

    init() {
        self.activityId = ""
    }

    init(activityId: String) {
        self.activityId = activityId
    }

    func perform() async throws -> some IntentResult {
        guard let activity = findActivity() else {
            return .result()
        }

        let currentState = activity.content.state
        guard currentState.pausedAt == nil else {
            return .result()
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

        let defaults = UserDefaults(suiteName: "group.run.hikers.app")
        defaults?.set("pause", forKey: "pendingWidgetAction")
        defaults?.set(activity.id, forKey: "pendingWidgetActivityId")
        defaults?.set(Int(pausedState.elapsedTime()), forKey: "pendingWidgetElapsedTime")
        defaults?.set(Date().timeIntervalSince1970, forKey: "pendingWidgetActionCreatedAt")
        CFNotificationCenterPostNotification(
            CFNotificationCenterGetDarwinNotifyCenter(),
            CFNotificationName(widgetActionDarwinNotificationName as CFString),
            nil,
            nil,
            true
        )

        return .result()
    }

    private func findActivity() -> Activity<LiveActivityAttributes>? {
        if !activityId.isEmpty,
           let activity = Activity<LiveActivityAttributes>.activities.first(where: { $0.id == activityId }) {
            return activity
        }

        return Activity<LiveActivityAttributes>.activities.first
    }
}
