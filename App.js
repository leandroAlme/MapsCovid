
import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Modal
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


export default class App extends Component {
  constructor(props) {

    super();

    this.state = {
      latitude: -23.5489,
      longitude: -46.6388,
      categoria: 'supermarket',

    }
  }

  fetchNearestPlacesFromGoogle = (lat, long, categoria) => {

    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat +',' + long + '&radius=400&type=' + categoria + ' &key=AIzaSyA-HweIlQcENxiwaI_JIcRdphLmrlHP5hA'

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {

        var places = []
        for (let googlePlace of res.results) {
          var place = {}
          var lat = googlePlace.geometry.location.lat;
          var lng = googlePlace.geometry.location.lng;
          var coordinate = {
            latitude: lat,
            longitude: lng,
          }

          place['placeTypes'] = googlePlace.types
          place['coordinate'] = coordinate
          place['placeId'] = googlePlace.place_id
          place['placeName'] = googlePlace.name
 
          places.push(place);
          console.log(place['placeId'] = googlePlace.place_id)

        }

      })
      .catch(error => {
        console.log(error);
      });
  }


  dadosCovid = () => {
    const url = 'https://maps-covid-api.herokuapp.com/api/buscaDadosHospitaisRaio/-23.5489/-46.6388/1'

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {

        console.log(res)

      })
      .catch(error => {
        console.log(error);
      });
  }

  popularTime = () => {
    
    const url = 'https://covidmapsapi.herokuapp.com/id?place_id=ChIJA3-tz2X4zpQRR7Kaxnc6qG8'

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {
        var place = {}
        var places = res
        // This Array WIll contain locations received from google
        // for (let googlePlace of res.results) {
        //   var place = {}
        //   var lat = googlePlace.geometry.location.lat;
        //   var lng = googlePlace.geometry.location.lng;
        //   var coordinate = {
        //     latitude: lat,
        //     longitude: lng,
        //   }

        place['current_popularity'] = places.current_popularity
        console.log(place['current_popularity'])
        // place['coordinate'] = coordinate
        // place['placeId'] = googlePlace.place_id
        // place['placeName'] = googlePlace.name

        // places.push(place);
        // console.log(place['placeId'] = googlePlace.place_id)
        // alert(place['placeId'] = googlePlace.place_id)

        // }

        // Do your work here with places Array
      })
      .catch(error => {
        console.log(error);
      });

  }

  // componentDidMount(){
  //   this.fetchNearestPlacesFromGoogle()
  // }

  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal()
      .then((place) => {
        var objeto = place

        var lat = objeto['location'].latitude;
        var long= objeto['location'].longitude;
        var categoria = 'supermarket'

        this.setState({ latitude: lat, longitude: long });
        fetchNearestPlacesFromGoogle(lat, long, categoria)


        console.log(place)
        for (let googlePlace of place.results) {
          var place = {}
          var lat = googlePlace.geometry.location.lat;
          var lng = googlePlace.geometry.location.lng;
          var coordinate = {
            latitude: lat,
            longitude: lng,
          }

          alert()
        }
        // place represents user's selection from the
        // suggestions and it is a simplified Google Place object.
      })
      .catch(error => console.log(error.message));  // error is a Javascript Error object
  }


  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            width: '100%',
            height: '8%',
            marginTop: '10%',
            borderRadius: 10,
            backgroundColor: '#fff',
            alignSelf: 'center',
            justifyContent: 'center',
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            shadowColor: "#000",
            elevation: 3,
          }}
          onPress={() => this.openSearchModal()}
        >
          <Text style={{ textAlign: 'center', fontSize: 22, color: '#A9a9a9' }}>Procurar um local</Text>
        </TouchableOpacity>

        <MapView style={styles.mapStyle} loadingEnabled={true}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}>
          <Marker coordinate={{ latitude: this.state.latitude, longitude: this.state.longitude }} />

          <Marker coordinate={{ latitude: -23.54716956, longitude: -46.63951904 }}
            image={require('../MapsCovid19/img/hospital.png')}
          />

          <Marker coordinate={{ latitude: -23.54675647, longitude: -46.6402486 }}
            image={require('../MapsCovid19/img/hospital.png')}
          />

          <Marker coordinate={{ latitude: -23.54684499, longitude: -46.63847297 }}
            image={require('../MapsCovid19/img/placeholder-point.png')}
          />

          <Marker coordinate={{ latitude: -23.54692368, longitude: -46.63867146 }}
            image={require('../MapsCovid19/img/placeholder-point.png')}
          />

          <Marker coordinate={{ latitude: -23.54719415, longitude: -46.63881093 }}
            image={require('../MapsCovid19/img/placeholder-point.png')}
          />


        </MapView>

      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: '100%'
  },
  input: {
    fontSize: 19,
    color: '#0b1634',
    marginLeft: 5,
    width: '90%',
    marginTop: 80,
    borderColor: '#bdbebd'
    // estilo para manter a distancia
  },
});
