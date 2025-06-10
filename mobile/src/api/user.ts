import fetcher from "./fetcher";
import { User } from "@/types/interfaces";

export const updateUserData = async (data: FormData): Promise<User> => {
  return (
    await fetcher.put("users/current", {
      body: data,
    })
  ).json();
};
