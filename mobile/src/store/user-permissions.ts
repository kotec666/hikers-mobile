import { create } from 'zustand'
import { UserPermissions } from '@/types/interfaces'

// this store is use for track granted permissions by user


interface UserPermissionsState {
  permissions: UserPermissions;
  setPermission: (permission: keyof UserPermissions, value: boolean) => void;
}

export const useUserPermissionsStore = create<UserPermissionsState>((set) => ({
  permissions: {
    push_notifications: false,
    sms_messages: false,
    email_messages: false,
    geolocation: false,
  },
  //              'push_notifications',           false
  setPermission: (permission, value) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        [permission]: value,
      },
    })),
}))