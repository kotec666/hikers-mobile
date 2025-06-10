import { useLayoutEffect, useState } from 'react'
import { Geolocation, GeolocationPluginPermissions, PermissionStatus } from '@capacitor/geolocation'
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings'
import { useUserPermissionsStore } from '@/store/user-permissions.ts'
import { UserPermissionsList } from '@/types/interfaces'

const useGetUserPosition = () => {
  const [data, setData] = useState<{
    userLatitude: number | undefined
    userLongitude: number | undefined
    userPositionGranted: boolean
    userPositionLoaded: boolean
  }>({
    userLatitude: undefined,
    userLongitude: undefined,
    userPositionGranted: false,
    userPositionLoaded: false,
  })

  const { setPermission } = useUserPermissionsStore()

  const getUserPosition = async (permissions: PermissionStatus) => {

    if (
      permissions?.location === 'prompt' ||
      permissions?.location === 'prompt-with-rationale'
    ) {
      try {
        permissions = await Geolocation.requestPermissions(['location'] as unknown as GeolocationPluginPermissions)
      } catch (e) {
        alert(`requestPermissions failed: ${e}`)
      }
    }

    if (permissions?.location === 'granted') {
      try {
        const position = await Geolocation.getCurrentPosition()

        setData(s => ({
          ...s,
          userLatitude: position.coords.latitude,
          userLongitude: position.coords.longitude,
        }))

        setPermission(UserPermissionsList.geolocation, true)
        setData(s => ({
          ...s,
          userPositionGranted: true,
        }))
      } catch (e) {
        setPermission(UserPermissionsList.geolocation, false)
        alert(`Location is unavailable on your device: ${JSON.stringify(e?.message)}`)
      }
    }

    if (permissions?.location === 'denied') {
      setPermission(UserPermissionsList.geolocation, false)
      setData(s => ({
        ...s,
        userPositionGranted: false,
      }))
    }

    setData(s => ({
      ...s,
      userPositionLoaded: true,
    }))
  }

  const getUserPermissions = async () => {
    let permissions
    try {
      permissions = await Geolocation.checkPermissions()
    } catch (e) {
      if (e.toString() === 'Error: Location services are not enabled') {
        await NativeSettings.open({
          optionAndroid: AndroidSettings.Location,
          optionIOS: IOSSettings.LocationServices,
        })

        try {
          permissions = await Geolocation.checkPermissions()
          return getUserPosition(permissions)
        } catch (e) {
          if (e.toString() === 'Error: Location services are not enabled') {
            return setData(s => ({
              ...s,
              userPositionLoaded: true,
              userPositionGranted: false,
            }))
          }
        }
      }
    }

    if (permissions) {
      await getUserPosition(permissions)
    }
  }

  useLayoutEffect(() => {
      getUserPermissions()
    }, [],
  )

  return {
    userLatitude: data.userLatitude,
    userLongitude: data.userLongitude,
    userPositionGranted: data.userPositionGranted,
    userPositionLoaded: data.userPositionLoaded,
  }

}


export default useGetUserPosition