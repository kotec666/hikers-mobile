import { create } from "zustand";
import { User } from "@/types/interfaces";

interface UserState {
  user: User;
  setUser: (user: User) => void;
  removeUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {} as User,
  setUser: (user) =>
    set(() => ({
      user: user,
    })),
  removeUser: () =>
    set(() => ({
      user: {} as User,
    })),
}));
