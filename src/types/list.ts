import { type Item } from "@prisma/client";

export interface SubItemInput {
  type: string;
  value: string;
  unit?: string;
}

export interface SubItemType extends SubItemInput {
  id: string;
  listItemId: string;
}

export interface ListItemType {
  id: string;
  name: string;
  checked: boolean;
  fields?: SubItemInput[];
  [key: string]: any;
}

export interface ItemDBType extends ItemType {
  createdAt: Date;
  updatedAt: Date;
  checked: boolean;
  listId: string;
}

export interface ItemType {
  id: string;
  name: string;
  checked: boolean;
  fields?: SubItemInput[];
}

export interface ListDataUpdateInput {
  name: string;
  title?: string;
  items: ItemType[];
  [key: string]: any;
}

export type List = {
  id: string;
  name: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  status: string | null;
  items: Item[];
};

export type ListState = {
  lists: Array<List>;
  list: List | null;
  showModal: boolean;
};

export type ListAction =
  | { type: "SET_LISTS"; value: List[] }
  | { type: "SET_LIST"; value: List }
  | { type: "ADD_LIST"; value: List }
  | { type: "DELETE_LIST"; value: string }
  | { type: "UPDATE_LIST"; value: List }
  | { type: "ADD_ITEM"; value: ListItemType }
  | { type: "DELETE_ITEM"; value: { listId: string; itemId: string } }
  | { type: "SHOW_MODAL"; value: boolean };

export enum ActionType {
  "SET_LISTS" = "SET_LISTS",
  "SET_LIST" = "SET_LIST",
  "ADD_LIST" = "ADD_LIST",
  "DELETE_LIST" = "DELETE_LIST",
  "UPDATE_LIST" = "UPDATE_LIST",
  "ADD_ITEM" = "ADD_ITEM",
  "DELETE_ITEM" = "DELETE_ITEM",
  "SHOW_MODAL" = "SHOW_MODAL",
}
