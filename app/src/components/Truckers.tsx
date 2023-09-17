import { useQuery } from "@tanstack/react-query";

export function Truckers() {
  const { data, isLoading } = useQuery([
    "truckers",
    () => {
      return fetch(import.meta.env.VITE_API_URL).then((res) => res.json());
    },
  ]);

  return <ul></ul>;
}
