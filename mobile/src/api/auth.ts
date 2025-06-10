import fetcher from "./fetcher";
import { User } from "@/types/interfaces";

export const logoutUser = async () => {
  return (await fetcher.post("auth/logout")).json();
};

export const auth = async (): Promise<User> => {
  return (await fetcher.get("auth")).json();
};
