import React, { Component } from 'react'
import { Map, Polyline, GoogleApiWrapper } from 'google-maps-react'
import polyline from '@mapbox/polyline'
import scoreDirections, { getPaths } from './computation'
import Legend from './Legend'

export class MapContainer extends Component {
  directionsService = new this.props.google.maps.DirectionsService()
  geocoder = new this.props.google.maps.Geocoder()
  state = {
    selectedPlace: {
      name: 'Vancouver',
    },
    // Overview
    polyline: [
      { lat: 49.2734, lng: -123.1038 },
      { lat: 49.2742, lng: -123.1547 },
    ],
    // scoredPolylines
    scoredPolylines: [],
    bikeLanesPolylines: [],
    bounds: null,
  }
  componentDidMount() {
    const paths = getPaths()
    if (paths) {
      const bikeLanesPolylines = paths.map(bikeLanePath => {
        return {
          polyline: bikeLanePath.map(val => {
            return { lat: val.latitude, lng: val.longitude }
          }),
          type: bikeLanePath.length > 0 && bikeLanePath[0].STREET_TYP,
        }
      })
      this.setState({ bikeLanesPolylines })
    }
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
        // change response to add score
        let scoredDirections = scoreDirections(response)

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

        // for (let route of response.routes) {
        //   for (let leg of route.legs) {
        //     const scoredPolylines = []
        //     for (let step of leg.steps) {
        //       const stepPoints = polyline.decode(step.polyline.points)
        //       const score = step.score
        //       // const path = step.path
        //       scoredPolylines.push({
        //         polyline: stepPoints.map(val => {
        //           return { lat: val[0], lng: val[1] }
        //         }),
        //         score,
        //       })
        //     }
        //     this.setState({ scoredPolylines })
        //   }
        // }

        const scoredPolylines = []
        for (let element of scoredDirections) {
          scoredPolylines.push({
            polyline: [
              { lat: element.start_latitude, lng: element.start_longitude },
              { lat: element.end_latitude, lng: element.end_longitude },
            ],
            score: element.score,
          })
        }
        this.setState({ scoredPolylines })
        // console.log(scoredDirections)

        // const polyArrays = polyline.decode(response.routes[0].overview_polyline)
        // this.setState({
        //   polyline: polyArrays.map(val => {
        //     return { lat: val[0], lng: val[1] }
        //   }),
        // })
      }
    })
  }
  render() {
    return (
      <div
        style={{
          ...styles.fill,
          flexDirection: 'column',
          height: '85vh',
        }}
      >
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
        </div>
        <div style={styles.fill}>
          <Legend />
          <div
            style={{
              ...styles.fill,
              position: 'relative',
            }}
          >
            <Map
              style={{
                ...styles.fill,
                height: '100%',
              }}
              bounds={this.state.bounds}
              google={this.props.google}
              initialCenter={{
                lat: 49.257,
                lng: -123.1207,
              }}
              zoom={13}
            >
              {/* <Polyline
            path={this.state.polyline}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={2}
          /> */}
              {this.state.scoredPolylines.map((val, index) => {
                let color = 'Red'
                switch (val.score) {
                  case 4:
                    color = 'Green' // Protected bike lanes
                    break
                  case 3:
                    color = 'Olive' // Local street
                    break
                  case 2:
                    color = 'Yellow' // Painted lanes
                    break
                  case 1:
                    color = 'Orange' // Shared lanes
                    break
                  default:
                    color = 'Red'
                }

                return (
                  <Polyline
                    key={index}
                    path={val.polyline}
                    // strokeColor={`rgba(${(1 - val.score) * 255},${val.score *
                    //   255}, 0, 1`}
                    strokeColor={color}
                    strokeOpacity={0.8}
                    strokeWeight={4}
                  />
                )
              })}
              {this.state.bikeLanesPolylines.map((val, index) => {
                return (
                  <Polyline
                    key={index}
                    path={val.polyline}
                    strokeColor={`#666`}
                    strokeOpacity={0.4}
                    strokeWeight={1.5}
                  />
                )
              })}
            </Map>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  fill: {
    display: 'flex',
    flex: 1,
  },
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyA1n6oqQaguT9yY_vwi5yXnRO6XxOfaSXo',
})(MapContainer)
