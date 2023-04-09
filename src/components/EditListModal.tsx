import { Modal } from "@geist-ui/core";
import { List as ListIcon } from "@geist-ui/icons";
import React, { useEffect, useState } from "react";
import {
  type ListItemType,
  type List,
  type ListDataUpdateInput,
} from "~/types/list";
import ListItemInput from "./ListItemInput";

interface EditFormProps {
  closeHandler: () => void;
  updateHandler: (listData: ListDataUpdateInput) => void;
  showModal: boolean;
  listData: List | undefined;
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
  const [listItemData, setListItemData] = useState<ListItemType[]>([]);
  useEffect(() => {
    if (listData) {
      setInput({
        name: listData.name,
        title: listData.title ?? "",
        items: listData.items,
      });
      if (listData.items.length > 0) setAddList(true);
    }
  }, [listData]);
  const handleInputChange = (key: string, value: string) => {
    setInput((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      items: listItemData,
    }));
  }, [listItemData]);
  return (
    <Modal visible={showModal} onClose={closeHandler}>
      <div className="flex flex-col">
        <input
          value={input?.title ?? ""}
          placeholder={"Title"}
          onChange={(e) => handleInputChange("title", e.target.value)}
        />
        <input
          value={input?.name}
          placeholder={"Add note"}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
        {addList && (
          <ListItemInput
            listItemData={input?.items}
            setListItemData={setListItemData}
            deleteItemHandler={deleteItemHandler}
          />
        )}
        <div className="cursor-pointer pt-4 text-gray-400">
          <ListIcon
            size={16}
            onClick={() => {
              setAddList(true);
            }}
          />
        </div>
      </div>
      <Modal.Action passive onClick={closeHandler}>
        Cancel
      </Modal.Action>
      <Modal.Action
        onClick={() => {
          if (input) updateHandler(input);
        }}
        loading={updateLoading}
      >
        Update
      </Modal.Action>
    </Modal>
  );
};

export default EditListModal;
