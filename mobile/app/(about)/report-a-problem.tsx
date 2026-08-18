import React, { useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { Dimensions, Keyboard, PixelRatio, Platform, Pressable, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { fontFamily } from '@/constants/Fonts'
import { Page } from '@/components/ui/Page'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useCreateReportMutation } from '@/queries/reports'
import { ReportType } from '@shared/enums'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { lengths } from '@shared/lengths'
import { useTranslation } from 'react-i18next'
import * as Device from 'expo-device'
import * as Application from 'expo-application'
import i18n from '@/i18next/i18next'

const { width, height } = Dimensions.get('window')

interface IReportAProblemForm {
	text: string
}

const ReportAProblem = () => {
	const { t } = useTranslation()
	const { handleSubmit, control, reset } = useForm<IReportAProblemForm>()
	const { ErrorMessages } = useErrorMessage()

	const [serverErrors, setServerErrors] = useState<{ [key: string]: string | boolean | undefined }>()
	const [isDeviceInfoIncluded, setIsDeviceInfoIncluded] = useState<boolean>(true)

	const { mutateAsync: createReportMutation, isPending: isPendingCreate } = useCreateReportMutation()

	const getDeviceInfo = () => ({
		platform: Platform.OS,
		brand: Device.brand,
		manufacturer: Device.manufacturer,
		modelName: Device.modelName,
		deviceName: Device.deviceName,
		deviceType: Device.deviceType !== null ? Device.DeviceType[Device.deviceType] : null,
		osName: Device.osName,
		osVersion: Device.osVersion,
		appVersion: Application.nativeApplicationVersion,
		buildNumber: Application.nativeBuildVersion,
		locale: i18n.language,
		screen: {
			width,
			height,
			scale: PixelRatio.get(),
			fontScale: PixelRatio.getFontScale()
		}
	})

	const onSubmit = async (reportForm: IReportAProblemForm) => {
		setServerErrors(undefined)
		try {
			if (isDeviceInfoIncluded) {
			}

			await createReportMutation({
				type: ReportType.COMMON,
				text: reportForm.text,
				...(isDeviceInfoIncluded && { deviceInfo: getDeviceInfo() })
			})
			reset()
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e, t)
			setServerErrors(formattedErrors)
		}
	}

	return (
		<Page>
			<Container className="flex-1">
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					keyboardVerticalOffset={Platform.OS === 'android' ? 60 : 80}
					behavior="padding"
				>
					<Pressable onPress={Keyboard.dismiss} accessible={false} style={{ flex: 1 }}>
						<View className="flex-1">
							<HeaderBack>{t('ReportAProblemPage.header')}</HeaderBack>
							<View className="justify-center gap-[24px] mt-[20px]">
								<View className="gap-[20px]">
									<Controller
										name="text"
										control={control}
										rules={{
											minLength: {
												value: lengths.reports.text.min,
												message: ErrorMessages.optionalMin(lengths.reports.text.min)
											},
											maxLength: {
												value: lengths.reports.text.max,
												message: ErrorMessages.optionalMax(lengths.reports.text.max)
											}
										}}
										render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
											<Input
												multiline
												placeholder={t('ReportAProblemPage.inputPlaceholder')}
												error={error?.message || serverErrors?.text}
												onChangeText={onChange}
												value={value}
												onBlur={onBlur}
											/>
										)}
									/>
									<View className="flex-row justify-between">
										<View className="flex-row items-center gap-[10px]">
											<Checkbox
												value={isDeviceInfoIncluded}
												onValueChange={() => setIsDeviceInfoIncluded((prev) => !prev)}
												// error={Boolean(error)}
											/>
											<Text
												className="flex-shrink text-[11px] text-white"
												style={{ fontFamily: fontFamily.regular }}
											>
												{t('ReportAProblemPage.attachDeviceDetails')}
											</Text>
										</View>
									</View>
								</View>
							</View>
							<View className="flex-1 justify-end">
								<Button onPress={handleSubmit(onSubmit)} variant="white" isLoading={isPendingCreate}>
									{t('ReportAProblemPage.send')}
								</Button>
							</View>
						</View>
					</Pressable>
				</KeyboardAvoidingView>
			</Container>
		</Page>
	)
}

export default ReportAProblem
