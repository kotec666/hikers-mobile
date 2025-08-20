import {Text, View} from 'react-native';
import {Button} from "@/components/ui/Button";
import {useRouter} from "expo-router";

export default function HomeScreen() {
    const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center">
        <Text className="text-white">123123</Text>
        <Button variant="white" onPress={() => router.navigate('/hello-screen')}>
            to hello screen
        </Button>
    </View>
  );
}
