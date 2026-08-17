import type { Translations } from './ru'

const en: Translations = {
	translation: {
		common: {
			actionCannotBeUndone: 'This action cannot be undone',
			justNowText: 'just now',
			today: 'Today',
			share: 'Share',
			cancel: 'Cancel',
			delete: 'Delete',
			save: 'Save',
			error: 'Error',
			all: 'All',
			yes: 'Yes',
			no: 'No',
			back: 'Back',
			you: 'You',
			next: 'Next',
			settings: 'Settings',
			search: 'Search',
			ready: 'Done',
			edit: 'Editing',
			workout: 'Workout',
			pause: 'Pause',
			resume: 'Resume',
			savedSuccess: 'Data saved successfully',
			quitWithoutSave: 'Quit without saving data?'
		},
		NativeTabs: {
			feedPage: 'Feed',
			workoutPage: 'Workout',
			profilePage: 'Profile'
		},
		QuickActions: {
			newTraining: 'New workout',
			search: 'Search',
			reportProblem: 'Report a problem'
		},
		AllGeolocationPermissions: {
			failedToOpenSettings: 'Failed to open settings',
			locationServicesAreTurnedOff: 'Location services are turned off',
			locationInstructions: 'Open Settings > Privacy & Security > Location Services and turn on the toggle.',
			trackingNotificationTitle: 'Location tracking',
			trackingNotificationBody: 'The app is collecting data about your location'
		},
		WorkoutAutoFinish: {
			notificationChannelName: 'Workouts',
			warningTitle: 'Workout is about to end',
			warningBody: 'The workout will be completed automatically in 5 minutes',
			doneTitle: 'Workout completed',
			doneBody: 'The workout has been completed automatically'
		},
		FormErrors: {
			one: 'character',
			two: 'characters',
			five: 'characters',
			minLength: 'Minimum length',
			maxLength: 'Maximum length',
			required: 'Required field',
			email: 'Invalid email',
			isNumber: 'The field can contain only digits',
			notNumber: 'The field can contain only letters',
			passwordsNotEquals: 'Passwords do not match',
			customMessage: {
				username: {
					badSymbol: 'The username contains invalid characters'
				}
			}
		},
		ToastMessage: {
			success: {
				passwordSuccessfullyChanged: 'Password changed successfully',
				workoutSaved: 'Workout saved',
				allWorkoutsSaved: 'All workouts saved',
				workoutWasSavedSuccessfully: 'Workout saved successfully',
				unsavedWorkoutDeletedSuccessfully: 'Unsaved workout deleted successfully',
				workoutDeleted: 'Workout deleted',
				allUnsavedWorkoutsHaveBeenDeletedSuccessfully: 'All unsaved workouts deleted successfully',
				theUserHasBeenAddedAsFriend: 'User added to friends',
				theUserHasBeenRemovedFromTheFriendsList: 'User removed from the friends list',
				friendInviteRejected: 'Request declined',
				friendRequestSent: 'Friend request sent',
				friendRequestWithdrawn: 'Friend request withdrawn',
				colorUpdatedSuccessfully: 'Color updated successfully',
				iconUpdatedSuccessfully: 'Icon updated successfully',
				accountHasBeenSuccessfullyDeleted: 'Account deleted successfully',
				notificationSettingsSaved: 'Notification settings saved',
				postPublished: 'Post published',
				postEdited: 'Post edited',
				postDeleted: 'Post deleted',
				reportSent: 'Report sent'
			},
			info: {
				cannotOpenURL: 'Failed to open URL:',
				noUserSelectedForDeleteFromFriends: 'No user selected for removing from friends',
				noInternetConnectionTrainingWillTakePlaceOffline:
					'No internet connection, the workout will take place in offline mode',
				trainingEndedTooEarly: 'The workout ended too early',
				noInternetTheWorkoutCanBeSavedLater: 'No internet access, the workout can be saved later',
				workoutAutoFinished: 'The workout has been completed automatically',
				workoutAutoFinishedNoInternet: 'The workout has been completed automatically, data will be saved later'
			},
			error: {
				startingLocationTracking: 'Error starting location tracking',
				failedToSaveAllWorkouts: 'Failed to save all workouts',
				thereWasAnErrorSavingTheWorkoutYouCanSaveItLater:
					'An error occurred while saving the workout, you can save it later',
				failedToSaveWorkout: 'Failed to save the workout',
				errorLoadingImage: 'Error loading image',
				failedToUploadImageForEditing: 'Failed to upload image for editing',
				failedToDeleteWorkout: 'Failed to delete the workout',
				failedToDeleteAllWorkouts: 'Failed to delete all workouts',
				fileDidNotPassVerification: 'The file did not pass verification',
				invalidFile: 'Invalid file',
				noFilesSelected: 'No files selected',
				unsupportedFileFormat: 'Unsupported file format',
				noPostId: 'No post selected'
			}
		},
		TrainingsEmpty: {
			label: {
				postsNotExist: 'Unfortunately, there are no posts yet, publish a post after a workout',
				postsNotExistProfile: 'There are no posts yet, publish a post after a workout',
				workoutsNotExist: 'Unfortunately, there are no workouts yet'
			},
			action: {
				startTraining: 'Start a workout'
			}
		},
		EmptyListText: {
			noFriendRequests: 'You have no friend requests',
			noFriends: 'Unfortunately, nobody was found',
			noSubscriptions: 'You are not subscribed to anyone',
			noSubscribers: 'No one has subscribed to you yet',
			noNotifications: 'No notifications'
		},
		LoadQueryErrorRetry: {
			label: {
				failedToLoadPublications: 'Failed to load publications',
				failedToLoadPost: 'Failed to load the post',
				failedToLoadProfile: 'Failed to load the profile',
				failedToLoadFriendRequests: 'Failed to load friend requests',
				failedToLoadFriends: 'Failed to load the friends list',
				failedToLoadSubscriptions: 'Failed to load the subscriptions list',
				failedToLoadMembers: 'Failed to load members',
				failedToLoadSubscribers: 'Failed to load the subscribers list',
				failedToLoadNotifications: 'Failed to load notifications',
				failedToLoadWorkoutHistory: 'Failed to load the workout history',
				failedToLoadActivity: 'Failed to load activities',
				failedToLoadAchievements: 'Failed to load achievements',
				failedToUpdateAchievements: 'Failed to update achievements.',
				searchFailed: 'Search failed',
				cantLoadMore: 'Failed to load more'
			},
			action: {
				tryAgain: 'Try again',
				retry: 'Retry'
			}
		},
		ClientErrors: {
			NO_INTERNET: 'No internet connection',
			REQUEST_TIMEOUT: 'Waiting for a response from the server timed out',
			UNEXPECTED: 'Unexpected client error'
		},
		ServerErrors: {
			BAD_REQUEST: 'bad request',
			INTERNAL: 'Unexpected server error',
			MISMATCH: 'Wrong password',
			DIGIT_REQUIRED: 'The field must contain digits',
			ALREADY_CREATED: 'This email is already registered',
			INVALID_EMAIL: 'Invalid email',
			ALREADY_EXISTS: 'This email is already registered',
			EMAIL_ALREADY_CONFIRMED: 'email already confirmed',
			NOT_FOUND: 'Not found',
			INVALID_LENGTH: 'Invalid length',
			UNKNOWN_ERROR: 'Unexpected server error',
			FORBIDDEN: 'Access denied',
			UNAUTHORIZED: 'Not authorized',
			TIMEOUT_EXPIRED: 'Time expired',
			USER_IN_NOT_FINISHED_TRAINING: 'Cannot start a workout while the previous one has not finished',
			USER_IS_TRAINING_PARTICIPANT: 'Cannot start a workout, you are already in another workout',
			USER_IS_NOT_TRAINING_PARTICIPANT: 'Cannot start the workout, you are not its participant',
			DATE_IN_THE_PAST: 'The finish date is earlier than the start date',
			DATE_IN_THE_FUTURE: 'The start date is in the future',
			TOO_LARGE: 'File size is too large',
			TRAINING_ALREADY_FINISHED: 'The workout has already finished',
			TRAINING_ALREADY_STARTED: 'The workout has already started',
			TRAINING_NOT_FINISHED: 'The workout is not finished',
			TRAINING_NOT_STARTED: 'The workout has not started',
			SHOULD_BE_DIFFERENT: 'Values must be different',
			TOO_MANY_REQUESTS: 'Too many attempts',
			EMAIL_DOMAIN_NOT_ALLOWED: 'Email domain is not allowed',
			personal: {
				email: {
					NOT_FOUND: 'This email is not registered',
					INVALID_EMAIL: 'Invalid email',
					ALREADY_EXISTS: 'This email is already registered',
					EMAIL_ALREADY_CONFIRMED: 'This email has already been confirmed',
					EMAIL_DOMAIN_NOT_ALLOWED: 'Only RU mailboxes are allowed'
				},
				code: {
					MISMATCH: 'Wrong code'
				},
				trainingId: {
					MISMATCH: 'Invalid workout id'
				},
				activities: {
					BAD_REQUEST: 'Invalid activities string format'
				},
				avatarFilename: {
					BAD_REQUEST: 'Invalid avatar format'
				},
				id: {
					MISMATCH: 'Invalid id',
					BAD_REQUEST: 'Invalid id passed'
				},
				userId: {
					MISMATCH: 'Invalid id format'
				},
				type: {
					MISMATCH: 'Unknown workout type passed'
				},
				colorHex: {
					MISMATCH: 'Invalid color hex passed'
				},
				ts: {
					BAD_REQUEST: 'Invalid timestamp, must be a number',
					DATE_IN_THE_FUTURE: 'Invalid timestamp, set in future time',
					DATE_IN_THE_PAST: 'Invalid timestamp, the finish date is earlier than the start date'
				},
				files: {
					BAD_REQUEST: 'Invalid file passed'
				},
				deletedFilenames: {
					BAD_REQUEST: 'Invalid deleted images format',
					MISMATCH: 'The image for deletion is not attached to the post'
				},
				password: {
					DIGIT_REQUIRED: 'The password must contain digits',
					MISMATCH: 'Wrong password',
					SHOULD_BE_DIFFERENT: 'The password must differ from the old one'
				},
				confirmPassword: {
					MISMATCH: 'Passwords do not match',
					DIGIT_REQUIRED: 'The password must contain digits'
				},
				username: {
					ALREADY_EXISTS: 'This username is already in use'
				}
			}
		},
		NotFoundPage: {
			pageNotFound: 'This page does not exist.',
			backToProfile: 'Back to profile'
		},
		WorkoutTypes: {
			run: 'Run',
			walk: 'Walk',
			track: 'Track',
			bicycle: 'Bicycle'
		},
		measurementUnits: {
			kcal: 'kcal',
			kmh: 'km/h',
			meters: {
				short: 'm',
				long: 'm'
			},
			kg: {
				short: 'kg',
				long: 'kilogram'
			},
			km: {
				short: 'km',
				long: 'kilometers'
			},
			minutes: {
				short: 'min',
				long: 'minutes'
			},
			seconds: {
				short: 'sec',
				long: 'seconds'
			},
			hours: {
				short: 'h',
				long: 'hours'
			},
			distance: 'Distance',
			range: 'Distance',
			time: 'Time',
			avgSpeed: 'Avg speed',
			avgPace: 'Avg pace',
			speed: 'Speed',
			climb: 'Elevation gain',
			height: 'Altitude',
			count: {
				one: 'time',
				two: 'times',
				five: 'times'
			},
			reps: {
				one: 'repetition',
				two: 'repetitions',
				five: 'repetitions'
			}
		},
		HelloPage: {
			enter: 'Sign in',
			firstSlide: {
				title: 'Your route.\n' + 'Our care.',
				description: 'Monitoring of all training data and results'
			},
			secondSlide: {
				title: 'Turned on.\n' + 'Started running.',
				description: 'Sync your steps with those\n' + 'who share your passion for running'
			},
			thirdSlide: {
				title: 'Share.\n' + 'Inspire.',
				description: 'Share stats, discuss workouts, become better together'
			}
		},
		PasswordRestorePage: {
			enterEmail: 'Enter email',
			weWillSendYouCode: 'We will send a code to restore your password to it',
			weSentCode: 'We sent a password recovery code to',
			codeSent: 'We sent you a code',
			enterCode: 'Enter code',
			passwordRestore: 'Password recovery',
			createANewPassword: 'Create a new password',
			tooManyAttempts: 'Too many attempts. Try again later.',
			invalidCodeAttemptsRemaining: 'Wrong code, attempts remaining:',
			invalidCode: 'Wrong code.',
			inputPlaceholder: {
				email: 'Enter email',
				password: 'Enter password',
				passwordConfirm: 'Confirm password'
			},
			actions: {
				sendCode: 'Send code',
				resendCode: 'Send code again',
				saveNewPassword: 'Save new password'
			}
		},
		AuthPage: {
			mailConfirmation: {
				emailConfirm: 'Email confirmation',
				codeSent: 'We sent a code to',
				enterCode: 'Enter code',
				resendCode: 'Send code again',
				checkSpam: "Didn't get the code? Check spam"
			},
			header: {
				signIn: 'Sign in',
				signUp: 'Sign up'
			},
			forgotPassword: 'Forgot your password?',
			inputPlaceholder: {
				email: 'Enter email',
				username: 'Enter username',
				password: 'Enter password'
			},
			actions: {
				signIn: 'Sign in',
				signUp: 'Sign up'
			},
			agreement: {
				agreeWith: 'I agree to the',
				processingConditions: 'terms of processing',
				personalDataAnd: 'personal data and the',
				privacyPolicy: 'privacy policy'
			}
		},
		BatteryOptimizationBanner: {
			disable: 'Disable',
			batteryOptimization: 'battery optimization',
			workProperly: 'for proper geolocation operation'
		},
		WorkoutPage: {
			header: {
				newWorkout: 'New workout',
				workout: 'Workout'
			},
			start: 'Start',
			finishWorkout: 'Do you really want to finish the workout?',
			finishButton: 'Finish',
			bottomSheets: {
				geolocation: {
					title: 'Allow access to geolocation',
					inBackgroundMode: 'in background mode'
				},
				deniedGeolocation: {
					title: 'Without permission to receive geolocation in background and active mode, it is impossible to start a workout.',
					description: 'Enable the permission in the app settings'
				},
				notifications: {
					title: 'Allow access to sending push notifications'
				},
				physicalActivity: {
					title: 'Allow access to tracking',
					description: 'of physical activity'
				},
				enableGps: {
					recordWorkouts: 'To record workouts,',
					switch: 'you need to enable the',
					geo: 'geodata transfer.',
					doItNow: 'Do it now?'
				},
				notFinishedWorkout: {
					cannotStartNow: 'You cannot start a new workout now,',
					uHaveUnfinishedWorkout: 'because you have an unfinished workout',
					selectNextAction: 'Choose a further action'
				},
				unsavedTrainings: {
					titleFull: 'You have an unsaved workout',
					titleShort: 'You have',
					noun: {
						one: 'unsaved workout',
						two: 'unsaved workouts',
						five: 'unsaved workouts'
					}
				},
				actions: {
					allow: 'Allow',
					notNow: 'Not now',
					details: 'Details',
					saveAll: 'Save all',
					deleteAll: 'Delete all',
					askLater: 'Ask later',
					openSettings: 'Open settings',
					restoreAndContinue: 'Restore and continue'
				}
			}
		},
		WorkoutResultsPage: {
			cantLoadMoreFiles: 'Cannot upload more',
			filePlurals: {
				one: 'file',
				two: 'files',
				five: 'files'
			},
			filePluralsSecond: {
				one: 'file',
				two: 'files',
				five: 'files'
			},
			addedFilesRestrictions: {
				added: 'Added',
				from: 'of',
				limit: 'limit',
				perPost: 'per post.',
				notAdded: 'not added'
			},
			postPhoto: 'Post photo',
			quitWithoutCreatePost: 'Quit without creating a post?',
			workoutSavedPostLater: 'The workout is saved in your history, and you can create a post later.',
			trainingInformation: 'Workout information',
			switchMode: {
				map: 'Map',
				chart: 'Chart'
			},
			paceChart: 'Pace chart',
			notEnoughDataChart: 'Not enough data to display the chart',
			members: 'Members',
			inputPlaceholder: {
				title: 'Enter a title',
				description: 'Enter a description'
			},
			addPhoto: 'Add photo',
			edit: 'Edit',
			publication: 'Publication',
			editPublication: 'Editing publication',
			onlyCreatorCanPublish: 'Only the creator of the workout can publish a post'
		},
		UserProfilePage: {
			header: 'Profile',
			stats: {
				subscribers: 'Subscribers',
				friends: 'Friends',
				subscriptions: 'Subscriptions'
			},
			deleteFriendText: 'Do you really want to remove the user from friends?',
			subscribe: 'Subscribe',
			unsubscribe: 'Unsubscribe',
			friendStatus: {
				addAsFriend: 'Add to friends',
				deleteFriend: 'Remove from friends',
				inviteFriend: 'Request sent',
				acceptFriend: 'Accept request'
			},
			activity: 'Activities',
			postFeed: 'Feed'
		},
		EmojiPicker: {
			searchPlaceholder: 'Search emoji',
			noResultsText: 'Nothing found',
			categoryNames: {
				search_results: 'Search results',
				frequently_used: 'Recently used',
				smileys_emotion: 'Smileys & emotion',
				people_body: 'People & body',
				animals_nature: 'Animals & nature',
				food_drink: 'Food & drink',
				travel_places: 'Travel & places',
				activities: 'Activities',
				objects: 'Objects',
				symbols: 'Symbols',
				flags: 'Flags'
			}
		},
		ProfilePage: {
			menu: {
				editProfile: 'Edit profile',
				about: 'About the app',
				exit: 'Exit'
			},
			stats: {
				subscribers: 'Subscribers',
				friends: 'Friends',
				subscriptions: 'Subscriptions'
			},
			workoutHistory: 'Workout history',
			achievements: 'Achievements',
			activity: 'Activities',
			profileLoadError: {
				text: 'Failed to update the profile.',
				action: 'Retry'
			},
			dailyActivity: {
				title: 'Daily activity',
				mobility: 'Mobility'
			},
			postFeed: 'Feed',
			activityList: {
				run: 'Run',
				track: 'Track',
				bicycle: 'Bicycle',
				steps: 'Steps'
			}
		},
		DailyActivity: {
			mobility: 'Mobility',
			kcalShort: 'KCAL',
			kcalPerDay: 'KCAL/DAY',
			changeGoalToday: "Change today's goal",
			changeSchedule: 'Change schedule',
			changeGoal: 'Change goal',
			chartPlaceholder: 'A chart of kcal expenditure relative to the time of day could be here',
			steps: 'Steps',
			distance: 'Distance',
			goalToday: {
				title: 'Mobility goal for today',
				description:
					'Set a temporary mobility goal for today according to your desired activity level. This will not affect your current goal schedule.'
			},
			goalEveryDay: {
				title: 'Daily mobility goal',
				description: 'Set a daily goal according to your actual or desired level of physical activity.'
			},
			goalSchedule: {
				title: 'Mobility goal schedule'
			},
			weekdaysShort: {
				monday: 'Mon',
				tuesday: 'Tue',
				wednesday: 'Wed',
				thursday: 'Thu',
				friday: 'Fri',
				saturday: 'Sat',
				sunday: 'Sun'
			},
			weekdaysLong: {
				monday: 'Monday',
				tuesday: 'Tuesday',
				wednesday: 'Wednesday',
				thursday: 'Thursday',
				friday: 'Friday',
				saturday: 'Saturday',
				sunday: 'Sunday'
			},
			yearShortSuffix: ''
		},
		ReportAProblemPage: {
			header: 'Report a problem',
			inputPlaceholder: 'Describe in detail the problem you found',
			attachDeviceDetails: 'Attach my device details',
			send: 'Send message'
		},
		AboutPage: {
			header: 'About the app',
			itemsList: {
				privacyPolicy: 'Privacy policy',
				personalDataProcessingPolicy: 'Personal data processing policy',
				termsYandexMaps: 'Terms of use of individual Yandex Maps services',
				reportProblem: 'Report a problem'
			}
		},
		SettingsPage: {
			header: 'Settings',
			inAppNotifications: {
				header: 'Notification settings',
				settingsList: {
					addAsFriend: {
						title: 'Adding to friends',
						description: 'Get a notification when someone adds me to friends'
					},
					workoutInvite: {
						title: 'Workout invitation',
						description: 'Get a notification when someone invites me to a workout'
					},
					newAchievement: {
						title: 'New achievement',
						description: 'Get a notification when I receive a new achievement'
					},
					postAboutWorkout: {
						title: 'Post about a workout',
						description: 'Get a notification when the workout host publishes a post about the past workout'
					}
				}
			},
			pickAColor: {
				header: {
					choose: 'Choose the',
					color: 'color'
				}
			},
			settingsList: {
				inAppNotifications: 'In-app notifications',
				chooseYour: 'Choose your ',
				color: 'color',
				language: 'Language'
			},
			deleteAccount: 'Delete account',
			deleteAccountDetails:
				'Deleting your account is irreversible and cannot be undone. All your data, workouts, and history will be lost forever.',
			deleteAccountModal: {
				label: 'Deleting account',
				accountDeleteText:
					'Are you sure you want to delete your account? This action is irreversible, and all your data will be permanently deleted.'
			}
		},
		PhotoPicker: {
			camera: 'Camera',
			gallery: 'Gallery'
		},
		EditProfilePage: {
			header: 'Edit profile',
			weight: 'Weight',
			avatarModal: {
				title: 'Profile photo'
			},
			inputPlaceholder: {
				name: 'Enter name',
				username: 'Enter username'
			},
			topThreeActivity: 'Top 3 activities to display'
		},
		DocumentPage: {
			header: 'View document'
		},
		PostDetailsPage: {
			header: 'View post',
			authorRoute: "Author's route",
			allRoutes: 'All routes',
			deletePostModal: {
				label: 'Do you really want to delete the post?'
			}
		},
		WorkoutHistoryPage: {
			header: 'Workout history',
			unsavedWorkouts: 'Unsaved workouts'
		},
		UserAchievementsPage: {
			header: 'Achievements',
			received: 'Received'
		},
		AchievementsPage: {
			header: 'My achievements',
			received: 'Received',
			notReceived: 'Not received',
			have: 'Owned by',
			users: 'users'
		},
		PostsFeedPage: {
			people: 'People',
			posts: 'Posts',
			atLeastTwoSymbols: 'Enter at least 2 characters',
			nothingFound: 'Nothing found'
		},
		NotificationsPage: {
			header: 'Notifications',
			clearAll: 'Clear all notifications'
		},
		SubscribersPage: {
			header: 'Subscribers'
		},
		SubscriptionsPage: {
			header: 'Subscriptions'
		},
		FriendsPage: {
			header: 'Friends',
			friendRequests: 'Friend requests',
			deleteFriendText: 'Do you really want to remove the user from friends?'
		},
		FriendRequestsPage: {
			header: 'Friend requests'
		},
		Post: {
			subscribe: 'Subscribe',
			unsubscribe: 'Subscribed',
			report: 'Report',
			participants: {
				and: 'and'
			}
		},
		WorkoutParticipantsPage: {
			header: 'Workout participants'
		}
	}
}

export default en
