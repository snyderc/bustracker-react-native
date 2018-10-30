import React from 'react';
import { Text, View, FlatList, ActivityIndicator } from 'react-native';

import { getData, convertDataToJson } from './Utils';
import styles from '../styles/styles';

export default class GeoPredictionsScreen extends React.Component {
    state = {
        predictions: [],
        timePredictionsRetrieved: undefined,
    }
    componentDidMount() {
        navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
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
        const radius = 0.007    // 0.007 = approx 1/2 mile
        const routeUrl = `https://api-v3.mbta.com/predictions?api_key=${this.props.API_KEY}&filter[latitude]=${userLat}&filter[longitude]=${userLong}&filter[radius]=${radius}&include=stop,route,trip`
        console.log(routeUrl);
        getData(routeUrl)
        .then(convertDataToJson)
        .then((jsonData) => {
            return this.processGeolocatedPredictionsList(jsonData, userLat, userLong)
        })
        .then((data) => {
            this.setState({
                predictions: data,
                timePredictionsRetrieved: new Date(Date.now())
            })
        })
    }
    geoError = (err) => {
        console.log(err);
    }
    formatPrediction = (departureTime) => {
        console.log(departureTime, this.state.timePredictionsRetrieved);
        const minutesToDeparture = Math.floor((departureTime - this.state.timePredictionsRetrieved) / 1000 / 60);
        if (minutesToDeparture > 0) {
          return `${minutesToDeparture} min`;
        }
        else {
          return 'Arriving';
        }
      }
    render() {
        console.log(this.state.timePredictionsRetrieved);
        return (
            <View style={styles.container}>
                { !this.state.timePredictionsRetrieved && <ActivityIndicator size="large" color="#0000ff" /> }
                <FlatList
                    data={this.state.predictions}
                    renderItem={({item, index}) => (
                        <View>
                            <Text style={[styles.item, styles.item_text]}>{item.routeId}</Text>
                            { item.closestPredictions.map( (el, index) => (
                                <View key={index}>
                                    <Text>{this.formatPrediction(el.departureTime)} toward {el.headsign} from {el.stopName}</Text>
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