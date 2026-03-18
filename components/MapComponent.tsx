'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { User } from '@/types'

const containerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 23.6850,
  lng: 90.3563
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

export default function MapComponent({ users, centerLoc }: { users: User[], centerLoc: {lat: number, lng: number} | null }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries: ['places']
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  useEffect(() => {
    if (map && (users.length > 0 || centerLoc)) {
      const bounds = new window.google.maps.LatLngBounds()
      let hasValidCoords = false

      if (centerLoc) {
        bounds.extend(centerLoc)
        hasValidCoords = true
      }

      users.forEach(user => {
        if (user.lat && user.lng) {
          bounds.extend({ lat: user.lat, lng: user.lng })
          hasValidCoords = true
        }
      })

      if (hasValidCoords) {
        map.fitBounds(bounds)
        if (users.length === 1 && !centerLoc) {
          map.setZoom(14)
        }
      }
    }
  }, [map, users, centerLoc])

  if (!isLoaded) return (
    <div className="flex justify-center items-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  )

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerLoc || defaultCenter}
      zoom={7}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {centerLoc && (
        <Marker
          position={centerLoc}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
          }}
        />
      )}

      {users.map(user => {
        if (!user.lat || !user.lng) return null

        let color = '#e74c3c' // Donor
        if (user.is_doctor) color = '#27ae60'
        else if (user.is_ambulance) color = '#d35400'

        return (
          <Marker
            key={user.id}
            position={{ lat: user.lat, lng: user.lng }}
            onClick={() => setSelectedUser(user)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
              fillColor: color,
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: 'white',
              scale: 1.5,
              anchor: new window.google.maps.Point(12, 24)
            }}
          />
        )
      })}

      {selectedUser && (
        <InfoWindow
          position={{ lat: selectedUser.lat!, lng: selectedUser.lng! }}
          onCloseClick={() => setSelectedUser(null)}
        >
          <div className="p-1 min-w-[150px]">
            <h3 className="font-bold mb-1 text-gray-800">{selectedUser.name}</h3>
            {(!selectedUser.blood_group || selectedUser.is_doctor || selectedUser.is_ambulance) && (
              <p className="m-0 text-gray-600">{selectedUser.phone}</p>
            )}
            {selectedUser.blood_group && (
              <p className="mt-1 mb-0 text-red-600 font-bold">Blood: {selectedUser.blood_group}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}



