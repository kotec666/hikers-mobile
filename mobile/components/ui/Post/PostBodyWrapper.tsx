import React from 'react';
import {TouchableOpacity, View} from "react-native";
import PostListItemSlider from "@/components/ui/Post/PostListItemSlider";
import {useRouter} from "expo-router";
import PostListItemBody from "@/components/ui/Post/PostListItemBody";

export enum PostType {
    FEED_LIST_ITEM = "FEED_LIST_ITEM",
    POST_ITEM = "POST_ITEM",
}

interface IProps {
    mode: PostType
}

const PostBodyWrapper = (props: IProps) => {
    const router = useRouter()
    const PostSliderItems = [
        { id: 1, image: require('@/assets/images/carousel/carousel-2.webp') },
        { id: 2, image: require('@/assets/images/carousel/carousel-2.webp') },
        { id: 3, image: require('@/assets/images/carousel/carousel-2.webp') }
    ]

    const IS_FEED_LIST_ITEM = props.mode === "FEED_LIST_ITEM"

    return (
        <>
            {IS_FEED_LIST_ITEM ? (
                <>
                    <TouchableOpacity onPress={() => router.push('/news-feed/1')} >
                        <PostListItemBody />
                    </TouchableOpacity>
                    <View>
                        <PostListItemSlider data={PostSliderItems} />
                    </View>
                </>
            ) : (
                <PostListItemBody />
            )}
        </>
    );
};

export default PostBodyWrapper;