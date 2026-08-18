const ru = {
	translation: {
		common: {
			actionCannotBeUndone: 'Это действие нельзя отменить',
			justNowText: 'только что',
			today: 'Сегодня',
			share: 'Поделиться',
			cancel: 'Отмена',
			delete: 'Удалить',
			save: 'Сохранить',
			error: 'Ошибка',
			all: 'Все',
			yes: 'Да',
			no: 'Нет',
			back: 'Назад',
			you: 'Вы',
			next: 'Далее',
			settings: 'Настройки',
			search: 'Поиск',
			ready: 'Готово',
			edit: 'Редактирование',
			workout: 'Тренировка',
			pause: 'Пауза',
			resume: 'Продолжить',
			savedSuccess: 'Данные успешно сохранены',
			quitWithoutSave: 'Выйти без сохранения данных?'
		},
		NativeTabs: {
			feedPage: 'Лента',
			workoutPage: 'Тренировка',
			profilePage: 'Профиль'
		},
		QuickActions: {
			newTraining: 'Новая тренировка',
			search: 'Поиск',
			reportProblem: 'Сообщить о проблеме'
		},
		AllGeolocationPermissions: {
			failedToOpenSettings: 'Не удалось открыть настройки',
			locationServicesAreTurnedOff: 'Службы геолокации выключены',
			locationInstructions:
				'Откройте Настройки > Конфиденциальность и безопасность > Службы геолокации и включите переключатель.',
			trackingNotificationTitle: 'Отслеживание местоположения',
			trackingNotificationBody: 'Приложение собирает данные о вашем местоположении'
		},
		WorkoutAutoFinish: {
			notificationChannelName: 'Тренировки',
			warningTitle: 'Тренировка скоро завершится',
			warningBody: 'Через 5 минут тренировка будет завершена автоматически',
			doneTitle: 'Тренировка завершена',
			doneBody: 'Тренировка завершена автоматически'
		},
		FormErrors: {
			one: 'символ',
			two: 'символа',
			five: 'символов',
			minLength: 'Минимальная длина',
			maxLength: 'Максимальная длина',
			required: 'Обязательное поле',
			email: 'Некорректный email',
			isNumber: 'Поле может содержать только цифры',
			notNumber: 'Поле может содержать только буквы',
			passwordsNotEquals: 'Пароли не совпадают',
			customMessage: {
				username: {
					badSymbol: 'Никнейм содержит недопустимые символы'
				}
			}
		},
		ToastMessage: {
			success: {
				passwordSuccessfullyChanged: 'Пароль успешно изменён',
				workoutSaved: 'Тренировка сохранена',
				allWorkoutsSaved: 'Все тренировки сохранены',
				workoutWasSavedSuccessfully: 'Тренировка сохранена успешно',
				unsavedWorkoutDeletedSuccessfully: 'Несохраненная тренировка удалена успешно',
				workoutDeleted: 'Тренировка удалена',
				allUnsavedWorkoutsHaveBeenDeletedSuccessfully: 'Все несохраненные тренировки удалены успешно',
				theUserHasBeenAddedAsFriend: 'Пользователь добавлен в друзья',
				theUserHasBeenRemovedFromTheFriendsList: 'Пользователь удалён из списка друзей',
				friendInviteRejected: 'Заявка отклонена',
				friendRequestSent: 'Заявка в друзья отправлена',
				friendRequestWithdrawn: 'Заявка в друзья отозвана',
				colorUpdatedSuccessfully: 'Цвет успешно обновлен',
				iconUpdatedSuccessfully: 'Значок успешно обновлен',
				accountHasBeenSuccessfullyDeleted: 'Аккаунт успешно удален',
				notificationSettingsSaved: 'Настройки уведомлений сохранены',
				postPublished: 'Пост опубликован',
				postEdited: 'Пост отредактирован',
				postDeleted: 'Пост удалён',
				reportSent: 'Жалоба отправлена'
			},
			info: {
				cannotOpenURL: 'Не удалось открыть URL:',
				noUserSelectedForDeleteFromFriends: 'Не выбран пользователь для удаления из друзей',
				noInternetConnectionTrainingWillTakePlaceOffline:
					'Нет подключения к интернету, тренировка будет происходить в оффлайн режиме',
				trainingEndedTooEarly: 'Тренировка завершена слишком рано',
				noInternetTheWorkoutCanBeSavedLater: 'Нет доступа к интернету, тренировку можно будет сохранить позже',
				workoutAutoFinished: 'Тренировка завершена автоматически',
				workoutAutoFinishedNoInternet: 'Тренировка завершена автоматически, данные будут сохранены позже'
			},
			error: {
				startingLocationTracking: 'Ошибка запуска отслеживания местоположения',
				failedToSaveAllWorkouts: 'Не удалось сохранить все тренировки',
				thereWasAnErrorSavingTheWorkoutYouCanSaveItLater:
					'Ошибка при сохранении тренировки, её можно будет сохранить позже',
				failedToSaveWorkout: 'Не удалось сохранить тренировку',
				errorLoadingImage: 'Ошибка при загрузке изображения',
				failedToUploadImageForEditing: 'Не удалось загрузить изображение для редактирования',
				failedToDeleteWorkout: 'Не удалось удалить тренировку',
				failedToDeleteAllWorkouts: 'Не удалось удалить все тренировки',
				fileDidNotPassVerification: 'Файл не прошёл проверку',
				invalidFile: 'Невалидный файл',
				noFilesSelected: 'Не выбрано ни одного файла',
				unsupportedFileFormat: 'Неподдерживаемый формат файла',
				noPostId: 'Не выбран пост'
			}
		},
		TrainingsEmpty: {
			label: {
				postsNotExist: 'К сожалению, постов еще не существует, опубликуйте пост после тренировки',
				postsNotExistProfile: 'Постов еще не существует, опубликуйте пост после тренировки',
				workoutsNotExist: 'К сожалению, тренировок еще не существует'
			},
			action: {
				startTraining: 'Начать тренировку'
			}
		},
		EmptyListText: {
			noFriendRequests: 'У вас нет заявок в друзья',
			noFriends: 'К сожалению никого не нашлось',
			noSubscriptions: 'Вы ни на кого не подписаны',
			noSubscribers: 'На вас ещё никто не подписан',
			noNotifications: 'Уведомления отсутствуют'
		},
		LoadQueryErrorRetry: {
			label: {
				failedToLoadPublications: 'Не удалось загрузить публикации',
				failedToLoadPost: 'Не удалось загрузить пост',
				failedToLoadProfile: 'Не удалось загрузить профиль',
				failedToLoadFriendRequests: 'Не удалось загрузить заявки в друзья',
				failedToLoadFriends: 'Не удалось загрузить список друзей',
				failedToLoadSubscriptions: 'Не удалось загрузить список подписок',
				failedToLoadMembers: 'Не удалось загрузить участников',
				failedToLoadSubscribers: 'Не удалось загрузить список подписчиков',
				failedToLoadNotifications: 'Не удалось загрузить уведомления',
				failedToLoadWorkoutHistory: 'Не удалось загрузить историю тренировок',
				failedToLoadActivity: 'Не удалось загрузить активности',
				failedToLoadAchievements: 'Не удалось загрузить достижения',
				failedToUpdateAchievements: 'Не удалось обновить достижения.',
				searchFailed: 'Не удалось выполнить поиск',
				cantLoadMore: 'Не удалось загрузить ещё'
			},
			action: {
				tryAgain: 'Попробовать снова',
				retry: 'Повторить'
			}
		},
		ClientErrors: {
			NO_INTERNET: 'Отсутствует подключение к интернету',
			REQUEST_TIMEOUT: 'Превышено время ожидания ответа от сервера',
			UNEXPECTED: 'Непредвиденная ошибка клиента'
		},
		ServerErrors: {
			BAD_REQUEST: 'bad request',
			INTERNAL: 'Непредвиденная ошибка сервера',
			MISMATCH: 'Неверный пароль',
			DIGIT_REQUIRED: 'Поле должно содержать цифры',
			ALREADY_CREATED: 'Такой email уже зарегистрирован',
			INVALID_EMAIL: 'Некорректный email',
			ALREADY_EXISTS: 'Такой email уже зарегистрирован',
			EMAIL_ALREADY_CONFIRMED: 'email уже подтвержден',
			NOT_FOUND: 'Не найдено',
			INVALID_LENGTH: 'Неверная длина',
			UNKNOWN_ERROR: 'Непредвиденная ошибка сервера',
			FORBIDDEN: 'Нет доступа',
			UNAUTHORIZED: 'Не авторизован',
			TIMEOUT_EXPIRED: 'Время вышло',
			USER_IN_NOT_FINISHED_TRAINING: 'Невозможно начать тренировку, пока предыдущая не закончилась',
			USER_IS_TRAINING_PARTICIPANT: 'Невозможно начать тренировку, вы уже в составе другой тренировки',
			USER_IS_NOT_TRAINING_PARTICIPANT: 'Невозможно начать тренировку, вы не являетесь её участником',
			DATE_IN_THE_PAST: 'Дата финиша раньше даты старта',
			DATE_IN_THE_FUTURE: 'Дата старта в будущем',
			TOO_LARGE: 'Слишком большой размер файла',
			TRAINING_ALREADY_FINISHED: 'Тренировка уже завершена',
			TRAINING_ALREADY_STARTED: 'Тренировка уже начата',
			TRAINING_NOT_FINISHED: 'Тренировка не завершена',
			TRAINING_NOT_STARTED: 'Тренировка не начата',
			SHOULD_BE_DIFFERENT: 'Значения должны отличаться',
			TOO_MANY_REQUESTS: 'Слишком много попыток',
			EMAIL_DOMAIN_NOT_ALLOWED: 'Почтовый домен не разрешен',
			personal: {
				email: {
					NOT_FOUND: 'Такой email не зарегистрирован',
					INVALID_EMAIL: 'Некорректный email',
					ALREADY_EXISTS: 'Такой email уже зарегистрирован',
					EMAIL_ALREADY_CONFIRMED: 'Этот email уже подтвержден',
					EMAIL_DOMAIN_NOT_ALLOWED: 'Доступны только ру-почты'
				},
				code: {
					MISMATCH: 'Неверный код'
				},
				trainingId: {
					MISMATCH: 'Некорректный id тренировки'
				},
				activities: {
					BAD_REQUEST: 'Невалидный формат строки активностей'
				},
				avatarFilename: {
					BAD_REQUEST: 'Невалидный формат аватара'
				},
				id: {
					MISMATCH: 'Некорректный id',
					BAD_REQUEST: 'Передан некорректный id'
				},
				userId: {
					MISMATCH: 'Некорректный формат id'
				},
				type: {
					MISMATCH: 'Передан несуществующий тип тренировки'
				},
				colorHex: {
					MISMATCH: 'Передан неверный hex цвета'
				},
				ts: {
					BAD_REQUEST: 'Некорректный timestamp, должно быть числом',
					DATE_IN_THE_FUTURE: 'Некорректный timestamp, указано в будущем времени',
					DATE_IN_THE_PAST: 'Некорректный timestamp, дата финиша раньше даты старта'
				},
				files: {
					BAD_REQUEST: 'Передан некорректный файл'
				},
				deletedFilenames: {
					BAD_REQUEST: 'Некорректный формат удаленных изображений',
					MISMATCH: 'Изображение для удаления не прикреплено к посту'
				},
				password: {
					DIGIT_REQUIRED: 'Пароль должен содержать цифры',
					MISMATCH: 'Неверный пароль',
					SHOULD_BE_DIFFERENT: 'Пароль должен отличаться от старого'
				},
				confirmPassword: {
					MISMATCH: 'Пароли не совпадают',
					DIGIT_REQUIRED: 'Пароль должен содержать цифры'
				},
				username: {
					ALREADY_EXISTS: 'Такой логин уже используется'
				}
			}
		},
		NotFoundPage: {
			pageNotFound: 'Такой страницы не существует.',
			backToProfile: 'Вернуться в профиль'
		},
		WorkoutTypes: {
			run: 'Забег',
			walk: 'Ходьба',
			track: 'Трек',
			bicycle: 'Велосипед'
		},
		measurementUnits: {
			kcal: 'Ккал',
			kmh: 'км/ч',
			meters: {
				short: 'м',
				long: 'м'
			},
			kg: {
				short: 'кг',
				long: 'киллограмм'
			},
			km: {
				short: 'км',
				long: 'километры'
			},
			minutes: {
				short: 'мин',
				long: 'минуты'
			},
			seconds: {
				short: 'сек',
				long: 'секунды'
			},
			hours: {
				short: 'ч',
				long: 'часы'
			},
			distance: 'Расстояние',
			range: 'Дистанция',
			time: 'Время',
			avgSpeed: 'Ср. скорость',
			avgPace: 'Ср. темп',
			speed: 'Скорость',
			climb: 'Набор высоты',
			height: 'Высота',
			count: {
				one: 'раз',
				two: 'раза',
				five: 'раз'
			},
			reps: {
				one: 'повторение',
				two: 'повторения',
				five: 'повторений'
			}
		},
		HelloPage: {
			enter: 'Войти',
			firstSlide: {
				title: 'Ваш маршрут.\n' + 'Наша забота.',
				description: 'Мониторинг всех тренировочных данных и результатов'
			},
			secondSlide: {
				title: 'Включил.\n' + 'Побежал.',
				description: 'Синхронизируйте шаги с теми,\n' + 'кто разделяет вашу страсть к бегу'
			},
			thirdSlide: {
				title: 'Делись.\n' + 'Вдохновляй.',
				description: 'Делитесь статистикой, обсуждайте тренировки, становитесь лучше вместе'
			}
		},
		PasswordRestorePage: {
			enterEmail: 'Введите почту',
			weWillSendYouCode: 'Мы отправим на неё код для восстановления пароля',
			weSentCode: 'Мы отправили код для восстановления пароля на',
			codeSent: 'Отправили вам код',
			enterCode: 'Введите код',
			passwordRestore: 'Восстановление пароля',
			createANewPassword: 'Придумайте новый пароль',
			tooManyAttempts: 'Слишком много попыток. Попробуйте позже.',
			invalidCodeAttemptsRemaining: 'Неверный код, осталось попыток:',
			invalidCode: 'Неверный код.',
			inputPlaceholder: {
				email: 'Введите email',
				password: 'Введите пароль',
				passwordConfirm: 'Повтор пароля'
			},
			actions: {
				sendCode: 'Отправить код',
				resendCode: 'Отправить код повторно',
				saveNewPassword: 'Сохранить новый пароль'
			}
		},
		AuthPage: {
			mailConfirmation: {
				emailConfirm: 'Подтверждение почты',
				codeSent: 'Мы отправили код на',
				enterCode: 'Введите код',
				resendCode: 'Отправить код повторно',
				checkSpam: 'Не получили код? Проверьте спам'
			},
			header: {
				signIn: 'Авторизация',
				signUp: 'Регистрация'
			},
			forgotPassword: 'Забыли пароль?',
			inputPlaceholder: {
				email: 'Введите email',
				username: 'Введите логин',
				password: 'Введите пароль'
			},
			actions: {
				signIn: 'Войти',
				signUp: 'Зарегистрироваться'
			},
			agreement: {
				agreeWith: 'Согласен с',
				processingConditions: 'условиями обработки',
				personalDataAnd: 'персональных данных и',
				privacyPolicy: 'политикой конфиденциальности'
			}
		},
		BatteryOptimizationBanner: {
			disable: 'Отключите',
			batteryOptimization: 'оптимизацию батареи',
			workProperly: 'для правильной работы геолокации'
		},
		WorkoutPage: {
			header: {
				newWorkout: 'Новая тренировка',
				workout: 'Тренировка'
			},
			start: 'Начать',
			finishWorkout: 'Вы действительно хотите завершить тренировку?',
			finishButton: 'Завершить',
			bottomSheets: {
				geolocation: {
					title: 'Разрешите доступ к геолокации',
					inBackgroundMode: 'в фоновом режиме'
				},
				deniedGeolocation: {
					title: 'Без разрешения на получение геолокации в фоновом и активном режиме невозможно начать тренировку.',
					description: 'Включите разрешение в настройках приложения'
				},
				notifications: {
					title: 'Разрешите доступ к отправке пуш-уведомлений'
				},
				physicalActivity: {
					title: 'Разрешите доступ к отслеживанию',
					description: 'физической активности'
				},
				enableGps: {
					recordWorkouts: 'Чтобы записывать тренировки,',
					switch: 'нужно включить передачу',
					geo: 'геоданных.',
					doItNow: 'Сделать это сейчас?'
				},
				notFinishedWorkout: {
					cannotStartNow: 'Сейчас нельзя начать новую тренировку,',
					uHaveUnfinishedWorkout: 'потому что у вас есть незавершённая тренировка',
					selectNextAction: 'Выберите дальнейшее действие'
				},
				unsavedTrainings: {
					titleFull: 'У вас есть несохранённая тренировка',
					titleShort: 'У вас есть',
					noun: {
						one: 'несохранённая тренировка',
						two: 'несохранённые тренировки',
						five: 'несохранённых тренировок'
					}
				},
				actions: {
					allow: 'Разрешить',
					notNow: 'Не сейчас',
					details: 'Подробнее',
					saveAll: 'Сохранить все',
					deleteAll: 'Удалить все',
					askLater: 'Спросить позже',
					openSettings: 'Открыть настройки',
					restoreAndContinue: 'Восстановить и продолжить'
				}
			}
		},
		WorkoutResultsPage: {
			cantLoadMoreFiles: 'Нельзя загружать больше',
			filePlurals: {
				one: 'файла',
				two: 'файлов',
				five: 'файлов'
			},
			filePluralsSecond: {
				one: 'файл',
				two: 'файла',
				five: 'файлов'
			},
			addedFilesRestrictions: {
				added: 'Добавлено',
				from: 'из',
				limit: 'лимит',
				perPost: 'на пост.',
				notAdded: 'не добавлено'
			},
			postPhoto: 'Фото поста',
			quitWithoutCreatePost: 'Выйти без создания публикации?',
			workoutSavedPostLater: 'Тренировка сохранена в истории, а пост создать можно будет позже.',
			trainingInformation: 'Сведения о тренировке',
			switchMode: {
				map: 'Карта',
				chart: 'График'
			},
			paceChart: 'График темпа',
			notEnoughDataChart: 'Недостаточно данных для отображения графика',
			members: 'Участники',
			inputPlaceholder: {
				title: 'Введите заголовок',
				description: 'Введите описание'
			},
			addPhoto: 'Добавить фото',
			edit: 'Отредактировать',
			publication: 'Публикация',
			editPublication: 'Редактирование публикации',
			onlyCreatorCanPublish: 'Опубликовать пост может только создатель тренировки'
		},
		UserProfilePage: {
			header: 'Профиль',
			stats: {
				subscribers: 'Подписчики',
				friends: 'Друзья',
				subscriptions: 'Подписки'
			},
			deleteFriendText: 'Вы действительно хотите удалить пользователя из друзей?',
			subscribe: 'Подписаться',
			unsubscribe: 'Отписаться',
			friendStatus: {
				addAsFriend: 'Добавить в друзья',
				deleteFriend: 'Удалить из друзей',
				inviteFriend: 'Заявка отправлена',
				acceptFriend: 'Принять заявку'
			},
			activity: 'Активности',
			postFeed: 'Лента'
		},
		EmojiPicker: {
			searchPlaceholder: 'Поиск эмодзи',
			noResultsText: 'Ничего не найдено',
			categoryNames: {
				search_results: 'Результаты поиска',
				frequently_used: 'Недавно использованные',
				smileys_emotion: 'Смайлики и эмоции',
				people_body: 'Люди и тело',
				animals_nature: 'Животные и природа',
				food_drink: 'Еда и напитки',
				travel_places: 'Путешествия и места',
				activities: 'Активности',
				objects: 'Объекты',
				symbols: 'Символы',
				flags: 'Флаги'
			}
		},
		ProfilePage: {
			menu: {
				editProfile: 'Редактировать профиль',
				about: 'О приложении',
				exit: 'Выход'
			},
			stats: {
				subscribers: 'Подписчики',
				friends: 'Друзья',
				subscriptions: 'Подписки'
			},
			workoutHistory: 'История тренировок',
			achievements: 'Достижения',
			activity: 'Активности',
			profileLoadError: {
				text: 'Не удалось обновить профиль.',
				action: 'Повторить'
			},
			dailyActivity: {
				title: 'Дневная активность',
				mobility: 'Подвижность'
			},
			postFeed: 'Лента',
			activityList: {
				run: 'Бег',
				track: 'Трек',
				bicycle: 'Велосипед',
				steps: 'Шаги'
			}
		},
		DailyActivity: {
			mobility: 'Подвижность',
			kcalShort: 'ККАЛ',
			kcalPerDay: 'ККАЛ/ДЕНЬ',
			changeGoalToday: 'Изменить цель на сегодня',
			changeSchedule: 'Изменить расписание',
			changeGoal: 'Изменить цель',
			chartPlaceholder: 'Здесь мог бы быть график траты ккал относительно времени дня',
			steps: 'Шаги',
			distance: 'Дистанция',
			goalToday: {
				title: 'Цель подвижности на сегодня',
				description:
					'Задайте временную цель подвижности на сегодня в соответствии с желаемым уровнем активности. Это не повлияет на Ваше текущее расписание целей.'
			},
			goalEveryDay: {
				title: 'Дневная цель подвижности',
				description:
					'Задайте ежедневную цель в зависимости от Вашего реального или желаемого уровня физической активности.'
			},
			goalSchedule: {
				title: 'Расписание целей подвижности'
			},
			weekdaysShort: {
				monday: 'Пн',
				tuesday: 'Вт',
				wednesday: 'Ср',
				thursday: 'Чт',
				friday: 'Пт',
				saturday: 'Сб',
				sunday: 'Вс'
			},
			weekdaysLong: {
				monday: 'Понедельник',
				tuesday: 'Вторник',
				wednesday: 'Среда',
				thursday: 'Четверг',
				friday: 'Пятница',
				saturday: 'Суббота',
				sunday: 'Воскресенье'
			},
			yearShortSuffix: ' г.'
		},
		ReportAProblemPage: {
			header: 'Сообщить о проблеме',
			inputPlaceholder: 'Подробно опишите проблему, которую вы обнаружили',
			attachDeviceDetails: 'Прикрепить данные о моём устройстве',
			send: 'Отправить сообщение'
		},
		AboutPage: {
			header: 'О приложении',
			itemsList: {
				privacyPolicy: 'Политика конфиденциальности',
				personalDataProcessingPolicy: 'Политика обработки персональных данных',
				termsYandexMaps: 'Условия использования отдельных сервисов Яндекс карт',
				reportProblem: 'Сообщить о проблеме'
			}
		},
		SettingsPage: {
			header: 'Настройки',
			inAppNotifications: {
				header: 'Настройка уведомлений',
				settingsList: {
					addAsFriend: {
						title: 'Добавление в друзья',
						description: 'Получать уведомление, когда кто-то добавляет меня в друзья'
					},
					workoutInvite: {
						title: 'Приглашение на тренировку',
						description: 'Получать уведомление, когда кто-то приглашает меня на тренировку'
					},
					newAchievement: {
						title: 'Новое достижение',
						description: 'Получать уведомление, когда я получаю новое достижение'
					},
					postAboutWorkout: {
						title: 'Пост о тренировке',
						description:
							'Получать уведомление, когда хост тренировки выкладывает публикацию о прошедшей тренировке'
					}
				}
			},
			pickAColor: {
				header: {
					choose: 'Выбор',
					color: 'цвета'
				}
			},
			settingsList: {
				inAppNotifications: 'Уведомления внутри приложения',
				chooseYour: 'Выбор своего ',
				color: 'цвета',
				language: 'Язык',
				changeEmail: 'Сменить почту'
			},
			deleteAccount: 'Удалить аккаунт',
			deleteAccountDetails:
				'Удаление вашей учетной записи является необратимым и не подлежит отмене. Все ваши данные, тренировки и история будут потеряны навсегда.',
			deleteAccountModal: {
				label: 'Удаление аккаунта',
				accountDeleteText:
					'Вы уверены, что хотите удалить свою учетную запись? Это действие необратимо, и все ваши данные будут безвозвратно удалены.'
			}
		},
		ChangeEmailPage: {
			header: 'Смена почты',
			currentEmail: 'Текущая почта',
			newEmailPlaceholder: 'Введите новую почту',
			currentPasswordPlaceholder: 'Введите текущий пароль',
			willSendToNewEmail: 'Мы отправим код подтверждения на новую почту',
			codeSent: 'Мы отправили код на',
			enterCode: 'Введите код',
			resendCode: 'Отправить код повторно',
			sendCode: 'Отправить код'
		},
		PhotoPicker: {
			camera: 'Камера',
			gallery: 'Галерея'
		},
		EditProfilePage: {
			header: 'Редактирование профиля',
			weight: 'Вес',
			avatarModal: {
				title: 'Фото профиля'
			},
			inputPlaceholder: {
				name: 'Введите имя',
				username: 'Введите логин'
			},
			topThreeActivity: 'Топ 3 активности на показ'
		},
		DocumentPage: {
			header: 'Просмотр документа'
		},
		PostDetailsPage: {
			header: 'Просмотр поста',
			authorRoute: 'Маршрут автора',
			allRoutes: 'Все маршруты',
			deletePostModal: {
				label: 'Вы действительно хотите удалить пост?'
			}
		},
		WorkoutHistoryPage: {
			header: 'История тренировок',
			unsavedWorkouts: 'Несохраненные тренировки'
		},
		UserAchievementsPage: {
			header: 'Достижения',
			received: 'Полученные'
		},
		AchievementsPage: {
			header: 'Мои достижения',
			received: 'Полученные',
			notReceived: 'Не полученные',
			have: 'Есть у',
			users: 'пользователей'
		},
		PostsFeedPage: {
			people: 'Люди',
			posts: 'Посты',
			atLeastTwoSymbols: 'Введите хотя бы 2 символа',
			nothingFound: 'Ничего не нашлось'
		},
		NotificationsPage: {
			header: 'Уведомления',
			clearAll: 'Очистить все уведомления'
		},
		SubscribersPage: {
			header: 'Подписчики'
		},
		SubscriptionsPage: {
			header: 'Подписки'
		},
		FriendsPage: {
			header: 'Друзья',
			friendRequests: 'Запросы в друзья',
			deleteFriendText: 'Вы действительно хотите удалить пользователя из друзей?'
		},
		FriendRequestsPage: {
			header: 'Запросы в друзья'
		},
		Post: {
			subscribe: 'Подписаться',
			unsubscribe: 'Вы подписаны',
			report: 'Пожаловаться',
			participants: {
				and: 'и ещё'
			}
		},
		WorkoutParticipantsPage: {
			header: 'Участники тренировки'
		}
	}
}

export default ru
export type Translations = typeof ru
