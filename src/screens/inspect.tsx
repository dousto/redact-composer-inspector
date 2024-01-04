import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Buffer } from 'buffer';
import pako from 'pako';
import { useState } from 'react';
import { View, Text, useColorScheme, StyleSheet } from 'react-native';

import CompositionInspector from '../components/composition-inspector';
import Colors from '../constants/Colors';
import Examples from '../constants/Examples';
import { TabScreensParamList } from '../navigation/tab-navigator';

export type Params = { composition: string };

export default function InspectScreen({
    route,
}: NativeStackScreenProps<TabScreensParamList, 'Inspect'>) {
    const [compositionJson, setCompositionJson] = useState<string>();
    const [compositionKey, setCompositionKey] = useState<string>();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (route.params?.composition !== compositionKey) {
        if (route.params?.composition.startsWith('examples/')) {
            const example = Examples.get(route.params.composition); // These should be loaded via fetch on web
            setCompositionJson(JSON.stringify(example));
        } else {
            AsyncStorage.getItem(route.params?.composition).then((base64) => {
                if (base64) {
                    const json = pako.ungzip(Buffer.from(base64, 'base64'), { to: 'string' });
                    setCompositionJson(json);
                }
            });
        }
        setCompositionKey(route.params.composition);
    }

    if (compositionJson) {
        return <CompositionInspector composition={JSON.parse(compositionJson)} />;
    } else {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text, fontWeight: 'bold', padding: 20 }}>
                    No file loaded.
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
