import ActivityKit
import Foundation

@available(iOS 16.2, *)
public struct LiveActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var startedAt: Date
    public var pausedAt: Date?
    public var lastLocationTimestamp: Double?
    public var distanceText: String
    public var speedText: String
    public var averageSpeedText: String

    public init(
      startedAt: Date,
      pausedAt: Date?,
      lastLocationTimestamp: Double? = nil,
      distanceText: String = "0.0",
      speedText: String = "0.0",
      averageSpeedText: String = "0.0"
    ) {
      self.startedAt = startedAt
      self.pausedAt = pausedAt
      self.lastLocationTimestamp = lastLocationTimestamp
      self.distanceText = distanceText
      self.speedText = speedText
      self.averageSpeedText = averageSpeedText
    }

    public func elapsedTime(now: Date = Date()) -> TimeInterval {
      return (pausedAt ?? now).timeIntervalSince(startedAt)
    }

    public func timerState() -> String {
      return pausedAt == nil ? "active" : "paused"
    }

    public func getElapsedTimeInSeconds() -> TimeInterval {
      return elapsedTime()
    }

    public func isRunning() -> Bool {
      return pausedAt == nil
    }

    public func getFormattedElapsedTime() -> String {
      let totalSeconds = Int(getElapsedTimeInSeconds())
      let hours = totalSeconds / 3600
      let minutes = (totalSeconds % 3600) / 60
      let seconds = totalSeconds % 60

      if hours > 0 {
        return String(format: "%d:%02d:%02d", hours, minutes, seconds)
      }

      return String(format: "%d:%02d", minutes, seconds)
    }

    public func getFutureDate() -> Date {
      return Date().addingTimeInterval(365 * 24 * 60 * 60)
    }
  }

  public var activityName: String
  public var activityIcon: String

  public init(activityName: String, activityIcon: String) {
    self.activityName = activityName
    self.activityIcon = activityIcon
  }
}
