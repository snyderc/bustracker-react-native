import React from 'react';
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Icon } from 'react-native-elements';

import { getData, convertDataToJson, formatDate } from './Utils';
import styles from '../styles/styles';

export default class GeoPredictionsScreen extends React.Component {
    state = {
        predictions: [],
        timePredictionsRetrieved: undefined,
        userLat: undefined,
        userLong: undefined,
        refreshing: false,
    }
    RADIUS = 0.007  // 0.007 = approx 1/2 mile
    componentDidMount() {
        this.updateLocation();
        this.interval = setInterval( () => this.getPredictions(), 30000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    // Gets the user's latitude and longitude, and sends to callback to process
    updateLocation = () => {
        navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
    }
    // Refreshes predictions on user request
    onRefresh = () => {
        this.setState({refreshing: true}, () => this.getPredictions());
    }
    // Calculates distance between two (x,y) points.
    getDistance = (lat1, long1, lat2, long2) => {
        return Math.sqrt(Math.pow(Math.abs(lat2-lat1),2)+Math.pow(Math.abs(long2-long1),2));
    }
    processGeolocatedPredictionsList = (jsonData, userLat, userLong) => {
        // Make maps out of the included stop, trip, route data
        const stopMap = new Map();
        const tripMap = new Map();
        const routeMap = new Map();
        jsonData.included.forEach( (el) => {
            if (el.type === 'stop') {
                stopMap.set(el.id, {
                    distance: this.getDistance(userLat, userLong, el.attributes.latitude, el.attributes.longitude),
                    stopName: el.attributes.name
                })
            }
            else if (el.type === 'trip') {
                tripMap.set(el.id, {
                    directionId: el.attributes.direction_id,
                    headsign: el.attributes.headsign
                });
            }
            else if (el.type === 'route') {
                routeMap.set(el.id, {
                    routeName: `${el.attributes.short_name ? `${el.attributes.short_name} - ` : '' }${el.attributes.long_name}`,
                    routeType: el.attributes.type,
                    sortOrder: el.attributes.sort_order
                });
            }
        });

        // Sort predictions by (1) routeId ASC (using provided sortOrder value), (2) directionId ASC, (3) stop distance ASC
        const sortedPredictions = jsonData.data.sort( (a, b) => {
            // Sort by route ID
            if (routeMap.get(a.relationships.route.data.id).sortOrder < routeMap.get(b.relationships.route.data.id).sortOrder) {
                return -1;
            }
            else if (routeMap.get(a.relationships.route.data.id).sortOrder > routeMap.get(b.relationships.route.data.id).sortOrder) {
                return 1;
            }
            // Sort by direction Id
            if (a.attributes.direction_id < b.attributes.direction_id) {
                return -1;
            }
            else if (a.attributes.direction_id < b.attributes.direction_id) {
                return 1;
            }
            // Sort by stop distance
            if (stopMap.get(a.relationships.stop.data.id).distance < stopMap.get(b.relationships.stop.data.id).distance) {
                return -1;
            }
            else if (stopMap.get(a.relationships.stop.data.id).distance > stopMap.get(b.relationships.stop.data.id).distance) {
                return 1;
            }
            // If same values for all sort criteria, return 0
            return 0;
        });

        // Create an array with the first prediction for each bus/stop direction
        const firstPredictionPerRouteDir = [];
        routeMap.forEach( (val, key) => {
            const firstPredictionsForKey = {
                routeId: key,
                routeSortOrder: val.sortOrder,
                routeType: val.routeType,
                closestPredictions: []
            };
            // Find first matching prediction in each directionId (0, 1)
            for (let i = 0; i < 2; i++) {
                foundPrediction = sortedPredictions.find( (el) => {
                    return el.relationships.route.data.id === key && el.attributes.direction_id === i;
                })
                if (foundPrediction) {
                    firstPredictionsForKey.closestPredictions.push({
                        directionId: i,
                        departureTime: new Date(foundPrediction.attributes.departure_time),
                        headsign: tripMap.get(foundPrediction.relationships.trip.data.id).headsign,
                        stopName: stopMap.get(foundPrediction.relationships.stop.data.id).stopName,
                        stopId: foundPrediction.relationships.stop.data.id,
                        tripId: foundPrediction.relationships.trip.data.id,
                    });
                }
            }
            firstPredictionPerRouteDir.push(firstPredictionsForKey);
        });
        // Sort the new array by route ID (as expressed by value of sort order)
        firstPredictionPerRouteDir.sort( (a, b) => {
            return a.routeSortOrder - b.routeSortOrder;
        });

        return firstPredictionPerRouteDir;

    }
    geoSuccess = (data) => {
        const userLat = data.coords.latitude;
        const userLong = data.coords.longitude;
        this.setState({userLat, userLong}, this.getPredictions);
    }
    getPredictions = () => {
        const predictionsUrl = `https://api-v3.mbta.com/predictions?api_key=${this.props.API_KEY}&filter[latitude]=${this.state.userLat}&filter[longitude]=${this.state.userLong}&filter[radius]=${this.RADIUS}&include=stop,route,trip`
        console.log(predictionsUrl);
        getData(predictionsUrl)
        .then(convertDataToJson)
        .then((jsonData) => {
            return this.processGeolocatedPredictionsList(jsonData, this.state.userLat, this.state.userLong)
        })
        .then((data) => {
            this.setState({
                predictions: data,
                timePredictionsRetrieved: new Date(Date.now()),
                refreshing: false
            })
        });
    }
    geoError = (err) => {
        console.log(err);
    }
    formatPrediction = (departureTime) => {
        const minutesToDeparture = Math.floor((departureTime - this.state.timePredictionsRetrieved) / 1000 / 60);
        if (minutesToDeparture > 0) {
          return `${minutesToDeparture} min`;
        }
        else {
          return 'Arriving';
        }
      }
    render() {
        if (!this.state.timePredictionsRetrieved) {
            return (
                <View style={[styles.container, styles.geoContainer]}>
                    <ActivityIndicator size="large" color="#0000ff" /> 
                </View>
            )
        }
        else {
            return (
                <View style={styles.container}>
                    <View style={[{paddingTop: 10, paddingBottom: 10, flexDirection: 'row'}]}>
                        <View style={{flex: 3, paddingLeft: 10, paddingRight: 10}}>
                            <Text style={[styles.predictions_destination, styles.predictions_text]}>Here are predictions for routes near you!</Text>
                            <Text style={[styles.predictions_destination, styles.predictions_text]}>as of {formatDate(this.state.timePredictionsRetrieved)}</Text>
                        </View>
                        <TouchableOpacity style={{flex: 1, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', alignItems: 'center'}} onPress={this.updateLocation}>
                            <Icon
                                name='crosshairs'
                                type='font-awesome'
                                color='black'
                                size={34}
                            />
                            <Text style={{textAlign: 'center'}}>
                                Update Location
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        refreshControl={
                            <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                            />
                        }
                        data={this.state.predictions}
                        renderItem={({item, index}) => (
                            <View>
                                <Text style={[{padding: 10}, styles.item_text, styles.item_even]}>{item.routeId}</Text>
                                { item.closestPredictions.map( (el, index) => (
                                    <View style={{padding: 10}} key={index}>
                                        <Text style={styles.item_text}>{this.formatPrediction(el.departureTime)} toward {el.headsign}</Text>
                                        <Text>from {el.stopName}</Text>
                                    </View>
                                )) }
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            )
        }
    }
}