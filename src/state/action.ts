import { ActionType, List } from "~/types/list";

interface SetLists {
  type: ActionType.SET_LISTS;
  value: List[];
}

export const setLists = (value: List[]): SetLists => ({
  type: ActionType.SET_LISTS,
  value,
});

interface SetList {
  type: ActionType.SET_LIST;
  value: List;
}

export const setList = (value: List): SetList => ({
  type: ActionType.SET_LIST,
  value,
});

interface ShowModal {
  type: ActionType.SHOW_MODAL;
  value: boolean;
}

export const setShowModal = (value: boolean): ShowModal => ({
  type: ActionType.SHOW_MODAL,
  value,
});
