import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useRef, useState } from 'react';
import {
    ColorSchemeName,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    useColorScheme,
} from 'react-native';

import Colors from '../constants/Colors';
import { TabScreensParamList } from '../navigation/tab-navigator';
import CompositionLoader from '../util/CompositionLoader';

export type Params = undefined; // No params

export default function OpenScreen({
    navigation,
}: NativeStackScreenProps<TabScreensParamList, 'Open'>) {
    const colorScheme = useColorScheme();
    const style = styles(colorScheme);
    const [fileError, setFileError] = useState<string | null>();
    const [urlError, setUrlError] = useState<string | null>();
    const compIdx = useRef<number>(-1);
    const [openUrl, onChangeUrl] = useState<string>('');

    const resetErrors = () => {
        setFileError(null);
        setUrlError(null);
    };

    const chooseDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });

        if (result?.assets?.length) {
            resetErrors();
            const file = result.assets[0];
            let fileContent;
            try {
                if (Platform.OS === 'web') {
                    const response = await fetch(file.uri);
                    const content = await response.text();
                    fileContent = content;
                } else {
                    const fileInfo = await FileSystem.getInfoAsync(file.uri);
                    if (fileInfo.exists) {
                        fileContent = await FileSystem.readAsStringAsync(file.uri, {
                            encoding: FileSystem.EncodingType.UTF8,
                        });
                    }
                }

                if (fileContent) {
                    compIdx.current = (compIdx.current + 1) % 10;
                    const key = 'composition' + compIdx.current;

                    await CompositionLoader.stageLocal(fileContent, key);
                    navigation.navigate('Inspect', { composition: key });
                }
            } catch (bad: any) {
                setFileError(bad instanceof Error ? bad.message : bad.toString());
            }
        }
    };

    const downloadUrlJson = async () => {
        Keyboard.dismiss();
        resetErrors();
        try {
            const key = await CompositionLoader.stageUrl(openUrl);
            navigation.navigate('Inspect', { composition: key });
        } catch (err: any) {
            setUrlError(err instanceof Error ? err.message : err.toString());
        }
    };

    return (
        <View style={[style.container]}>
            <Pressable onPress={chooseDocument}>
                <View style={[style.button]}>
                    <Text style={style.buttonText}>Open File</Text>
                </View>
            </Pressable>
            {fileError ? <Text style={style.errorText}>{fileError}</Text> : null}
            <View style={style.separator} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                <TextInput
                    editable
                    maxLength={1024}
                    onChangeText={(newUrl) => onChangeUrl(newUrl)}
                    value={openUrl}
                    placeholder="Type or paste URL of composition JSON"
                    keyboardType="url"
                    onSubmitEditing={downloadUrlJson}
                    style={[{ flexShrink: 1, width: 400 }, style.textInput]}
                />
                <Pressable onPress={downloadUrlJson}>
                    <View style={[style.button]}>
                        <Text style={style.buttonText}>Open URL</Text>
                    </View>
                </Pressable>
            </View>
            {urlError ? <Text style={style.errorText}>{urlError}</Text> : null}
        </View>
    );
}

const styles = function (colorScheme: ColorSchemeName) {
    const colors = Colors[colorScheme ?? 'light'];

    return StyleSheet.create({
        container: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            backgroundColor: colors.background,
        },
        separator: {
            height: 1,
            backgroundColor: colors.tint,
            marginVertical: 30,
            width: '80%',
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
        },
        button: {
            margin: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            backgroundColor: colors.accentBackground,
        },
        buttonText: {
            color: colors.text,
            fontWeight: 'bold',
        },
        errorText: {
            color: colors.text,
            fontWeight: 'bold',
            marginTop: 20,
        },
        textInput: {
            margin: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            backgroundColor: colors.accentBackground,
            color: colors.text,
        },
    });
};
