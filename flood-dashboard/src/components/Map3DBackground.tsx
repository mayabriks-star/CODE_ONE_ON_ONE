// @ts-ignore
import MapView from './MapView/MapView'
// @ts-ignore
import Photoreal3DLayer from './Photoreal3DLayer/Photoreal3DLayer'

interface Props {
  onMapReady?: (map: any) => void
}

export default function Map3DBackground({ onMapReady }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <MapView onReady={onMapReady}>
        <Photoreal3DLayer />
      </MapView>
    </div>
  )
}
