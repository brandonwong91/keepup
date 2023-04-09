import { type Item } from "@prisma/client";

export interface ListItemType {
  id: string;
  name: string;
}

export interface ItemType {
  id: string;
  name: string;
}

export interface ListDataUpdateInput {
  name: string;
  title?: string;
  items: ItemType[];
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
