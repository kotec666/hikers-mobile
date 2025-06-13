import fetcher from "./fetcher";

export const sendLog = async (data: { text: string }) => {
  return (
    await fetcher.post("testing", {
      json: data,
    })
  ).json();
};
