import FontAwesome from '@expo/vector-icons/FontAwesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, useColorScheme } from 'react-native';

import { RootStackParamList } from '.';
import Colors from '../constants/Colors';
import InspectScreen, { Params as InspectScreenParams } from '../screens/inspect';
import OpenScreen, { Params as OpenScreenParams } from '../screens/open';

export type TabScreensParamList = {
    Open: OpenScreenParams;
    Inspect: InspectScreenParams;
};

const Tab = createBottomTabNavigator<TabScreensParamList>();

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={styles.tabBarIcon} {...props} />;
}

export default function TabLayout({
    navigation,
}: NativeStackScreenProps<RootStackParamList, 'TabNavigator'>) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: colors.accentBackground },
                tabBarItemStyle: { backgroundColor: colors.accentBackground },
                tabBarActiveTintColor: colors.tabIconSelected,
            }}>
            <Tab.Screen
                name="Open"
                component={OpenScreen}
                options={{
                    title: 'Open',
                    tabBarIcon: ({ color }) => <TabBarIcon name="upload" color={color} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Inspect"
                component={InspectScreen}
                options={{
                    title: 'Inspector',
                    tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    headerRight: {
        marginRight: 15,
    },
    tabBarIcon: {
        marginLeft: -5,
        marginBottom: -3,
    },
});
