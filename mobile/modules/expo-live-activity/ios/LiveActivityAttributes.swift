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
    public var timeRunningLabel: String
    public var timePausedLabel: String
    public var distanceLabel: String
    public var speedLabel: String
    public var averageSpeedLabel: String
    public var speedUnitLabel: String

    public init(
      startedAt: Date,
      pausedAt: Date?,
      lastLocationTimestamp: Double? = nil,
      distanceText: String = "0.0",
      speedText: String = "0.0",
      averageSpeedText: String = "0.0",
      timeRunningLabel: String = "Время",
      timePausedLabel: String = "Пауза",
      distanceLabel: String = "Дистанция (км)",
      speedLabel: String = "Скорость",
      averageSpeedLabel: String = "Ср. скорость",
      speedUnitLabel: String = "(км/ч)"
    ) {
      self.startedAt = startedAt
      self.pausedAt = pausedAt
      self.lastLocationTimestamp = lastLocationTimestamp
      self.distanceText = distanceText
      self.speedText = speedText
      self.averageSpeedText = averageSpeedText
      self.timeRunningLabel = timeRunningLabel
      self.timePausedLabel = timePausedLabel
      self.distanceLabel = distanceLabel
      self.speedLabel = speedLabel
      self.averageSpeedLabel = averageSpeedLabel
      self.speedUnitLabel = speedUnitLabel
    }

    enum CodingKeys: String, CodingKey {
      case startedAt
      case pausedAt
      case lastLocationTimestamp
      case distanceText
      case speedText
      case averageSpeedText
      case timeRunningLabel
      case timePausedLabel
      case distanceLabel
      case speedLabel
      case averageSpeedLabel
      case speedUnitLabel
    }

    public init(from decoder: Decoder) throws {
      let container = try decoder.container(keyedBy: CodingKeys.self)
      startedAt = try container.decode(Date.self, forKey: .startedAt)
      pausedAt = try container.decodeIfPresent(Date.self, forKey: .pausedAt)
      lastLocationTimestamp = try container.decodeIfPresent(Double.self, forKey: .lastLocationTimestamp)
      distanceText = try container.decodeIfPresent(String.self, forKey: .distanceText) ?? "0.0"
      speedText = try container.decodeIfPresent(String.self, forKey: .speedText) ?? "0.0"
      averageSpeedText = try container.decodeIfPresent(String.self, forKey: .averageSpeedText) ?? "0.0"
      timeRunningLabel = try container.decodeIfPresent(String.self, forKey: .timeRunningLabel) ?? "Время"
      timePausedLabel = try container.decodeIfPresent(String.self, forKey: .timePausedLabel) ?? "Пауза"
      distanceLabel = try container.decodeIfPresent(String.self, forKey: .distanceLabel) ?? "Дистанция (км)"
      speedLabel = try container.decodeIfPresent(String.self, forKey: .speedLabel) ?? "Скорость"
      averageSpeedLabel = try container.decodeIfPresent(String.self, forKey: .averageSpeedLabel) ?? "Ср. скорость"
      speedUnitLabel = try container.decodeIfPresent(String.self, forKey: .speedUnitLabel) ?? "(км/ч)"
    }

    public func encode(to encoder: Encoder) throws {
      var container = encoder.container(keyedBy: CodingKeys.self)
      try container.encode(startedAt, forKey: .startedAt)
      try container.encodeIfPresent(pausedAt, forKey: .pausedAt)
      try container.encodeIfPresent(lastLocationTimestamp, forKey: .lastLocationTimestamp)
      try container.encode(distanceText, forKey: .distanceText)
      try container.encode(speedText, forKey: .speedText)
      try container.encode(averageSpeedText, forKey: .averageSpeedText)
      try container.encode(timeRunningLabel, forKey: .timeRunningLabel)
      try container.encode(timePausedLabel, forKey: .timePausedLabel)
      try container.encode(distanceLabel, forKey: .distanceLabel)
      try container.encode(speedLabel, forKey: .speedLabel)
      try container.encode(averageSpeedLabel, forKey: .averageSpeedLabel)
      try container.encode(speedUnitLabel, forKey: .speedUnitLabel)
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
