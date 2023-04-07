import { Modal } from "@geist-ui/core";
import { type List } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { type ListDataUpdateInput } from "~/pages";

interface EditFormProps {
  closeHandler: () => void;
  updateHandler: (listData: ListDataUpdateInput) => void;
  showModal: boolean;
  listData: List | undefined;
  updateLoading: boolean;
}

const EditListModal = ({
  showModal,
  closeHandler,
  updateHandler,
  listData,
  updateLoading,
}: EditFormProps) => {
  const [input, setInput] = useState<ListDataUpdateInput>();
  useEffect(() => {
    if (listData)
      setInput({
        name: listData.name,
        title: listData.title ?? "",
      });
  }, [listData]);
  const handleInputChange = (key: string, value: string) => {
    setInput((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
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
