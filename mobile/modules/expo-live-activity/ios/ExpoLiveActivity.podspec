Pod::Spec.new do |s|
  s.name           = 'ExpoLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'Live Activity timer module'
  s.description    = 'Expo module that starts and updates the timer Live Activity.'
  s.author         = 'hikers'
  s.homepage       = 'https://hikers.run'
  s.license        = 'UNLICENSED'
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/tarikfp/expo-live-activity-timer.git' }
  s.static_framework = true

  s.weak_frameworks = 'ActivityKit'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.default_subspec = 'Module'

  s.subspec 'Attributes' do |ss|
    ss.source_files = 'LiveActivityAttributes.swift'
  end

  s.subspec 'Module' do |ss|
    ss.dependency 'ExpoModulesCore'
    ss.dependency 'ExpoLiveActivity/Attributes'
    ss.source_files = 'ExpoLiveActivityModule.swift'
  end
end
