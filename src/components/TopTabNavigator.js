import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { Icon } from 'react-native-elements';

import ManualStopSelectNavigator from './ManualStopSelectNavigator';
import GeoPredictionsScreen from './GeoPredictionsScreen';
import styles from '../styles/styles';

export class GeolocateScreen extends React.Component {
    render() {
        return (
            <GeoPredictionsScreen
                API_KEY={this.props.screenProps.API_KEY}
            />
        )
    }
}

export class BusScreen extends React.Component {
    render() {
        return (
            <ManualStopSelectNavigator
                screenProps={{'API_KEY': this.props.screenProps.API_KEY}}
            />
        )
    }
}

export class SubwayScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>
                    Subway!
                </Text>
            </View>
        )
    }
}

export class CommuterRailScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>
                    Commuter Rail!
                </Text>
            </View>
        )
    }
}

export class FerryScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>
                    Ferry!
                </Text>
            </View>
        )
    }
}

export default createBottomTabNavigator(
    {
        Bus: BusScreen,
        Subway: SubwayScreen,
        'Commuter Rail': CommuterRailScreen,
        Ferry: FerryScreen,
        Geolocate: GeolocateScreen
    },
    {
        initialRouteName: 'Bus',
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, horizontal, tintColor }) => {
                const { routeName } = navigation.state;
                let iconName, iconType, iconColor;
                if (routeName === 'Bus') {
                    iconName = 'bus';
                    iconType = 'font-awesome';
                    iconColor = focused ? 'black' : 'gray';
                }
                else if (routeName === 'Subway') {
                    iconName = 'subway';
                    iconType = 'font-awesome';
                    iconColor = focused ? 'black' : 'gray';
                }
                else if (routeName === 'Commuter Rail') {
                    iconName = 'train';
                    iconType = 'font-awesome';
                    iconColor = focused ? 'black' : 'gray';
                }
                else if (routeName === 'Ferry') {
                    iconName = 'ship';
                    iconType = 'font-awesome';
                    iconColor = focused ? 'black' : 'gray';
                }
                else if (routeName === 'Geolocate') {
                    iconName = 'crosshairs';
                    iconType = 'font-awesome';
                    iconColor = focused ? 'black' : 'gray';
                }
                // Returns an icon to pair with the label
                return <Icon type={iconType} name={iconName} color={iconColor} />
            }
        }),
        tabBarOptions: {
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray'
        },
    },
)