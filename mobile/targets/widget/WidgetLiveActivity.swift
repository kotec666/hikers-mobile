import ActivityKit
import WidgetKit
import SwiftUI
import Foundation
internal import ExpoLiveActivity

private let activityYellow = Color(hex: "#FFC700")
private let activityGreen = Color(hex: "#22CB5A")
private let activityRed = Color(hex: "#F86266")
private let activityCardGray = Color(hex: "#444444")
private let activityTextPrimary = Color(hex: "#FDFDFD")
private let activityTextMuted = Color(hex: "#B2B3B7")

func mapJSIconToSFSymbol(_ jsIcon: String) -> String {
  switch jsIcon.uppercased() {
  case "WALKING":
    return "figure.walk"
  case "RUNNING":
    return "figure.run"
  case "BIKING":
    return "bicycle"
  case "WORKOUT":
    return "dumbbell.fill"
  default:
    return "figure.walk"
  }
}

extension Color {
  init(hex: String) {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let a, r, g, b: UInt64
    switch hex.count {
    case 3:
      (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6:
      (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
    case 8:
      (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
    default:
      (a, r, g, b) = (1, 1, 1, 0)
    }

    self.init(
      .sRGB,
      red: Double(r) / 255,
      green: Double(g) / 255,
      blue: Double(b) / 255,
      opacity: Double(a) / 255
    )
  }
}

struct LiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: LiveActivityAttributes.self) { context in
      LockScreenBanner(context: context)
        .activityBackgroundTint(activityCardGray)
        .activitySystemActionForegroundColor(activityYellow)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.bottom) {
          ExpandedBottom(context: context)
            .padding(.horizontal, 4)
            .padding(.vertical, 2)
        }
      } compactLeading: {
        CompactLeading(isPaused: !context.state.isRunning())
      } compactTrailing: {
        CompactTrailing(activityIcon: mapJSIconToSFSymbol(context.attributes.activityIcon))
      } minimal: {
        MinimalAttached(isPaused: !context.state.isRunning())
      }
    }
  }
}

// MARK: - Lock Screen / Banner
struct LockScreenBanner: View {
  let context: ActivityViewContext<LiveActivityAttributes>

  var body: some View {
    VStack(spacing: 0) {
      HStack {
        ActivityHeader(
          activityIcon: mapJSIconToSFSymbol(context.attributes.activityIcon),
          activityName: context.attributes.activityName
        )

        Spacer()

        LiveActivityControls(context: context, pauseBackgroundColor: Color.black.opacity(0.4))
      }

      MetricsRow(state: context.state, valueSize: 36)
        .padding(.vertical, 12)
    }
    .padding(.horizontal, 20)
    .padding(.vertical, 16)
  }
}

struct ActivityHeader: View {
  let activityIcon: String
  let activityName: String

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: activityIcon)
        .font(.system(size: 24, weight: .semibold))
        .foregroundColor(.white)

      Text(activityName)
        .font(.system(size: 16, weight: .bold))
        .foregroundStyle(.white)
        .lineLimit(1)
    }
  }
}

// MARK: - Dynamic Island Expanded
struct ExpandedBottom: View {
  let context: ActivityViewContext<LiveActivityAttributes>

  var body: some View {
    VStack(spacing: 0) {
      HStack {
        VStack(spacing: 6) {
          Image(systemName: mapJSIconToSFSymbol(context.attributes.activityIcon))
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.white)

          Text(context.attributes.activityName)
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(activityTextMuted)
            .lineLimit(1)
        }

        Spacer()

        LiveActivityControls(
          context: context,
          pauseBackgroundColor: Color(hex: "#B7B2B3").opacity(0.4),
          buttonSize: 34,
          pauseIconSize: 17,
          actionIconSize: 16,
          spacing: 8
        )
      }

      MetricsRow(state: context.state, valueSize: 26, labelSize: 9, columnSpacing: 4)
        .padding(.top, 8)
        .padding(.bottom, 6)
    }
  }
}

// MARK: - Compact / Minimal
struct CompactLeading: View {
  let isPaused: Bool

  var body: some View {
    StatusCircleIcon(isPaused: isPaused)
  }
}

struct CompactTrailing: View {
  let activityIcon: String

  var body: some View {
    Image(systemName: activityIcon)
      .font(.system(size: 15, weight: .semibold))
      .foregroundColor(.white)
  }
}

struct MinimalAttached: View {
  let isPaused: Bool

  var body: some View {
    StatusCircleIcon(isPaused: isPaused)
  }
}

struct StatusCircleIcon: View {
  let isPaused: Bool

  var body: some View {
    Image(systemName: isPaused ? "pause.circle" : "play.circle")
      .font(.system(size: 15, weight: .semibold))
      .foregroundColor(isPaused ? activityYellow : activityGreen)
  }
}

// MARK: - Controls
struct LiveActivityControls: View {
  let context: ActivityViewContext<LiveActivityAttributes>
  let pauseBackgroundColor: Color
  var buttonSize: CGFloat = 40
  var pauseIconSize: CGFloat = 20
  var actionIconSize: CGFloat = 19
  var spacing: CGFloat = 10

  var body: some View {
    HStack(spacing: spacing) {
      if context.state.isRunning() {
        Button(intent: PauseIntent(activityId: context.activityID)) {
          CircleButton(
            systemName: "pause.fill",
            backgroundColor: pauseBackgroundColor,
            foregroundColor: .white,
            buttonSize: buttonSize,
            iconSize: pauseIconSize
          )
        }
        .buttonStyle(.plain)
      } else {
        Button(intent: ResumeIntent(activityId: context.activityID)) {
          CircleButton(
            systemName: "play.fill",
            backgroundColor: activityGreen.opacity(0.4),
            foregroundColor: activityGreen,
            buttonSize: buttonSize,
            iconSize: actionIconSize
          )
        }
        .buttonStyle(.plain)

        Button(intent: CompleteIntent(activityId: context.activityID)) {
          CircleButton(
            systemName: "stop.fill",
            backgroundColor: activityRed.opacity(0.4),
            foregroundColor: activityRed,
            buttonSize: buttonSize,
            iconSize: actionIconSize
          )
        }
        .buttonStyle(.plain)
      }
    }
  }
}

struct CircleButton: View {
  let systemName: String
  let backgroundColor: Color
  let foregroundColor: Color
  let buttonSize: CGFloat
  let iconSize: CGFloat

  var body: some View {
    ZStack {
      Circle()
        .fill(backgroundColor)
        .frame(width: buttonSize, height: buttonSize)

      Image(systemName: systemName)
        .font(.system(size: iconSize, weight: .bold))
        .foregroundColor(foregroundColor)
    }
  }
}

// MARK: - Metrics
struct MetricsRow: View {
  let state: LiveActivityAttributes.ContentState
  let valueSize: CGFloat
  var labelSize: CGFloat = 12
  var columnSpacing: CGFloat = 0

  var body: some View {
    HStack(alignment: .bottom, spacing: columnSpacing) {
      MetricColumn(valueSize: valueSize, labelSize: labelSize) {
        TimerText(state: state, size: valueSize)
      } label: {
        Text(state.isRunning() ? state.timeRunningLabel : state.timePausedLabel)
          .foregroundStyle(state.isRunning() ? activityTextMuted : activityYellow)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      MetricColumn(valueSize: valueSize, labelSize: labelSize) {
        Text(state.distanceText)
      } label: {
        Text(state.distanceLabel)
          .foregroundStyle(activityTextMuted)
      }
      .frame(maxWidth: .infinity, alignment: .center)

      MetricColumn(valueSize: valueSize, labelSize: labelSize) {
        Text(state.isRunning() ? state.speedText : state.averageSpeedText)
      } label: {
        VStack(alignment: .center, spacing: 0) {
          Text(state.isRunning() ? state.speedLabel : state.averageSpeedLabel)
          Text(state.speedUnitLabel)
        }
        .foregroundStyle(activityTextMuted)
      }
      .frame(maxWidth: .infinity, alignment: .trailing)
    }
  }
}

struct MetricColumn<Value: View, Label: View>: View {
  let valueSize: CGFloat
  let labelSize: CGFloat
  @ViewBuilder let value: () -> Value
  @ViewBuilder let label: () -> Label

  var body: some View {
    VStack(alignment: .center, spacing: 4) {
      value()
        .font(.system(size: valueSize, weight: .bold))
        .foregroundStyle(activityTextPrimary)
        .monospacedDigit()
        .lineLimit(1)
        .minimumScaleFactor(0.72)

      label()
        .font(.system(size: labelSize, weight: .medium))
        .lineLimit(1)
        .minimumScaleFactor(0.72)
    }
  }
}

struct TimerText: View {
  let state: LiveActivityAttributes.ContentState
  let size: CGFloat

  var body: some View {
    Group {
      if state.isRunning() {
        Text(state.startedAt, style: .timer)
          .frame(width: timerTextWidth, alignment: .leading)
          .clipped()
      } else {
        Text(state.getFormattedElapsedTime())
      }
    }
    .font(.system(size: size, weight: .bold))
    .foregroundStyle(activityTextPrimary)
    .monospacedDigit()
  }

  private var timerTextWidth: CGFloat {
    let elapsedSeconds = Int(state.elapsedTime())
    let hours = elapsedSeconds / 3600
    let minutes = (elapsedSeconds % 3600) / 60
    let visibleCharacters = hours > 0 ? 7 : (minutes >= 10 ? 5 : 4)

    return CGFloat(visibleCharacters) * size * 0.58
  }
}

extension LiveActivityAttributes {
  fileprivate static var preview: LiveActivityAttributes {
    LiveActivityAttributes(
      activityName: "Бег",
      activityIcon: "RUNNING"
    )
  }

  fileprivate static var workoutPreview: LiveActivityAttributes {
    LiveActivityAttributes(
      activityName: "Тренировка",
      activityIcon: "WORKOUT"
    )
  }

  fileprivate static var walkingPreview: LiveActivityAttributes {
    LiveActivityAttributes(
      activityName: "Прогулка",
      activityIcon: "WALKING"
    )
  }
}

extension LiveActivityAttributes.ContentState {
  fileprivate static var runningState: LiveActivityAttributes.ContentState {
    LiveActivityAttributes.ContentState(
      startedAt: Date().addingTimeInterval(-27),
      pausedAt: nil,
      distanceText: "15.7",
      speedText: "7.5",
      averageSpeedText: "7.5"
    )
  }

  fileprivate static var pausedState: LiveActivityAttributes.ContentState {
    LiveActivityAttributes.ContentState(
      startedAt: Date().addingTimeInterval(-27),
      pausedAt: Date(),
      distanceText: "15.7",
      speedText: "0.0",
      averageSpeedText: "7.5"
    )
  }

  fileprivate static var longRunningState: LiveActivityAttributes.ContentState {
    LiveActivityAttributes.ContentState(
      startedAt: Date().addingTimeInterval(-3600),
      pausedAt: nil,
      distanceText: "14.7",
      speedText: "7.5",
      averageSpeedText: "7.5"
    )
  }
}

// MARK: - Previews
#Preview("Running - Notification", as: .content, using: LiveActivityAttributes.preview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.runningState
}

#Preview("Paused - Notification", as: .content, using: LiveActivityAttributes.preview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.pausedState
}

#Preview("Running - Compact", as: .dynamicIsland(.compact), using: LiveActivityAttributes.preview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.runningState
}

#Preview("Paused - Compact", as: .dynamicIsland(.compact), using: LiveActivityAttributes.preview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.pausedState
}

#Preview("Running - Expanded", as: .dynamicIsland(.expanded), using: LiveActivityAttributes.preview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.runningState
}

#Preview("Paused - Expanded", as: .dynamicIsland(.expanded), using: LiveActivityAttributes.preview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.pausedState
}

#Preview("Workout - Expanded", as: .dynamicIsland(.expanded), using: LiveActivityAttributes.workoutPreview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.longRunningState
}

#Preview("Walking - Minimal", as: .dynamicIsland(.minimal), using: LiveActivityAttributes.walkingPreview) {
  LiveActivityWidget()
} contentStates: {
  LiveActivityAttributes.ContentState.runningState
}

extension Notification.Name {
  static let pauseFromWidget = Notification.Name("pauseFromWidget")
  static let resumeFromWidget = Notification.Name("resumeFromWidget")
  static let completeFromWidget = Notification.Name("completeFromWidget")
}
