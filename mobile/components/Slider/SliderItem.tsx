import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {ImageSliderType} from "@/components/Slider/Slider";
import {fontFamily} from "@/constants/Fonts";

export type SliderItemProps = {
    item: ImageSliderType
    index: number
}

const {width, height} = Dimensions.get('screen')

export function SliderItem({item}: SliderItemProps) {

    return (
        <View className="justify-center items-center" style={styles.itemContainer}>
            <View className="">
                <Image
                    className=""
                    source={item.image}
                    style={styles.image}
                />
                <View className="absolute bottom-0 left-0 right-0 h-[135px] overflow-hidden">
                    <Image
                        source={item.image}
                        style={[styles.image, {position: 'absolute', bottom: 0}]}
                        resizeMode="cover"
                        blurRadius={1}
                    />
                </View>

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.65)']}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    style={StyleSheet.absoluteFill}
                />

                <View className="absolute bottom-[20px] left-[20px]">
                    <Text
                        className="text-white text-[39px]"
                        style={styles.titleText}
                    >
                        {item.title}
                    </Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        width: width,
        height: height / 2,
    },
    image: {
        width,
        height: height / 2,
    },
    titleText: {
        fontFamily: fontFamily.bold, textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    descriptionText: {
        fontFamily: fontFamily.regular
    }
})