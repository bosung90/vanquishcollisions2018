import React, { Component } from 'react'
import { Map, Marker, Polyline, GoogleApiWrapper } from 'google-maps-react'
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
    drawBikelanes: true,
    bounds: null,
    originMarkerLatLng: null,
    destMarkerLatLng: null,
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

    this.setState({
      originMarkerLatLng: locationALatLng,
      destMarkerLatLng: locationBLatLng,
    })

    this.drawPolyLineWithLatLng(locationALatLng, locationBLatLng)
  }
  drawPolyLineWithLatLng = (locationALatLng, locationBLatLng) => {
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
  renderScore = () => {
    let totalScore = 0
    let scoreCount = 0
    for (let val of this.state.scoredPolylines) {
      totalScore += val.score
      scoreCount++
    }

    if (scoreCount <= 0) return null

    const avgScore = (totalScore / scoreCount).toFixed(1)

    // red 0-1 ,oragne 1 to 1.5, yellow 1.5 to 2.5, olive 2.5 to 3.5, green >=3.5

    let color = 'red'
    if (avgScore >= 3.5) {
      color = 'green'
    } else if (avgScore >= 2.5) {
      color = 'olive'
    } else if (avgScore >= 1.5) {
      color = 'yellow'
    } else if (avgScore >= 1) {
      color = 'orange'
    }

    return (
      <div
        style={{
          width: 100,
          height: 100,
          backgroundColor: color,
          borderRadius: 50,
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          fontSize: 23,
          marginBottom: 30,
        }}
      >
        Score
        <br />
        {avgScore}
      </div>
    )
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
          From:
          <input
            defaultValue={'Science World'}
            style={{ height: 30, margin: 10, paddingLeft: 10 }}
            placeholder={'From'}
            ref={r => (this.locAInput = r)}
          />
          To:
          <input
            defaultValue={'Kitsilano Beach'}
            style={{ height: 30, margin: 10, paddingLeft: 10 }}
            placeholder={'To'}
            ref={r => (this.locBInput = r)}
          />
          <button onClick={this.drawPolyline}>GET DIRECTIONS</button>
        </div>
        <div style={styles.fill}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {this.renderScore()}
            <Legend />
            <div
              style={{ display: 'flex', flexDirection: 'row', marginLeft: 10 }}
            >
              <input
                id="checkboxInput"
                name="checkboxInput"
                type="checkbox"
                onChange={event => {
                  this.setState({ drawBikelanes: event.target.checked })
                }}
                checked={this.state.drawBikelanes}
              />
              <label style={{ marginLeft: 10 }} htmlFor="checkboxInput">
                Show All Routes
              </label>
            </div>
          </div>

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
              onClick={this.onMapClicked}
            >
              {/* <Polyline
            path={this.state.polyline}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={2}
          /> */}
              {!!this.state.originMarkerLatLng && (
                <Marker
                  name={'Origin'}
                  position={this.state.originMarkerLatLng}
                  onClick={this.onOriginMarkerClick}
                />
              )}
              {!!this.state.destMarkerLatLng && (
                <Marker
                  name={'Destination'}
                  position={this.state.destMarkerLatLng}
                  onClick={this.onDestMarkerClick}
                />
              )}
              {this.state.drawBikelanes
                ? this.state.bikeLanesPolylines.map((val, index) => {
                    return (
                      <Polyline
                        key={index}
                        path={val.polyline}
                        strokeColor={`#666`}
                        strokeOpacity={0.4}
                        strokeWeight={3}
                      />
                    )
                  })
                : null}
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
                    strokeColor={color}
                    strokeOpacity={0.8}
                    strokeWeight={4}
                  />
                )
              })}
            </Map>
          </div>
        </div>
      </div>
    )
  }
  onOriginMarkerClick = () => {
    this.setState({ originMarkerLatLng: null })
  }
  onDestMarkerClick = () => {
    this.setState({ destMarkerLatLng: null })
  }
  onMapClicked = (t, map, c) => {
    const lat = c.latLng.lat()
    const lng = c.latLng.lng()
    if (this.state.originMarkerLatLng === null) {
      this.setState({ originMarkerLatLng: { lat, lng } })
      if (this.state.destMarkerLatLng !== null) {
        // redraw polyline
        this.drawPolyLineWithLatLng({ lat, lng }, this.state.destMarkerLatLng)
      }
    } else if (this.state.destMarkerLatLng === null) {
      this.setState({ destMarkerLatLng: { lat, lng } })
      if (this.state.originMarkerLatLng !== null) {
        // redraw polyline
        this.drawPolyLineWithLatLng(this.state.originMarkerLatLng, { lat, lng })
      }
    }
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
