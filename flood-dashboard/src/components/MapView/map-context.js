import { createContext, useContext } from 'react'

// Holds the live MapLibre map instance once it has fired 'load'.
// null until ready, so consumers can guard on it.
export const MapContext = createContext(null)

export const useMap = () => useContext(MapContext)
