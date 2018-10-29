import { createStackNavigator } from 'react-navigation';

import SelectRouteScreen from './SelectRouteScreen';
import SelectDirectionScreen from './SelectDirectionScreen';
import SelectStopScreen from './SelectStopScreen';
import ShowPredictionsScreen from './ShowPredictionsScreen';

export default ManualStopSelectNavigator = createStackNavigator({
    SelectRoute: { screen: SelectRouteScreen },
    SelectDirection: { screen: SelectDirectionScreen },
    SelectStop: { screen: SelectStopScreen },
    ShowPredictions: { screen: ShowPredictionsScreen },
  });