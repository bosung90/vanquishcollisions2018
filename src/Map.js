import React, { Component } from 'react'
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react'

export class MapContainer extends Component {
  state = {
    selectedPlace: {
      name: 'Vancouver',
    },
  }
  render() {
    return (
      <Map
        google={this.props.google}
        initialCenter={{
          lat: 49.2827,
          lng: -123.1207,
        }}
        zoom={14}
      >
        <Marker onClick={this.onMarkerClick} name={'Current location'} />

        <InfoWindow onClose={this.onInfoWindowClose}>
          <div>
            <h1>{this.state.selectedPlace.name}</h1>
          </div>
        </InfoWindow>
      </Map>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyA1n6oqQaguT9yY_vwi5yXnRO6XxOfaSXo',
})(MapContainer)
