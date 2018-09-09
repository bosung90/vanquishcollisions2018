import React, { Component } from 'react'
import { Map, Polyline, GoogleApiWrapper } from 'google-maps-react'
import polyline from '@mapbox/polyline'

export class MapContainer extends Component {
  directionsService = new this.props.google.maps.DirectionsService()
  state = {
    selectedPlace: {
      name: 'Vancouver',
    },
    polyline: [
      { lat: 49.2734, lng: -123.1038 },
      { lat: 49.2742, lng: -123.1547 },
    ],
  }
  drawPolyline = () => {
    var scienceWorld = new this.props.google.maps.LatLng(49.2734, -123.1038)
    var kitsilanoBeach = new this.props.google.maps.LatLng(49.2742, -123.1547)
    const request = {
      origin: scienceWorld,
      destination: kitsilanoBeach,
      travelMode: this.props.google.maps.TravelMode['BICYCLING'],
    }
    this.directionsService.route(request, (response, status) => {
      if (status === 'OK') {
        const polyArrays = polyline.decode(response.routes[0].overview_polyline)
        this.setState({
          polyline: polyArrays.map(val => {
            return { lat: val[0], lng: val[1] }
          }),
        })
      }
    })
  }
  render() {
    return (
      <div>
        <button onClick={this.drawPolyline}>DRAW LINE</button>
        <Map
          google={this.props.google}
          initialCenter={{
            lat: 49.2827,
            lng: -123.1207,
          }}
          zoom={14}
        >
          <Polyline
            path={this.state.polyline}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={2}
          />

          {/* <Marker onClick={this.onMarkerClick} name={'Current location'} />

        <InfoWindow onClose={this.onInfoWindowClose}>
          <div>
            <h1>{this.state.selectedPlace.name}</h1>
          </div>
        </InfoWindow> */}
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyA1n6oqQaguT9yY_vwi5yXnRO6XxOfaSXo',
})(MapContainer)
