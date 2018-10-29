import React, { Component } from 'react';
import { FlatList, Text, View, RefreshControl } from 'react-native';

import { getData, convertDataToJson } from './Utils';
import styles from '../styles/styles';

export default class ShowPredictionsScreen extends Component {
    static navigationOptions = {
      title: 'Predictions'
    }
    state = {
      listOfAlerts: [],
      listOfTrips: [],
      listOfPredictions: [],
      timePredictionsRetrieved: undefined,
      refreshing: false,
    }
    componentDidMount() {
      // Updates the predictions every 30 seconds
      this.getPredictions();
      this.interval = setInterval( () => this.getPredictions(), 30000);
    }
    componentWillUnmount() {
      clearInterval(this.interval);
    }
    onRefresh = () => {
      this.setState({refreshing: true});
      this.getPredictions();
      // Note: getPredictions() will set refreshing=false in the state
    }
    getPredictions = () => {
      const { API_KEY } = this.props.screenProps;
      const { stopId, routeId, directionId } = this.props.navigation.state.params;
      const predictionUrl = `https://api-v3.mbta.com/predictions?api_key=${API_KEY}&filter[stop]=${stopId}&filter[route]=${routeId}&filter[direction_id]=${directionId}&include=trip,alerts`;
      getData(predictionUrl)
      .then(convertDataToJson)
      .then(this.processPredictionList)
      .then(({listOfAlerts, listOfTrips, listOfPredictions, timePredictionsRetrieved}) => this.setState({listOfAlerts, listOfTrips, listOfPredictions, timePredictionsRetrieved, refreshing: false,}));
    }
    processPredictionList = (jsonData) => {
      const listOfPredictions = [];
      const listOfAlerts = [];
      const listOfTrips = new Map();
      const timePredictionsRetrieved = new Date(Date.now());
  
      // First, pull Alerts and Trips info from the jsonData
      jsonData.included.forEach( (el) => {
        if (el.type === 'alert') {
          listOfAlerts.push({
            'shortHeader': el.attributes.short_header,
            'updatedDate': el.attributes.updated_at
          });
        }
        else if (el.type === 'trip') {
          listOfTrips.set(el.id, {
              'headsign': el.attributes.headsign
          });
        }
      });
  
      // Then, process the list of Predictions
      jsonData.data.map( (prediction) => {
        listOfPredictions.push({
          'tripId': prediction.relationships.trip.data.id,
          'departureTime': new Date(prediction.attributes.departure_time),
          'headsign': listOfTrips.get(prediction.relationships.trip.data.id).headsign
        });
      });
      // Sort predictions by departure time low to high (ASC)
      listOfPredictions.sort( (a, b) => {
        return a.departureTime - b.departureTime;
      })
  
      return {listOfAlerts, listOfTrips, listOfPredictions, timePredictionsRetrieved};
    };
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
      const { routeName, stopName, directionName } = this.props.navigation.state.params;
      return (
        <View style={styles.container}>
          <View style={[styles.rows, {paddingBottom: 20}]}>
            <Text style={[styles.predictions_destination, styles.predictions_text]}>Route {routeName}</Text>
            <Text style={[styles.predictions_destination, styles.predictions_text]}>toward {directionName}</Text>
            <Text style={[styles.predictions_destination, styles.predictions_text]}>from {stopName}</Text>
            <Text style={[styles.predictions_destination, styles.predictions_text]}>last updated {this.state.timePredictionsRetrieved && this.state.timePredictionsRetrieved.toString()}</Text>
          </View>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
            data={this.state.listOfPredictions}
            renderItem={({item, index}) => (
              <View style={[styles.rows, styles.item, index%2===0 && styles.item_even]}>
                <Text style={[styles.predictions_text, styles.predictions_minutes]}>
                  {this.formatPrediction(item.departureTime)}
                </Text>
                <Text style={[styles.predictions_text, styles.predictions_destination]}>
                  Destination: {item.headsign}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      )
    }
  }