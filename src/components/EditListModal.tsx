import { Modal } from "@geist-ui/core";
import { Hash, X, List as ListIcon } from "@geist-ui/icons";
import React, { useEffect, useState } from "react";
import {
  type ListItemType,
  type List,
  type ListDataUpdateInput,
  type ItemType,
  type SubItemInput,
} from "~/types/list";
import ListItemInput from "./ListItemInput";
import { type Item } from "@prisma/client";
import TagSelect from "./TagSelect";
import GroceryList from "./GroceryList";

interface EditFormProps {
  closeHandler: (
    inputChanged?: boolean,
    listData?: ListDataUpdateInput
  ) => void;
  updateHandler: (listData: ListDataUpdateInput) => void;
  showModal: boolean;
  listData: List | undefined | null;
  updateLoading: boolean;
  deleteItemHandler: (id: string) => void;
}

const EditListModal = ({
  showModal,
  closeHandler,
  updateHandler,
  listData,
  updateLoading,
  deleteItemHandler,
}: EditFormProps) => {
  const [input, setInput] = useState<ListDataUpdateInput>();
  const [addList, setAddList] = useState(false);
  const [inputChanged, setInputChanged] = useState(false);
  const [listItemData, setListItemData] = useState<ListItemType[]>([]);

  useEffect(() => {
    if (listData) {
      const items = listData.items.map(
        (item: Item): ItemType => ({
          id: item.id,
          name: item.name,
          checked: item.checked,
          fields: item.fields as unknown as SubItemInput[],
        })
      );
      setInput({
        name: listData.name,
        title: listData.title ?? "",
        status: listData.status ?? "",
        items,
      });
      // if (listData.items.length > 0) {
      //   setAddList(true);
      // } else {
      //   setAddList(false);
      // }
    }
  }, [listData]);

  const handleInputChange = (key: string, value: string) => {
    if (input) {
      setInput(
        (prevState) =>
          ({
            ...prevState,
            [key]: value,
          } as ListDataUpdateInput)
      );
    }
  };

  const handleTagSelect = (status: string) => {
    if (input) {
      setInput(
        (prevState) =>
          ({
            ...prevState,
            status,
          } as ListDataUpdateInput)
      );
    }
  };

  useEffect(() => {
    if (listItemData) {
      setInput(
        (prev) =>
          ({
            ...prev,
            items: listItemData,
          } as ListDataUpdateInput)
      );
      setInputChanged(true);
    }
  }, [listItemData]);

  const DisplayListView = () => {
    if (input?.status === "🛒" && input?.items) {
      return (
        <GroceryList
          listItemData={input.items}
          deleteItemHandler={deleteItemHandler}
          setListItemData={setListItemData}
        />
      );
    } else {
      return (
        <ListItemInput
          listItemData={input?.items}
          setListItemData={setListItemData}
          deleteItemHandler={deleteItemHandler}
          handleRemoveList={() => setAddList(false)}
        />
      );
    }
  };

  return (
    <Modal
      visible={showModal}
      onClose={() => {
        if (input) closeHandler(inputChanged, input);
      }}
    >
      <div className="flex flex-col">
        <TagSelect
          status={listData?.status ?? ""}
          onTagSelect={handleTagSelect}
        />
        <input
          value={input?.title ?? ""}
          placeholder={"Title"}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="text-xl font-bold"
        />
        <input
          value={input?.name}
          placeholder={"Add note"}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
        <DisplayListView />

        {/* {addList ? (
          <DisplayListView />
        ) : (
          <div className="cursor-pointer pt-4 text-gray-400">
            <ListIcon
              size={16}
              onClick={() => {
                setAddList((prev) => !prev);
              }}
            />
          </div>
        )} */}
      </div>
      <Modal.Action passive onClick={() => closeHandler()}>
        Cancel
      </Modal.Action>
      <Modal.Action
        onClick={() => {
          if (input) updateHandler(input);
        }}
        loading={updateLoading}
        type="success"
      >
        Update
      </Modal.Action>
    </Modal>
  );
};

export default EditListModal;
