import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';

import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            { }
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: true,
                    tabBarStyle: { paddingBottom: 5 },
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        if (route.name === 'Home') {
                            iconName = focused ? 'timer' : 'timer-outline';
                        } else if (route.name === 'Reports') {
                            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                        } else {
                            iconName = 'alert-circle';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#3498db',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Zamanlayıcı' }} />
                <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Raporlar' }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
