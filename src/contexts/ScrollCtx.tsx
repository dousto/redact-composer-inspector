import { RefObject, createContext } from 'react';
import Animated, { SharedValue } from 'react-native-reanimated';

export const ScrollContext = createContext<{
    scroll: {
        x: SharedValue<number>;
    };
    hScrollRef: RefObject<Animated.ScrollView>;
    layout: {
        height: number;
        width: number;
    };
}>({
    scroll: {
        x: { value: 0 },
    },
    hScrollRef: { current: null },
    layout: {
        height: 0,
        width: 0,
    },
});
