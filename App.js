import React, { Component } from 'react';

import ManualStopSelectNavigator from './src/components/ManualStopSelectNavigator';

export default class App extends Component {
  state = {
    API_KEY: 'fa0eb65102574cfd90f3a4173cf518ac',
  }
  render() {
    return (
      <ManualStopSelectNavigator
        screenProps={{'API_KEY': this.state.API_KEY}}
      />
    )
  }
}