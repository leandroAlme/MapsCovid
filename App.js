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
  Modal,
  ActivityIndicator
} from 'react-native';

// bibliotecas importadas
import MapView, { Marker } from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';
import Icon from 'react-native-vector-icons/AntDesign';

export default class App extends Component {
  constructor(props) {

    super();

    this.state = {
      visible: false,
      visible2: false,

      latitude: -23.5520,
      longitude: -46.6335,

      latitude1: 0,
      longitude2: 0,

      estabelecimentosPerto: [],
      hospitais: [],

      mediaDePublico: '',
      mediaDePublicoPesquisada: 0,
      nomeDoEstabelecimento: 'São Paulo',
      nomeDoEstabelecimentoPesquisada: '',
      pontoPesquisado: false,
      nomeDoHospital: '',

      casosConfirmados: '',
      curasConfirmadas: '',
      mortesConfirmadas: '',
      casosSuspeitos: '',
      idLocalPesquisado: ''
    }
  }

  // função para consutar estabelecimentos proximos da mesma categoria
  fetchNearestPlacesFromGoogle = (lati, longi, categoria) => {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lati + ',' + longi + '&radius=500&type=' + categoria + '&key=AIzaSyA-HweIlQcENxiwaI_JIcRdphLmrlHP5hA'

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {

        let dados = []

        for (let googlePlace of res.results) {

          var lat = googlePlace.geometry.location.lat;
          var lng = googlePlace.geometry.location.lng;

          if (lat != lati) {
            var dadosApi = { coordenadas: { latitude: lat, longitude: lng }, id: googlePlace.place_id, nome: googlePlace.name }
            dados.push(dadosApi)
          }
          //googlePlace.types
        }

        this.setState({ estabelecimentosPerto: dados });
      })
      .catch(error => {
        console.log(error);
      });


  }

  // função consutar hospitais proximos e informações sobre o covid-19 neles
  dadosCovid = (lat, long) => {
    const url = 'https://maps-covid-api.herokuapp.com/api/buscaDadosHospitaisRaio' + '/' + lat + '/' + long + '/' + '10'

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {

        let dados = []
        for (let caminho of res) {
          var nome = caminho.DADOS_HOSP.NOME;
          var casosConfirmados = caminho.CASOS_CONF;
          var curasConfirmadas = caminho.CURAS_CONF;
          var mortesConfirmadas = caminho.MORTES_CONF;
          var casosSuspeitos = caminho.CASOS_SUSP

          var lat = caminho.DADOS_HOSP.LOCAL.LAT;
          var lng = caminho.DADOS_HOSP.LOCAL.LONG;
          let dadosApi = {
            coordenadas: { latitude: lat, longitude: lng },
            nome: nome, casosConfirmados: casosConfirmados, curasConfirmadas: curasConfirmadas,
            mortesConfirmadas: mortesConfirmadas, casosSuspeitos: casosSuspeitos
          }
          dados.push(dadosApi)
        }
        this.setState({ hospitais: dados });
      })
      .catch(error => {
        console.log(error);
      });

  }

  // função para consutar a media de publico semanal atual nos estabelecimentos proximos e no estabelecimento buscado
  popularTime = (id) => {

    const url = 'https://covidmapsapi.herokuapp.com/id?place_id=' + id

    fetch(url)
      .then(res => {
        return res.json()
      })
      .then(res => {
        var numero;
        var estabelecimento = res

        numero = estabelecimento.current_popularity

        if (numero == 'undefined') {
          this.setState({ mediaDePublico: 'Esse estabelecimento não possui a metrica de contagem no momento' });
        } else {
          this.setState({ mediaDePublico: numero + '% Ocupado' });
        }
      })
      .catch(error => {
        console.log(error);
      });

  }

  //função para abrir modal de pesquisa do google com autocomplete
  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal({ useOverlay: true })
      .then((place) => {
        var objeto = place
        console.log(objeto, objeto.name)
        var lat = objeto['location'].latitude;
        var long = objeto['location'].longitude;
        var id = objeto.placeID
        var nome = objeto.name
        var categoria = objeto.types

        const url = 'https://covidmapsapi.herokuapp.com/id?place_id=' + id

        fetch(url)
          .then(res => {
            return res.json()
          })
          .then(res => {
            var numero;
            var estabelecimento = res

            numero = estabelecimento.current_popularity

            if (numero == 'undefined') {
              this.setState({ mediaDePublicoPesquisada: 'Esse estabelecimento não possui a metrica de contagem no momento' });
            } else {
              this.setState({ mediaDePublicoPesquisada: numero + '% Ocupado' });
            }
          })
          .catch(error => {
            console.log(error);
          });

        this.popularTime(this.state.idLocalPesquisado)
        this.setState({ latitude: lat, longitude: long, latitude1: lat, longitude2: long, idLocalPesquisado: id, nomeDoEstabelecimentoPesquisada: nome });
        this.fetchNearestPlacesFromGoogle(lat, long, categoria[0])
        this.dadosCovid(lat, long)
      })
      .catch(error => console.log(error.message));

  }

  // função que retorna a vil com informações sobre o hospital clicado
  modalHospitais = () => {
    return (
      <View>
        <Text style={styles.calloutTitle}>{this.state.nomeDoHospital}</Text>
        <Text style={styles.callouttexto}>Casos Suspeitos: {this.state.casosSuspeitos}</Text>
        <Text style={styles.callouttexto}>Casos confirmados: {this.state.casosConfirmados}</Text>
        <Text style={styles.callouttexto}>Curas confirmadas: {this.state.curasConfirmadas}</Text>
        <Text style={styles.callouttexto}>Mortes confirmadas: {this.state.mortesConfirmadas}</Text>
      </View>
    )
  }

  // função que retorna a view com informações sobre o estabelecimento clicado
  modalMediaDePublicos = () => {
    if (this.state.mediaDePublico === '') {
      return (
        <ActivityIndicator size={80} color="#5371FF" />
      )
    } else if (this.state.pontoPesquisado === true) {
        return (
          <View>
            <Text style={styles.calloutTitle}>{this.state.nomeDoEstabelecimentoPesquisada}</Text>
            <Text style={styles.calloutDescription}>Porcentagem em tempo real baseado em movimento semanal</Text>
            <Text style={styles.callouttexto}>{this.state.mediaDePublico}</Text>
          </View>
        );
      } else {
        return (
          <View>
            <Text style={styles.calloutTitle}>{this.state.nomeDoEstabelecimento}</Text>
            <Text style={styles.calloutDescription}>Porcentagem em tempo real baseado em movimento semanal</Text>
            <Text style={styles.callouttexto}>{this.state.mediaDePublico}</Text>
          </View>
        );
      }
  }

  // função que renderiza as marcações no mapa relacionado aos hospitais
  mapMarkers2 = () => {
    return this.state.hospitais.map((item, index) => (
      <Marker key={index} coordinate={item.coordenadas} onPress={() => {
        this.setState({
          visible2: true, nomeDoHospital: item.nome,
          casosConfirmados: item.casosConfirmados,
          curasConfirmadas: item.curasConfirmadas,
          mortesConfirmadas: item.mortesConfirmadas,
          casosSuspeitos: item.casosSuspeitos
        })
      }}
        image={require('../MapsCovid19/img/hospital.png')} >
      </Marker>
    ))
  }

  // função que renderiza as marcações no mapa relacionado aos estabelecimentos
  mapMarkers = () => {
    return this.state.estabelecimentosPerto.map((item, index) => (
      <Marker key={index} title={item.nome} onPress={() => { this.setState({ visible: true, nomeDoEstabelecimento: item.nome }), this.popularTime(item.id) }} coordinate={item.coordenadas}
        image={require('../MapsCovid19/img/placeholder-point.png')}>
      </Marker>
    ))
  }


  render() {
    return (

      <View style={styles.container}>
        <TouchableOpacity
          style={{
            width: '100%',
            height: '8%',
            marginTop: '15.5%',
            borderRadius: 0,
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
          <View style={{ flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#A9a9a9', fontWeight: '600', fontSize: 19, marginLeft: 5, }}>Buscar um local...</Text>
            <Icon name={'search1'} size={25} style={{ color: '#A9a9a9', marginLeft: '38%' }} />
          </View>

        </TouchableOpacity>

        <MapView
          style={styles.mapStyle}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}>
          <Marker coordinate={{ latitude: this.state.latitude1, longitude: this.state.longitude2 }} onPress={() => { this.setState({ visible: true, pontoPesquisado: true }), this.popularTime(this.state.idLocalPesquisado) }}
            image={require('../MapsCovid19/img/placeholder1.png')} />

          {this.mapMarkers()}
          {this.mapMarkers2()}
        </MapView>

        <Modal style={{ flex: 1 }} onRequestClose={() => this.setState({ visible: false, mediaDePublico: '', nomeDoEstabelecimento: '' })} visible={this.state.visible} animationType="fade" transparent={true}>
          <View style={styles.fundoModal}>
            <View style={styles.modal}>
              <Icon name={'close'} size={29} style={{ color: '#0b1634', alignSelf: 'flex-end', }} onPress={() => {
                this.setState({ visible: false, mediaDePublico: '', pontoPesquisado: false });
              }} />
              {this.modalMediaDePublicos()}
            </View>
          </View>
        </Modal>

        <Modal style={{ flex: 1 }} onRequestClose={() => this.setState({ visible2: false })} visible={this.state.visible2} animationType="fade" transparent={true}>
          <View style={styles.fundoModal}>
            <View style={styles.modal}>
              <Icon name={'close'} size={29} style={{ color: '#0b1634', alignSelf: 'flex-end', }} onPress={() => {
                this.setState({ visible2: false });
              }} />
              {this.modalHospitais()}
            </View>
          </View>
        </Modal>
      </View>
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
  calloutTitle: {
    fontSize: 15,
    marginBottom: 5,
    color: '#5371FF',
    fontWeight: "bold",
    alignSelf: 'center'
  },
  calloutDescription: {
    fontSize: 14,

  },
  callouttexto: {
    fontSize: 17,
    marginBottom: 5,
    fontWeight: "bold",
    alignSelf: 'center',

  },
  fundoModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)'
  },

  modal: {
    margin: 40,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
});


