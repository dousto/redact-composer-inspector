import { useState } from 'react';
import { useColorScheme, ScrollView, LayoutChangeEvent, NativeScrollEvent } from 'react-native';
import Animated, {
    useAnimatedRef,
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompositionNodeInspector from './composition-node-inspector';
import Colors from '../constants/Colors';
import { ScrollContext } from '../contexts/ScrollCtx';
import { Composition } from '../types/redact';

export default function CompositionInspector({ composition }: { composition: Composition }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const hScrollRef = useAnimatedRef<Animated.ScrollView>();

    const scrollCtx = {
        scroll: {
            x: useSharedValue(0),
        },
        hScrollRef,
        layout: {
            height,
            width,
        },
    };

    const horizontalScrollHandler = useAnimatedScrollHandler({
        // Don't extract these into a single fn, crashes app
        onScroll: (event: NativeScrollEvent) => {
            scrollCtx.scroll.x.value = event.contentOffset.x;
        },
        onEndDrag: (event: NativeScrollEvent) => {
            scrollCtx.scroll.x.value = event.contentOffset.x;
        },
        onMomentumEnd: (event: NativeScrollEvent) => {
            scrollCtx.scroll.x.value = event.contentOffset.x;
        },

        // onScroll: (event: NativeScrollEvent) => {
        //     const velocity = Math.abs(scrollCtx.scroll.x.value - event.contentOffset.x) * 3;
        //     scrollCtx.scroll.x.value = withSpring(event.contentOffset.x, {
        //         stiffness: 1000,
        //         velocity,
        //         damping: 40,
        //         overshootClamping: true,
        //     });
        // },
        // onEndDrag: (event: NativeScrollEvent) => {
        //     const velocity = Math.abs(scrollCtx.scroll.x.value - event.contentOffset.x);
        //     scrollCtx.scroll.x.value = withSpring(event.contentOffset.x, {
        //         stiffness: 1000,
        //         velocity,
        //         damping: 40,
        //         overshootClamping: true,
        //     });
        // },
        // onMomentumEnd: (event: NativeScrollEvent) => {
        //     const velocity = Math.abs(scrollCtx.scroll.x.value - event.contentOffset.x);
        //     scrollCtx.scroll.x.value = withSpring(event.contentOffset.x, {
        //         stiffness: 1000,
        //         velocity,
        //         damping: 40,
        //         overshootClamping: true,
        //     });
        // },
    });

    const layoutChange = (event: LayoutChangeEvent) => {
        scrollCtx.layout.height = event.nativeEvent.layout.height;
        scrollCtx.layout.width = event.nativeEvent.layout.width;
        setHeight(event.nativeEvent.layout.height);
        setWidth(event.nativeEvent.layout.width);
    };

    return (
        <Animated.ScrollView
            horizontal
            ref={hScrollRef}
            onScroll={horizontalScrollHandler}
            scrollEventThrottle={6}
            onLayout={layoutChange}
            style={{ backgroundColor: colors.background }}>
            <SafeAreaView edges={['left', 'right']}>
                <ScrollView nestedScrollEnabled>
                    <SafeAreaView edges={['top']}>
                        <ScrollContext.Provider value={scrollCtx}>
                            <CompositionNodeInspector
                                node={composition.tree}
                                color={colors.accentBackground}
                            />
                        </ScrollContext.Provider>
                    </SafeAreaView>
                </ScrollView>
            </SafeAreaView>
        </Animated.ScrollView>
    );
}
