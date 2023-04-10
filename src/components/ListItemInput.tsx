import { Checkbox } from "@geist-ui/core";
import { Plus, X } from "@geist-ui/icons";
import React, {
  type ChangeEvent,
  useState,
  useEffect,
  type KeyboardEvent,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { type ListItemType } from "~/types/list";

interface ListItemInputProps {
  setListItemData: (data: ListItemType[]) => void;
  listItemData?: ListItemType[];
  deleteItemHandler?: (id: string) => void;
}

const ListItemInput = ({
  listItemData,
  setListItemData,
  deleteItemHandler,
}: ListItemInputProps) => {
  const [edit, setEdit] = useState(false);
  const [inputArray, setInputArray] = useState<ListItemType[]>(
    listItemData ?? []
  );
  const [currentValue, setCurrentValue] = useState("");

  const handleRemoveListItem = (id: string) =>
    setInputArray((prev) => prev.filter((item) => item.id !== id));
  const handleChangeListItem = (
    event: ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const { name, value } = event.target;
    const updatedInputArray = [...inputArray];
    const foundInput = updatedInputArray.find((input) => input.id === index);
    if (foundInput) {
      foundInput[name] = value;
      setInputArray(updatedInputArray);
    }
    setInputArray(updatedInputArray);
  };
  const resetForm = () => {
    setCurrentValue("");
    setEdit(false);
  };
  const handleOnEnter = (e: KeyboardEvent, resetForm?: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      setInputArray((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name: target.value,
        },
      ]);
      if (resetForm) {
        resetForm();
      }
    }
  };
  const handleOnBlur = (
    e: React.FocusEvent<HTMLInputElement, Element>,
    resetForm?: () => void
  ) => {
    const target = e.target as HTMLInputElement;
    if (target.value !== "") {
      setEdit(false);
      setInputArray((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name: target.value,
        },
      ]);
      if (resetForm) {
        resetForm();
      }
    }
  };

  useEffect(() => {
    setListItemData(inputArray);
  }, [inputArray, setListItemData]);
  return (
    <div>
      <div className="flex gap-x-2 pt-2">
        <div className="ml-1 self-center text-slate-400">
          {edit ? <Checkbox type="success" /> : <Plus size={16} />}
        </div>
        <input
          className="w-full"
          placeholder="List item"
          onClick={() => setEdit(true)}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={(e) => handleOnBlur(e, resetForm)}
          onKeyDown={(e) => handleOnEnter(e, resetForm)}
        />
        <div className="ml-1 cursor-pointer self-center text-slate-400">
          <X
            size={16}
            onClick={() => {
              setEdit(false);
              setCurrentValue("");
            }}
          />
        </div>
      </div>
      {inputArray.length > 0 &&
        inputArray.map((input: ListItemType) => {
          return (
            <div
              className="flex gap-x-2 pt-2 hover:border-y hover:border-slate-400"
              key={input.id}
            >
              <div className="ml-1 self-center text-slate-400">
                <Checkbox type="success" />
              </div>
              <input
                className="w-full"
                name="name"
                placeholder="List item"
                value={input.name}
                onChange={(e) => {
                  handleChangeListItem(e, input.id);
                }}
                onKeyDown={handleOnEnter}
              />
              <div className="cursor-pointer self-center text-slate-400 hover:scale-110">
                <X
                  size={16}
                  onClick={() => {
                    handleRemoveListItem(input.id);
                    deleteItemHandler && deleteItemHandler(input.id);
                  }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ListItemInput;
