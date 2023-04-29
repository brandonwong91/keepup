import { Plus, X } from "@geist-ui/icons";
import React, { useState, type KeyboardEvent, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  type SubItemType,
  SubItemInput,
  type ListItemType,
} from "~/types/list";

interface SubItemInputProps {
  listItemId: string;
  expand: boolean;
  subItemData: SubItemType[];
  setInputArray: (value: React.SetStateAction<ListItemType[]>) => void;
}

const initSubItemInput = {
  type: "",
  value: "",
  unit: "",
};

const SubItemInput = ({
  listItemId,
  expand,
  subItemData,
  setInputArray,
}: SubItemInputProps) => {
  const [subItemArray, setSubItemArray] = useState<SubItemType[]>(
    subItemData ?? []
  );
  const [currentSubItem, setCurrentSubItem] =
    useState<SubItemInput>(initSubItemInput);
  const resetForm = () => {
    setCurrentSubItem(initSubItemInput);
  };

  const handleChangeSubItem = (key: string, value: string) => {
    setCurrentSubItem((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  const handleChangeExistingSubItem = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { name, value } = e.target;
    setSubItemArray((prevSubItemArray) =>
      prevSubItemArray.map((subItem) => {
        if (subItem.id === id) {
          return {
            ...subItem,
            [name]: value,
          };
        } else {
          return subItem;
        }
      })
    );
  };
  const handleOnEnter = (e: KeyboardEvent, resetForm?: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSubItemArray((prev) => [
        ...prev,
        {
          id: uuidv4(),
          listItemId,
          ...currentSubItem,
        },
      ]);
      if (resetForm) {
        resetForm();
      }
    }
  };
  const handleAddSubItem = () => {
    setSubItemArray((prev) => [
      ...prev,
      {
        id: uuidv4(),
        listItemId,
        ...currentSubItem,
      },
    ]);
    if (resetForm) {
      resetForm();
    }
  };
  const handleRemoveSubItem = (id: string) => {
    setSubItemArray((prevState) =>
      prevState.filter((subItem) => subItem.id !== id)
    );
  };
  useEffect(() => {
    setInputArray((prevData) => {
      return prevData.map((item) => {
        const matchingFields = subItemArray.filter(
          (field) => field.listItemId === item.id
        );
        if (matchingFields.length > 0) {
          return {
            ...item,
            fields: matchingFields,
          };
        }
        return item;
      });
    });
  }, [subItemArray, setInputArray]);
  return expand ? (
    <>
      <div className="ml-4 flex gap-x-1">
        <div className="cursor-pointer self-center text-slate-400">
          <Plus size={16} onClick={handleAddSubItem} />
        </div>
        <input
          placeholder="type"
          className="w-full"
          onChange={(e) => handleChangeSubItem("type", e.target.value)}
          onKeyDown={(e) => handleOnEnter(e, resetForm)}
          value={currentSubItem.type}
        />
        <input
          placeholder="value"
          className="w-full"
          onChange={(e) => handleChangeSubItem("value", e.target.value)}
          onKeyDown={(e) => handleOnEnter(e, resetForm)}
          value={currentSubItem.value}
        />
        <input
          placeholder="unit?"
          className="w-full"
          onChange={(e) => handleChangeSubItem("unit", e.target.value)}
          onKeyDown={(e) => handleOnEnter(e, resetForm)}
          value={currentSubItem?.unit}
        />
        <div className="cursor-pointer self-center text-slate-400 hover:scale-110">
          <X size={16} onClick={() => resetForm()} />
        </div>
      </div>
      {subItemArray.length > 0 &&
        subItemArray.map((subItem: SubItemType) => {
          return (
            <div className="ml-9 flex gap-x-1" key={subItem.id}>
              <input
                name="type"
                placeholder="type"
                className="w-full"
                value={subItem.type}
                onChange={(e) => handleChangeExistingSubItem(e, subItem.id)}
              />
              <input
                name="value"
                placeholder="value"
                className="w-full"
                value={subItem.value}
                onChange={(e) => handleChangeExistingSubItem(e, subItem.id)}
              />
              <input
                name="unit"
                placeholder="unit?"
                className="w-full"
                value={subItem.unit}
                onChange={(e) => handleChangeExistingSubItem(e, subItem.id)}
              />
              <div className="cursor-pointer self-center text-slate-400 hover:scale-110">
                <X size={16} onClick={() => handleRemoveSubItem(subItem.id)} />
              </div>
            </div>
          );
        })}
    </>
  ) : null;
};

export default SubItemInput;
