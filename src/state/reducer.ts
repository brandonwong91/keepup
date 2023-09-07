import {
  ListItemType,
  List,
  ListState,
  ListAction,
  ActionType,
} from "~/types/list";

const reducer = (state: ListState, action: ListAction) => {
  switch (action.type) {
    case ActionType.SET_LISTS:
      return {
        ...state,
        lists: action.value,
      };
    case ActionType.SET_LIST:
      return {
        ...state,
        list: action.value,
      };
    case ActionType.ADD_LIST:
      return {
        ...state,
        lists: [...state.lists, action.value],
      };
    case ActionType.DELETE_LIST:
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== action.value),
      };
    case ActionType.UPDATE_LIST:
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.value.id
            ? {
                ...list,
                name: action.value.name,
                title: action.value.title,
              }
            : list
        ),
      };
    case ActionType.ADD_ITEM:
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.value.listId
            ? {
                ...list,
                items: [...list.items, action.value.item],
              }
            : list
        ),
      };
    case ActionType.DELETE_ITEM:
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.value.listId) {
            return {
              ...list,
              items: list.items.filter(
                (item) => item.id !== action.value.itemId
              ),
            };
          }
          return list;
        }),
      };
    case ActionType.SHOW_MODAL:
      return {
        ...state,
        showModal: action.value,
      };
    default:
      return state;
  }
};

export default reducer;
