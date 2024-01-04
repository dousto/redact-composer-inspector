import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useContext, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    useColorScheme,
    Pressable,
    StyleProp,
    TextStyle,
    GestureResponderEvent,
} from 'react-native';
import { runOnJS, useDerivedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SlidingContent from './sliding-content';
import Colors from '../constants/Colors';
import { ScrollContext } from '../contexts/ScrollCtx';
import { CompositionNode } from '../types/redact';

const CompositionNodeInspector = ({ node, color }: { node: CompositionNode; color?: string }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const safeAreas = useSafeAreaInsets();

    const scrollCtx = useContext(ScrollContext);

    const otherColor = colors.accentBackgroundAlt;
    let childrenColor: string;
    if (color === colors.accentBackground) {
        color = colors.accentBackground;
        childrenColor = otherColor;
    } else {
        color = otherColor;
        childrenColor = colors.accentBackground;
    }

    const [expanded, setExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const scrollViewWidth = scrollCtx.layout.width - safeAreas.right - safeAreas.left;
    const beginVisibilityAt = node.start - scrollViewWidth;
    const endVisibilityAt = node.end;
    useDerivedValue(() => {
        runOnJS(setIsVisible)(
            !(
                scrollCtx.scroll.x.value < beginVisibilityAt ||
                scrollCtx.scroll.x.value > endVisibilityAt
            )
        );
    });

    const nodeName = Object.keys(node.element)[0] + (node.name ? '(' + node.name + ')' : '');
    // Add a space after commas and colons for *slightly* better line breaks.
    const nodeValue = JSON.stringify(Object.values(node.element)[0]).replace(
        /[:,]/g,
        (m) => m + ' '
    );

    const nodeWidth = node.end - node.start;

    return (
        <>
            <View
                style={{
                    minHeight: 35,
                    backgroundColor: color,
                    borderRadius: 20,
                    marginBottom: 7,
                    alignSelf: 'flex-start',
                    width: nodeWidth,
                }}>
                <WrapIf
                    condition={isVisible}
                    wrapper={(children) => (
                        <Pressable
                            onPress={() => setExpanded(!expanded)}
                            onLongPress={() => console.log(node.element)}>
                            {children}
                        </Pressable>
                    )}>
                    <View style={styles.container}>
                        <WrapIf
                            condition={isVisible}
                            wrapper={(children) => (
                                <SlidingContent
                                    from={node.start}
                                    to={node.end}
                                    window={
                                        scrollCtx.layout.width - safeAreas.right - safeAreas.left
                                    }>
                                    {children}
                                </SlidingContent>
                            )}>
                            <View style={{ flexDirection: 'row', flex: -1 }}>
                                <SkipButton
                                    icon="backward"
                                    isVisible={isVisible}
                                    style={{ color: colors.text }}
                                    onPress={() =>
                                        scrollCtx.hScrollRef.current?.scrollTo({
                                            x: node.start - scrollCtx.layout.width,
                                            animated: true,
                                        })
                                    }
                                />
                                <View
                                    style={{
                                        flex: -1,
                                        flexDirection: 'column',
                                        paddingHorizontal: 3,
                                    }}>
                                    <Text style={{ color: colors.text }}>
                                        {nodeName + (nodeValue === 'null' ? '' : ': ' + nodeValue)}
                                    </Text>
                                    <Text style={{ color: colors.text }}>
                                        {node.start + '..' + node.end}
                                    </Text>
                                    <View style={{ flexDirection: 'row' }} />
                                </View>
                                <SkipButton
                                    icon="forward"
                                    isVisible={isVisible}
                                    style={{ color: colors.text }}
                                    onPress={() =>
                                        scrollCtx.hScrollRef.current?.scrollTo({
                                            x: node.end,
                                            animated: true,
                                        })
                                    }
                                />
                            </View>
                        </WrapIf>
                    </View>
                </WrapIf>
                {!expanded ? null : <NodeChildren node={node} color={childrenColor} />}
            </View>
        </>
    );
};

export default React.memo(CompositionNodeInspector);

const NodeChildren = React.memo(({ node, color }: { node: CompositionNode; color?: string }) => {
    const rows = node.children?.reduce((acc: CompositionNode[][], curr) => {
        if (acc.length === 0) {
            acc.push([curr]);
        } else if (curr.end - curr.start < 50 || curr.start < node.start || curr.end > node.end) {
            //acc.push([curr])
        } else {
            const findFit = acc.find((nonOverlapping) => {
                return (
                    nonOverlapping.every((node) => node.end <= curr.start) ||
                    nonOverlapping.every((node) => node.start >= curr.end)
                );
            });

            if (findFit) {
                findFit.push(curr);
                findFit.sort((a, b) => a.start - b.start);
            } else {
                acc.push([curr]);
            }
        }

        return acc;
    }, []);

    return rows?.map((row, rowNumber) => {
        return (
            <View
                key={JSON.stringify(node.element) + '.childrenRow' + rowNumber}
                style={{ flexDirection: 'row' }}>
                {row.reduce((acc: React.JSX.Element[], rowEle, idx, r) => {
                    let spacerLength = 0;
                    if (idx !== 0) {
                        spacerLength = rowEle.start - r[idx - 1].end;
                    } else {
                        spacerLength = rowEle.start - node.start;
                    }

                    if (spacerLength > 0) {
                        acc.push(<View key={idx} style={{ width: spacerLength }} />);
                    }
                    acc.push(
                        <CompositionNodeInspector
                            key={JSON.stringify(node.element) + '.child' + idx}
                            node={rowEle}
                            color={color}
                        />
                    );

                    return acc;
                }, [])}
            </View>
        );
    });
});

const WrapIf = React.memo(
    ({
        condition,
        wrapper,
        children,
    }: {
        condition: boolean;
        wrapper: (children: React.JSX.Element[] | React.JSX.Element) => React.JSX.Element;
        children: React.JSX.Element[] | React.JSX.Element;
    }) => (condition ? wrapper(children) : children)
);

const SkipButton = React.memo(
    ({
        icon,
        onPress,
        isVisible,
        style,
    }: {
        icon: 'forward' | 'backward';
        onPress: ((event: GestureResponderEvent) => void) | null | undefined;
        isVisible: boolean;
        style: StyleProp<TextStyle>;
    }) => (
        <>
            {isVisible ? (
                <Pressable hitSlop={12} onPress={onPress}>
                    <View
                        style={{
                            flex: 1,
                            paddingHorizontal: 4,
                            justifyContent: 'center',
                        }}>
                        <FontAwesome size={12} name={icon} style={style} />
                    </View>
                </Pressable>
            ) : (
                // If it's not visible, leave an empty space of the same size
                <View
                    style={{
                        height: 12,
                        width: 20,
                    }}
                />
            )}
        </>
    )
);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
});
