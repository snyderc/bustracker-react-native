import React, { Component } from 'react';
import { FlatList, Text, View, } from 'react-native';

import { getData, convertDataToJson } from './Utils';
import styles from '../styles/styles';

const subwayRoutes = [
  {
    routeId: 'Red',
    routeName: 'Red Line'
  },
  {
    routeId: 'Green-B,Green-C,Green-D,Green-E',
    routeName: 'Green Line'
  },
  {
    routeId: 'Orange',
    routeName: 'Orange Line'
  },
  {
    routeId: 'Blue',
    routeName: 'Blue Line'
  },
  {
    routeId: '741,742,743,751,749',
    routeName: 'Silver Line'
  },
  {
    routeId: 'Mattapan',
    routeName: 'Mattapan Trolley'
  }
]

export default class SelectRouteScreen extends Component {
  static navigationOptions = {
    title: 'Select MBTA Route',
  };
  state = {
    listOfRoutes: [],
    routeListFilter: undefined
  };
  componentDidMount() {
    this.setInitialRoutesList();
  }
  setInitialRoutesList = () => {
    const { API_KEY, routeType } = this.props.screenProps;
    if (routeType === 2 || routeType === 3 || routeType === 4) {
      const routeUrl = `https://api-v3.mbta.com/routes?api_key=${API_KEY}&filter[type]=${routeType}`;
      getData(routeUrl)
      .then(convertDataToJson)
      .then(this.processRouteList)
      .then((listOfRoutes) => this.setState({listOfRoutes}));
    }
    else if (routeType === '0,1') {
      this.setState( {
        listOfRoutes: subwayRoutes,
        routeListFilter: undefined
      })
    }
  }
  // Add to the subway Silver Line routes list a "Show All Subway Lines" entry
  addSilverLineBackButton = (data) => {
    data.unshift({
      routeId: 'SilverLineBack',
      routeName: 'Back to All Subway Lines'
    });
    return data;
  }
  // When user selects "Silver Line" under subway, get list of Silver Line routes and display to user
  filterSilverLine = () => {
    const { API_KEY } = this.props.screenProps;
    const routeUrl = `https://api-v3.mbta.com/routes?api_key=${API_KEY}&filter[id]=741,742,743,751,749`;
    getData(routeUrl)
    .then(convertDataToJson)
    .then(this.processRouteList)
    .then(this.addSilverLineBackButton)
    .then((listOfRoutes) => this.setState(
      {
        listOfRoutes,
        routeListFilter: 'Silver'
      }
    ));
  }
  processRouteList = (jsonData) => {
    const listOfRoutes = [];
    jsonData.data.map( (route) => {
      listOfRoutes.push({
        'routeId': route.id,
        'routeName': `${route.attributes.short_name ? `${route.attributes.short_name} - ` : '' }${route.attributes.long_name}`,
      });
    });
    return listOfRoutes;
  }
  handleRouteSelect = ({routeId, routeName}) => {
    const { navigate } = this.props.navigation;
    const { routeType } = this.props.screenProps;
    // Handles special case where user is on subway Silver Line page and wants to display all subway lines
    if (routeId === 'SilverLineBack') {
      this.setInitialRoutesList();
    }
    // Handles selection of commuter rail (2), bus (3), ferry (4), or Silver Line after selecting an individual route
    else if (routeType === 2 || routeType === 3 || routeType === 4 || this.state.routeListFilter === 'Silver') {
      navigate('SelectDirection', {
        routeId,
        routeName,
      });
    }
    // Handle selection of a subway route
    else if (routeType === '0,1') {
      // Handle selection of Silver Line category
      if (routeName === 'Silver Line') {
        this.filterSilverLine();
      }
      // Handle selection of a different subway line
      else {
        navigate('SelectStop', {
          routeId,
          routeName,
          directionId: -1
        });
      }
    }
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