import AppIntents
import ActivityKit
import Foundation
import WidgetKit
internal import ExpoLiveActivity

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

        await activity.update(ActivityContent(
            state: LiveActivityAttributes.ContentState(
                startedAt: currentState.startedAt,
                pausedAt: Date()
            ),
            staleDate: nil
        ))

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
