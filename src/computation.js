import '@mapbox/polyline'
import Papa from 'papaparse'
import * as utm from 'utm'
import bikewaysSt from './bikeways'
import directionsObject from './scienceworld_kitsbeach'

let paths = []

const loadBikePaths = () => {
  let parsedCsv = Papa.parse(bikewaysSt, { header: true })

  let currentPathId = null
  let currentPath = []
  paths = []

  for (let element of parsedCsv.data) {
    let latlon = utm.toLatLon(element.POINT_X, element.POINT_Y, 10, 'N')
    element.latitude = latlon.latitude
    element.longitude = latlon.longitude

    if (currentPathId !== element.UNIQUE_ID) {
      if (currentPath.length === 1) {
        console.error(currentPathId)
        console.error(currentPath)
      }
      if (currentPath.length !== 0) {
        paths.push(currentPath)
      }
      currentPath = []
      currentPathId = element.UNIQUE_ID
    }

    currentPath.push(element)
  }

  paths.push(currentPath)

  // console.log(paths)
}

const distance = (x1, y1, x2, y2) => {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

const closestBikePath = (longitude, latitude) => {
  let minimumOrthogonalDistance = 180
  let closestPath = paths[0]
  for (let path of paths) {
    for (let i = 1; i < path.length; i++) {
      let segmentLength = distance(
        path[i - 1].longitude,
        path[i - 1].latitude,
        path[i].longitude,
        path[i].latitude
      )

      let crossProductMagnitude =
        (latitude - path[i].latitude) * (longitude - path[i - 1].longitude) -
        (longitude - path[i].longitude) * (latitude - path[i - 1].latitude)
      crossProductMagnitude *= crossProductMagnitude

      let orthogonalDistance = crossProductMagnitude / segmentLength

      let distanceToPoint1 = distance(
        path[i - 1].longitude,
        path[i - 1].latitude,
        longitude,
        latitude
      )
      if (distanceToPoint1 > orthogonalDistance) {
        orthogonalDistance = distanceToPoint1
      }

      let distanceToPoint2 = distance(
        path[i].longitude,
        path[i].latitude,
        longitude,
        latitude
      )
      if (distanceToPoint2 > orthogonalDistance) {
        orthogonalDistance = distanceToPoint2
      }

      if (orthogonalDistance < minimumOrthogonalDistance) {
        closestPath = path
        minimumOrthogonalDistance = orthogonalDistance
      }
    }
  }

  return {
    path: closestPath,
    orthogonalDistance: minimumOrthogonalDistance,
  }
}

const scoreDirections = directions => {
  const toleranceThresholdMeters = 100
  const toleranceThresholdDegrees = toleranceThresholdMeters / (1800.0 * 60.0)

  let polyline = require('@mapbox/polyline')

  for (let route of directions.routes) {
    for (let leg of route.legs) {
      for (let step of leg.steps) {
        let stepPoints = polyline.decode(step.polyline.points)
        step.score = 0

        for (let pointIndex = 1; pointIndex < stepPoints.length; pointIndex++) {
          // A step has a safety score that is the lowest of the two ends of the step.
          let closestPath1 = closestBikePath(
            stepPoints[pointIndex - 1][1],
            stepPoints[pointIndex - 1][0]
          )
          let closestPath2 = closestBikePath(
            stepPoints[pointIndex][1],
            stepPoints[pointIndex][0]
          )

          if (
            closestPath1.orthogonalDistance < toleranceThresholdDegrees &&
            closestPath2.orthogonalDistance < toleranceThresholdDegrees
          ) {
            // The score for the step is the average score for segments of its polyline
            step.score += 1 / (stepPoints.length - 1)
            step.path = closestPath1.path
          }
        }

        // if (step.score > 0) {
        //   console.log(step.score, step)
        // }
      }
    }
  }
}

const test = () => {
  scoreDirections(directionsObject)
  console.log(directionsObject)
}

loadBikePaths()
// test()

export default scoreDirections
export const getPaths = () => paths
