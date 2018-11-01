import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      flex: 1,
      paddingTop: 22
    },
    geoContainer: {
      justifyContent: 'center',
      alignItems: 'center'
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