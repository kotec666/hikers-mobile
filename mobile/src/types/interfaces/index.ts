export enum UserRoles {
  "admin" = 1,
  "user",
  "partner",
  technicalSupport,
  "viewer",
}

export interface User {
  id: number;
  partnerId: null | number;
  phone: string;
  createdAt: string;
  firstName: null | string;
  lastName: null | string;
  email: null | string;
  avatar: null | string;
  roleId: UserRoles;
  role: {
    id: UserRoles;
    name: string;
    label: string;
  };
}

export enum UserPermissionsList {
  push_notifications = "push_notifications",
  sms_messages = "sms_messages",
  email_messages = "email_messages",
  geolocation = "geolocation",
  // camera access in future (for scanning qr codes)
}

export interface UserPermissions {
  push_notifications: boolean; // is granted
  sms_messages: boolean;
  email_messages: boolean;
  geolocation: boolean;
}
