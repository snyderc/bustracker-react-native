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