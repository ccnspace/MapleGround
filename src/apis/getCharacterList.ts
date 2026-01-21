import { AccountList } from "@/types/CharacterList";
import { apiFetcher } from "./apiFetcher";

export const getCharacterList = async () => {
  const response = await apiFetcher<AccountList>({ url: `/characterList` });
  return response.account_list;
};
