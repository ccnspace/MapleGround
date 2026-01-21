export type CharacterInfo = {
  ocid: string;
  character_name: string;
  world_name: string;
  character_class: string;
  character_level: number;
};

export type AccountInfo = {
  account_id: string;
  character_list: CharacterInfo[];
};

export type AccountList = {
  account_list: AccountInfo[];
};
