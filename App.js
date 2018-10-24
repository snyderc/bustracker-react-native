import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, SectionList, Text, TextInput, View, Image, Button, Alert, ScrollView } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import { getData, convertDataToJson } from './Utils';

export class SelectRouteScreen extends Component {
  static navigationOptions = {
    title: 'Select MBTA Route',
  };
  state = {
    listOfRoutes: [],
  };
  componentDidMount() {
    const { API_KEY } = this.props.screenProps;
    const routeUrl = `https://api-v3.mbta.com/routes?api_key=${API_KEY}`;
    getData(routeUrl)
    .then(convertDataToJson)
    .then(this.processRouteList)
    .then((listOfRoutes) => this.setState({listOfRoutes}));
  }
  processRouteList = (jsonData) => {
    const listOfRoutes = [];
    jsonData.data.map( (route) => {
      listOfRoutes.push({
        'routeId': route.id,
        'routeName': `${route.attributes.short_name} - ${route.attributes.long_name}`,
      });
    });
    return listOfRoutes;
  }
  handleRouteSelect = ({routeId, routeName}) => {
    const { navigate } = this.props.navigation;
    navigate('SelectDirection', {
      routeId,
      routeName,
    });
  };
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.listOfRoutes}
          renderItem={({item, index}) => <Text style={[styles.item, styles.item_text, index%2===0 && styles.item_even]} onPress={() => this.handleRouteSelect(item)}>{item.routeName}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }
}

export class SelectDirectionScreen extends Component {
  static navigationOptions = {
    title: 'Select Direction',
  }
  state = {
    listOfDirections: [],
  }
  componentDidMount() {
    const { API_KEY } = this.props.screenProps;
    const { routeId } = this.props.navigation.state.params;
    const directionUrl = `https://api-v3.mbta.com/shapes?api_key=${API_KEY}&filter[route]=${routeId}`;
    getData(directionUrl)
    .then(convertDataToJson)
    .then(this.processDirectionList)
    .then((listOfDirections) => this.setState({listOfDirections}));
  }
  processDirectionList = (jsonData) => {
    const listOfDirections = [];
    jsonData.data.map( (direction) => {
      listOfDirections.push({
        'directionId': direction.attributes.direction_id,
        'directionName': direction.attributes.name,
      });
    });
    // Group direction names together by direction type (inbound/outbound)
    listOfDirections.sort( (a, b) => {
      return a.directionId - b.directionId;
    });
    return listOfDirections;
  }
  handleDirectionSelect = ({directionId, directionName}) => {
    const { navigate } = this.props.navigation;
    const { routeId, routeName } = this.props.navigation.state.params;
    navigate('SelectStop', {
      directionId,
      directionName,
      routeId,
      routeName,
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.listOfDirections}
          renderItem={({item, index}) => <Text style={[styles.item, styles.item_text, index%2===0 && styles.item_even]} onPress={() => this.handleDirectionSelect(item)}>{item.directionName}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }
}

export class SelectStopScreen extends Component {
  static navigationOptions = {
    title: 'Select Stop'
  };
  state = {
    listOfStops: [],
  };
  componentDidMount() {
    const { API_KEY } = this.props.screenProps;
    const { routeId, directionId } = this.props.navigation.state.params;
    const stopUrl = `https://api-v3.mbta.com/stops?api_key=${API_KEY}&filter[route]=${routeId}&filter[direction_id]=${directionId}`;
    getData(stopUrl)
    .then(convertDataToJson)
    .then(this.processStopList)
    .then((listOfStops) => this.setState({listOfStops}));
  }
  processStopList = (jsonData) => {
    const listOfStops = [];
    jsonData.data.map( (stop) => {
      listOfStops.push({
        'stopId': stop.id,
        'stopName': stop.attributes.name,
      });
    });
    return listOfStops;
  };
  handleStopSelect = ({stopId, stopName}) => {
    const { navigate } = this.props.navigation;
    const { directionId, directionName, routeId, routeName } = this.props.navigation.state.params;
    navigate('ShowPredictions', {
      stopId,
      stopName,
      directionId,
      directionName,
      routeId,
      routeName,
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.listOfStops}
          renderItem={({item, index}) => <Text style={[styles.item, styles.item_text, index%2===0 && styles.item_even]} onPress={() => this.handleStopSelect(item)}>{item.stopName}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }
}

export class ShowPredictionsScreen extends Component {
  static navigationOptions = {
    title: 'Predictions'
  }
  state = {
    listOfAlerts: [],
    listOfTrips: [],
    listOfPredictions: [],
    timePredictionsRetrieved: undefined,
  }
  componentDidMount() {
    // Updates the predictions every 30 seconds
    this.getPredictions();
    this.interval = setInterval( () => this.getPredictions(), 30000);
  }
  getPredictions = () => {
    const { API_KEY } = this.props.screenProps;
    const { stopId, routeId, directionId } = this.props.navigation.state.params;
    const predictionUrl = `https://api-v3.mbta.com/predictions?api_key=${API_KEY}&filter[stop]=${stopId}&filter[route]=${routeId}&filter[direction_id]=${directionId}&include=trip,alerts`;
    getData(predictionUrl)
    .then(convertDataToJson)
    .then(this.processPredictionList)
    .then(({listOfAlerts, listOfTrips, listOfPredictions, timePredictionsRetrieved}) => this.setState({listOfAlerts, listOfTrips, listOfPredictions, timePredictionsRetrieved}));
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

export const ManualStopSelect = createStackNavigator({
  SelectRoute: { screen: SelectRouteScreen },
  SelectDirection: { screen: SelectDirectionScreen },
  SelectStop: { screen: SelectStopScreen },
  ShowPredictions: { screen: ShowPredictionsScreen },
});

export default class App extends Component {
  state = {
    API_KEY: 'fa0eb65102574cfd90f3a4173cf518ac',
  }
  render() {
    return (
      <ManualStopSelect
        screenProps={{'API_KEY': this.state.API_KEY}}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    paddingTop: 22
  },
  rows: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    padding: 10,
    height: 80,
  },
  item_even: {
    backgroundColor: 'lightgray',
  },
  item_text: {
    fontSize: 24,
    textAlignVertical: 'center',
  },
  predictions_text: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  predictions_minutes: {
    fontSize: 24,
  },
  predictions_destination: {
    fontSize: 18,
  },
});