import { View, Text } from 'react-native'
import { BlurView } from '@sbaiahmed1/react-native-blur'
import { fontFamily } from '@/constants/Fonts'

const Blurpage = () => {
	return (
		<View style={{ flex: 1 }}>
			<Text className="text-white">
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem
				lorem lorem lorem lorem lorem lorem{' '}
			</Text>
			<BlurView
				blurType="light"
				blurAmount={1}
				style={{
					position: 'absolute',
					top: 100,
					left: 50,
					right: 50,
					height: 200,
					borderRadius: 20,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text className="text-white text-xl" style={{ fontFamily: fontFamily.bold }}>
					Content with blur background
				</Text>
			</BlurView>
		</View>
	)
}

export default Blurpage
