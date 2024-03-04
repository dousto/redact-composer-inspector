import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { View, Text, useColorScheme, StyleSheet, ColorSchemeName } from 'react-native';

import CompositionInspector from '../components/composition-inspector';
import Colors from '../constants/Colors';
import { TabScreensParamList } from '../navigation/tab-navigator';
import { Composition } from '../types/redact';
import CompositionLoader from '../util/CompositionLoader';

export type Params = { composition: string };

export default function InspectScreen({
    route,
}: NativeStackScreenProps<TabScreensParamList, 'Inspect'>) {
    const [errMsg, setErrMsg] = useState<string | null>();
    const [composition, setComposition] = useState<Composition | null>();
    const [compositionKey, setCompositionKey] = useState<string>();
    const colorScheme = useColorScheme();
    const style = styles(colorScheme);
    const colors = Colors[colorScheme ?? 'light'];

    if (route.params?.composition && route.params?.composition !== compositionKey) {
        const storageKey = route.params?.composition;
        CompositionLoader.load(storageKey)
            .then((comp) => {
                setComposition(comp);
                setErrMsg(null);
            })
            .catch((err: any) => {
                setErrMsg(err instanceof Error ? err.message : err.toString());
            });
        setCompositionKey(route.params.composition);
    }

    if (composition) {
        return <CompositionInspector composition={composition} />;
    } else {
        return (
            <View style={[style.container, { backgroundColor: colors.background }]}>
                {errMsg ? <Text style={style.errorText}>{errMsg}</Text> : null}
                <Text style={{ color: colors.text, fontWeight: 'bold', padding: 20 }}>
                    No file loaded.
                </Text>
            </View>
        );
    }
}

const styles = function (colorScheme: ColorSchemeName) {
    const colors = Colors[colorScheme ?? 'light'];

    return StyleSheet.create({
        container: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
        },
        errorText: {
            color: colors.text,
            fontWeight: 'bold',
            marginTop: 20,
        },
    });
};
