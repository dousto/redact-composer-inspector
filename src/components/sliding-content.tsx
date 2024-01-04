import React, { useContext } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { ScrollContext } from '../contexts/ScrollCtx';

export default function SlidingContent({
    from,
    to,
    window,
    children,
}: {
    from: number;
    to: number;
    window: number;
    children: React.JSX.Element[] | React.JSX.Element;
}) {
    const scrollCtx = useContext(ScrollContext);

    const windowDelta = to - from - window;

    const spaceFillStyle = useAnimatedStyle(() => {
        if (!(scrollCtx.scroll.x.value + window < from || scrollCtx.scroll.x.value > to)) {
            const scale = Math.max(0, Math.min(1, (scrollCtx.scroll.x.value - from) / windowDelta));

            if (windowDelta >= 0) {
                return { flexGrow: scale };
            } else {
                return { flexGrow: 1 - scale };
            }
        } else {
            return { flexGrow: 0 };
        }
    });

    return (
        <View style={{ flexDirection: 'row' }}>
            <Animated.View style={spaceFillStyle} />
            <View style={{ flex: -1, maxWidth: scrollCtx.layout.width * 0.8 }}>{children}</View>
        </View>
    );
}
