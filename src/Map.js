import React, { Component } from 'react'
import { Map, Polyline, GoogleApiWrapper } from 'google-maps-react'
import polyline from '@mapbox/polyline'

export class MapContainer extends Component {
  directionsService = new this.props.google.maps.DirectionsService()
  geocoder = new this.props.google.maps.Geocoder()
  state = {
    selectedPlace: {
      name: 'Vancouver',
    },
    polyline: [
      { lat: 49.2734, lng: -123.1038 },
      { lat: 49.2742, lng: -123.1547 },
    ],
    bounds: null,
  }
  getLatLng = async address => {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location
          resolve({ lat: location.lat(), lng: location.lng() })
        } else {
          reject(
            'Geocode was not successful for the following reason: ' + status
          )
        }
      })
    })
  }
  drawPolyline = async () => {
    const locationALatLng = await this.getLatLng(this.locAInput.value)
    const locationBLatLng = await this.getLatLng(this.locBInput.value)
    var locationA = new this.props.google.maps.LatLng(
      locationALatLng.lat,
      locationALatLng.lng
    )
    var locationB = new this.props.google.maps.LatLng(
      locationBLatLng.lat,
      locationBLatLng.lng
    )

    const request = {
      origin: locationA,
      destination: locationB,
      travelMode: this.props.google.maps.TravelMode['BICYCLING'],
    }
    this.directionsService.route(request, (response, status) => {
      if (status === 'OK') {
        // Calculate bounds
        let points = [
          {
            lat: response.routes[0].bounds.f.b,
            lng: response.routes[0].bounds.b.b,
          },
          {
            lat: response.routes[0].bounds.f.f,
            lng: response.routes[0].bounds.b.f,
          },
        ]
        let bounds = new this.props.google.maps.LatLngBounds()
        for (let i = 0; i < points.length; i++) {
          bounds.extend(points[i])
        }
        this.setState({ bounds })
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
        <input
          defaultValue={'Science World'}
          style={{ height: 30, margin: 10 }}
          placeholder={'From'}
          ref={r => (this.locAInput = r)}
        />
        <input
          defaultValue={'Kitsilano Beach'}
          style={{ height: 30, margin: 10 }}
          placeholder={'To'}
          ref={r => (this.locBInput = r)}
        />
        <button onClick={this.drawPolyline}>DRAW LINE</button>
        <Map
          bounds={this.state.bounds}
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
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyA1n6oqQaguT9yY_vwi5yXnRO6XxOfaSXo',
})(MapContainer)
