import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Buffer } from 'buffer';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import pako from 'pako';
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import Colors from '../constants/Colors';
import { TabScreensParamList } from '../navigation/tab-navigator';
import { Composition, CompositionNode } from '../types/redact';

export type Params = undefined; // No params

export default function OpenScreen({
    navigation,
}: NativeStackScreenProps<TabScreensParamList, 'Open'>) {
    const colorScheme = useColorScheme();
    const [error, setError] = useState<string>();
    const compIdx = useRef<number>(-1);
    const colors = Colors[colorScheme ?? 'light'];

    const chooseDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({});

        if (result?.assets?.length) {
            const file = result.assets[0];
            let fileContent;
            try {
                if (Platform.OS === 'web') {
                    const response = await fetch(file.uri);
                    const content = await response.json();
                    fileContent = content;
                } else {
                    const fileInfo = await FileSystem.getInfoAsync(file.uri);
                    if (fileInfo.exists) {
                        const fileData = await FileSystem.readAsStringAsync(file.uri, {
                            encoding: FileSystem.EncodingType.UTF8, // or any other encoding type
                        });
                        fileContent = JSON.parse(fileData);
                    }
                }
                try {
                    validateCompositionJson(fileContent);
                } catch (bad: any) {
                    throw new Error('Invalid composition JSON format: ' + bad.toString());
                }

                if (fileContent) {
                    const compressed = Buffer.from(pako.gzip(JSON.stringify(fileContent))).toString(
                        'base64'
                    );
                    compIdx.current = (compIdx.current + 1) % 10;
                    const key = 'composition' + compIdx.current;
                    AsyncStorage.setItem(key, compressed);
                    navigation.navigate('Inspect', { composition: key });
                }
                setError('');
            } catch (bad: any) {
                setError(bad.toString());
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Pressable onPress={chooseDocument}>
                <View style={[styles.button, { backgroundColor: colors.accentBackground }]}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>Open File</Text>
                </View>
            </Pressable>
            <Text style={{ color: colors.text, fontWeight: 'bold', padding: 20 }}>{error}</Text>
        </View>
    );
}

const validateCompositionJson = (comp: Composition) => {
    /* eslint-disable no-unused-expressions */
    comp.options.ticks_per_beat;
    validateCompositionNodeJson(comp.tree);
};

const validateCompositionNodeJson = (node: CompositionNode) => {
    /* eslint-disable no-unused-expressions */
    node.element;
    node.start;
    node.end;
    node.seed;
    node.rendered;
    node.element;
    node.children?.forEach((child) => validateCompositionNodeJson(child));
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    separator: {
        height: 1,
        marginVertical: 30,
        width: '80%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
});
