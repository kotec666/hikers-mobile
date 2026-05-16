import AppIntents
import ActivityKit
import Foundation
import WidgetKit
internal import ExpoLiveActivity

private let widgetActionDarwinNotificationName = "run.hikers.app.liveActivityWidgetAction"

@available(iOS 16.2, *)
struct CompleteIntent: AppIntent, LiveActivityIntent {
    static var title: LocalizedStringResource = "Complete Exercise"
    static var description: IntentDescription = "Opens the app to confirm completing the timer."
    static var openAppWhenRun: Bool = true

    @Parameter(title: "Activity ID")
    var activityId: String

    init() {
        self.activityId = ""
    }

    init(activityId: String) {
        self.activityId = activityId
    }

    func perform() async throws -> some IntentResult {
        let elapsedTime = findActivity().map { Int($0.content.state.elapsedTime()) } ?? 0

        let defaults = UserDefaults(suiteName: "group.run.hikers.app")
        defaults?.set("complete", forKey: "pendingWidgetAction")
        defaults?.set(activityId, forKey: "pendingWidgetActivityId")
        defaults?.set(elapsedTime, forKey: "pendingWidgetElapsedTime")
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
