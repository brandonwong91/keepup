import { ChevronDown, ChevronRight, Plus, X } from "@geist-ui/icons";
import React, {
  type ChangeEvent,
  useState,
  useEffect,
  type KeyboardEvent,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { type SubItemType, type ListItemType } from "~/types/list";
import SubItemInput from "./SubItemInput";

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
  const flattenedFields = inputArray.flatMap((item) => {
    return (
      item.fields &&
      item.fields.map((field) => {
        return {
          id: uuidv4(),
          type: field.type,
          value: field.value,
          unit: field.unit,
          listItemId: item.id,
        } as SubItemType;
      })
    );
  });

  const [currentValue, setCurrentValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [expandList, setExpandList] = useState<string[]>([]);
  const handleRemoveListItem = (id: string) =>
    setInputArray((prev) => prev.filter((item) => item.id !== id));

  const handleChangeListItem = (
    event: ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const { name, value, checked } = event.target;
    const updatedInputArray = [...inputArray];
    const foundInput = updatedInputArray.find((input) => input.id === index);
    if (foundInput) {
      let updatedValue;
      if (name === "checked") {
        updatedValue = checked;
      } else {
        updatedValue = value;
      }
      foundInput[name] = updatedValue;
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
          checked: isChecked,
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
          checked: isChecked,
        },
      ]);
      if (resetForm) {
        resetForm();
      }
    }
  };

  useEffect(() => {
    if (listItemData) {
      const hasFields = listItemData.filter(
        (listItem) => listItem.fields && listItem.fields.length > 0
      );
      setExpandList(hasFields.map((listItem) => listItem.id));
    }
    setListItemData(inputArray);
  }, [inputArray, setListItemData, listItemData]);

  return (
    <div>
      <div className="flex gap-x-2 pt-2">
        <div className="ml-1 self-center text-slate-400">
          {edit ? (
            <input
              type="checkbox"
              defaultChecked={isChecked}
              value="checked"
              onChange={() => setIsChecked((prev) => !prev)}
            />
          ) : (
            <Plus size={16} />
          )}
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
              className="grid border-y-[1px] border-y-transparent py-2 hover:border-y-[1px] hover:border-slate-300"
              key={input.id}
            >
              <div className="flex">
                <div className="ml-1 self-center text-slate-400">
                  <input
                    type="checkbox"
                    name="checked"
                    defaultChecked={input.checked}
                    value="checked"
                    onChange={(e) => {
                      handleChangeListItem(e, input.id);
                    }}
                  />
                </div>
                <button type="button" className="text-slate-400">
                  {!expandList.includes(input.id) ? (
                    <ChevronRight
                      size={16}
                      onClick={() => {
                        setExpandList((prev) => [...prev, input.id]);
                      }}
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      onClick={() => {
                        setExpandList((prev) =>
                          prev.filter((item) => item !== input.id)
                        );
                      }}
                    />
                  )}
                </button>
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
              {
                <SubItemInput
                  listItemId={input.id}
                  expand={expandList.includes(input.id)}
                  subItemData={flattenedFields.filter(
                    (item): item is SubItemType =>
                      !!item && item.listItemId === input.id
                  )}
                  setInputArray={setInputArray}
                />
              }
            </div>
          );
        })}
    </div>
  );
};

export default ListItemInput;
