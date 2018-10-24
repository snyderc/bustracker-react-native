// export class HomeScreen extends React.Component {
//   static navigationOptions = {
//     title: 'Welcome'
//   };
//   render() {
//     const { navigate } = this.props.navigation;
//     return (
//       <View>
//         <Button
//           title="Go to Jane's profile"
//           onPress={() =>
//             navigate('Profile', { name: 'Jane' })
//           }
//         />
//       </View>
//     );
//   }
// }

// export class ProfileScreen extends React.Component {
//   static navigationOptions = {
//     title: 'Profile'
//   };
//   render() {
//     const { navigate, state } = this.props.navigation;
//     return (
//       <View>
//         <Text>This is { state.params.name }'s Profile</Text>
//         <Button
//           title="Go home"
//           onPress={() =>
//             navigate('Home')
//           }
//         />
//       </View>
//     );
//   }
// }

// export default App = createStackNavigator({
//   Home: { screen: HomeScreen },
//   Profile: { screen: ProfileScreen }
// });

// ************************

// export class Appa extends React.Component {
//   render() {
//     return (
//       <Movies />
//     )
//   }
// }

// export class Movies extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isLoading: true
//     }
//   }

//   componentDidMount() {
//     return fetch('https://facebook.github.io/react-native/movies.json')
//       .then( (response) => response.json() )
//       .then( (responseJson) => {
//         this.setState({
//           isLoading: false,
//           dataSource: responseJson.movies
//         })
//       })
//       .catch( (error) => {
//         console.error(error);
//       });
//   }

//   render() {
//     if (this.state.isLoading) {
//       return(
//         <View style={{flex: 1, padding: 20}}>
//           <ActivityIndicator />
//         </View>
//       )
//     }
//     else {
//       return(
//         <View style={{flex: 1, paddingTop: 20}}>
//           <FlatList
//             data={this.state.dataSource}
//             renderItem={ ({item}) => <Text>{item.title}, {item.releaseYear}</Text>}
//             keyExtractor={ ({id}, index) => id}
//           />
//         </View>
//       )
//     }
//   }

// }

// export class Apple extends React.Component {
//   render() {
//     return (
//       <ScrollView style={styles.container}>
//         <Text>Hello World!</Text>
//         <Bananas />
//         <Greeting name='Rexxar' />
//         <PizzaTranslator />
//         <Button
//           onPress={() => {
//             Alert.alert('You tapped the button!');
//           }}
//           color="#BBBBBB"
//           title="Press Me"
//         />
//         <Text style={{fontSize:96}}>Scroll me plzzzzzzzzzz</Text>
//       </ScrollView>
//     );
//   }
// }

// export class PizzaTranslator extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       text: ''
//     };
//   }

//   render() {
//     return (
//       <View style={{padding: 10}}>
//         <TextInput
//           style={{height: 40}}
//           placeholder="Type here to translate!"
//           onChangeText={(text) => this.setState({text})}
//         />
//         <Text style={{padding: 10, fontSize: 42}}>
//           {this.state.text.split(' ').map((word) => word && '🍕').join(' ')}
//         </Text>
//       </View>
//     )
//   }
// }

// export class MyList extends React.Component {
//   render() {
//     return (
//       <View style={styles.container}>
//         <FlatList
//           data={[
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//             {key: 'First'},
//             {key: 'Second'},
//             {key: 'Third'},
//           ]}
//           renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
//         />
//       </View>
//     )
//   }
// }

// export class MySectionList extends React.Component {
//   render() {
//     return (
//       <SectionList
//         sections={
//           [
//             {title: 'D', data: ['Devin']},
//             {title: 'J', data: ['Jackson', 'James', 'Jillian']}
//           ]
//         }
//         renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
//         renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
//         keyExtractor={(item, index) => index}
//       />
//     )
//   }
// }

// export class Bananas extends React.Component {
//   render() {
//     let pic = {
//       uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
//     };
//     return (
//       <Image source={pic} style={{width: 193, height: 110}}/>
//     );
//   }
// }

// export class Greeting extends React.Component {
//   render() {
//     return (
//       <Text>Hello {this.props.name}!</Text>
//     );
//   }
// }



// sectionHeader: {
//   paddingTop: 2,
//   paddingLeft: 10,
//   paddingRight: 10,
//   paddingBottom: 2,
//   fontSize: 14,
//   fontWeight: 'bold',
//   backgroundColor: 'rgba(247, 247, 247, 1.0)',
// }