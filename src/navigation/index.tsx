import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import TabNavigator from './tab-navigator';

export type RootStackParamList = {
    TabNavigator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const linking = {
    prefixes: Platform.OS !== 'web' ? ['http://*', 'https://*'] : [],
    config: {
        screens: {
            TabNavigator: {
                // Adds the package.json "homepage" prefix, intended for subdirectory deployment
                path: process.env.PUBLIC_URL,
                screens: {
                    Open: { path: 'open' },
                    Inspect: { path: 'inspect' },
                },
            },
            NotFound: '*',
        },
    },
};

export default function RootStack() {
    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator>
                <Stack.Screen
                    name="TabNavigator"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
