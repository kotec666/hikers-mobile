import React from 'react';
import {View, SafeAreaView, ScrollView, Image} from "react-native";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {Container} from "@/components/ui/Container";
import {StatusBar} from "expo-status-bar";
import PostListItemHeader from "@/components/ui/Post/PostListItemHeader";
import HeaderBack from "@/components/ui/HeaderBack";
import PostBodyWrapper, {PostType} from "@/components/ui/Post/PostBodyWrapper";

const Post = () => {
    const insets = useSafeAreaInsets()

    return (
        <SafeAreaProvider style={{ paddingTop: insets.top }}>
            <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
                <Container className="gap-[20px]">
                    <HeaderBack>Просмотр поста</HeaderBack>
                    <ScrollView style={{ flex: 1, width: '100%'}}>
                        <View className="gap-[15px]">
                            <PostListItemHeader isSubscribed />
                            <PostBodyWrapper mode={PostType.POST_ITEM} />
                            <Image
                                source={require('@/assets/images/carousel/carousel-2.webp')}
                                className="rounded-[25px] border-[1px] border-white/20 w-full"
                                resizeMode="cover"
                            />
                        </View>
                    </ScrollView>
                </Container>
                <StatusBar style="light" />
                </SafeAreaView>
            </SafeAreaProvider>
    );
};

export default Post;