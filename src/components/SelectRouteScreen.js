import React, { Component } from 'react';
import { FlatList, Text, View, } from 'react-native';

import { getData, convertDataToJson } from './Utils';
import styles from '../styles/styles';

export default class SelectRouteScreen extends Component {
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