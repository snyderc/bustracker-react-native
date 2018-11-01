import React, { Component } from 'react';
import { FlatList, Text, View } from 'react-native';

import { getData, convertDataToJson } from './Utils';
import styles from '../styles/styles';

export default class SelectDirectionScreen extends Component {
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
      // Filter out duplicate direction names for a given ID
      const directions = jsonData.data.map( (direction) => {
        return {
          'directionId': direction.attributes.direction_id,
          'directionName': direction.attributes.name,
          'directionConcat': `${direction.attributes.direction_id} ${direction.attributes.name}`
        };
      }).filter( (item, index, array) => {
        return index === array.findIndex( (el) => {
          return el.directionConcat === item.directionConcat;
        });
      });
      // Separate location names into Inbound or Outbound
      const mapOfDirections = new Map();
      directions.map( (el) => {
        if (mapOfDirections.has(el.directionId)) {
          mapOfDirections.set(el.directionId, `${mapOfDirections.get(el.directionId)} or ${el.directionName}`);
        }
        else {
          mapOfDirections.set(el.directionId, el.directionName);
        }
      });
      console.log(mapOfDirections);
      // Turn the map into an array of objects that will be displayed by React
      const listOfDirections = [];
      for (let [key, value] of mapOfDirections) {
        listOfDirections.push({
          'directionId': key,
          'directionName': value
        })
      }
      // Sort so that direction 0 comes before direction 1 for consistency
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
            renderItem={({item, index}) => <Text style={[{padding: 10}, styles.item_text, index%2===0 && styles.item_even]} onPress={() => this.handleDirectionSelect(item)}>{item.directionName}</Text>}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      )
    }
  }