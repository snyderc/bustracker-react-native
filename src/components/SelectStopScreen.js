import React, { Component } from 'react';
import { FlatList, Text, View } from 'react-native';

import { getData, convertDataToJson } from './Utils';
import styles from '../styles/styles';

export default class SelectStopScreen extends Component {
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