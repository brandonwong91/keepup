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
