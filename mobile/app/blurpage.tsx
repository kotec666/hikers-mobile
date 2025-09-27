import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import {BlurView} from "expo-blur";

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
                tint="dark"
                intensity={10}
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
                <View style={{ backgroundColor: 'rgba(0,0,0,0)', borderWidth: 2, borderColor: 'red', zIndex: 1, elevation: 1 }}>
                    <Text className="text-white text-xl" style={{ fontFamily: fontFamily.bold }}>
                        Content with blur background
                    </Text>
                </View>
			</BlurView>
		</View>
	)
}

export default Blurpage
