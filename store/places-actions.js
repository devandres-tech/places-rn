import * as FileSystem from 'expo-file-system'

import ENV from '../env'
import { insertPlace, fetchPlaces } from '../helpers/db'

export const ADD_PLACE = 'ADD_PLACE'
export const SET_PLACES = 'SET_PLACES'

export const addPlace = (title, image, location) => {
  return async (dispatch) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${ENV.googleApiKey}`
    )
    if (!response.ok) throw 'Something went wrong'
    const resData = await response.json()
    if (!resData) throw 'Something went wrong'
    const address = resData.results[0].formatted_address

    const fileName = image.split('/').pop()
    const newPath = FileSystem.documentDirectory + fileName
    try {
      // move image
      await FileSystem.moveAsync({
        from: image,
        to: newPath,
      })
      // insert to db
      const dbResult = await insertPlace(
        title,
        newPath,
        address,
        location.lat,
        location.lng
      )
      dispatch({
        type: ADD_PLACE,
        placeData: {
          id: dbResult.insertId,
          title,
          image: newPath,
          address: address,
          coords: {
            lat: location.lat,
            lng: location.lng,
          },
        },
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export const loadPlaces = () => {
  return async (dispatch) => {
    try {
      const dbResult = await fetchPlaces()
      dispatch({ type: SET_PLACES, places: dbResult.rows._array })
    } catch (err) {
      throw err
    }
  }
}
