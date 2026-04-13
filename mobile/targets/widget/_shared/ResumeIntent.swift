import AppIntents
import ActivityKit
import Foundation
import WidgetKit
internal import ExpoLiveActivity

@available(iOS 16.2, *)
struct ResumeIntent: AppIntent, LiveActivityIntent {
    static var title: LocalizedStringResource = "Resume Timer"
    static var description: IntentDescription = "Resumes the current timer."

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
        guard let pausedAt = currentState.pausedAt else {
            return .result()
        }

        let elapsedTime = pausedAt.timeIntervalSince(currentState.startedAt)
        await activity.update(ActivityContent(
            state: LiveActivityAttributes.ContentState(
                startedAt: Date().addingTimeInterval(-elapsedTime),
                pausedAt: nil
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
