import {
  PlusCircle,
  ShoppingCart,
  X,
  Calendar,
  CheckInCircle,
  Home,
} from "@geist-ui/icons";
import clsx from "clsx";
import React, { ChangeEvent, useState } from "react";
import { ListItemType, SubItemInput } from "~/types/list";

const GroceryList = ({
  listItemData,
  deleteItemHandler,
  setListItemData,
}: {
  listItemData: ListItemType[];
  deleteItemHandler?: (id: string) => void;
  setListItemData: (data: ListItemType[]) => void;
}) => {
  const [inputArray, setInputArray] = useState<ListItemType[]>(
    listItemData ?? []
  );
  const [showField, setShowField] = useState("");

  const handleChangeListItem = (
    event: ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const { name, value } = event.target;
    const updatedInputArray = [...inputArray];
    console.log("name", name, "value", value);
    // Find the index of the item with the given id
    const foundInputIndex = updatedInputArray.findIndex(
      (input) => input.id === index
    );

    if (foundInputIndex !== -1) {
      // Make a copy of the found input
      const foundInput = {
        ...updatedInputArray[foundInputIndex],
      } as ListItemType;

      if (name === "quantity") {
        // Create a quantity field
        const quantityField: SubItemInput = {
          value,
          type: "quantity",
          updatedAt: new Date().toString(),
        };

        if (foundInput.fields) {
          foundInput.fields = [...foundInput.fields, quantityField];
        } else {
          foundInput.fields = [quantityField];
        }

        // Ensure 'id' is a string (not undefined)
        foundInput.id = foundInput.id || "";

        // Update the copy in the updatedInputArray
        updatedInputArray[foundInputIndex] = foundInput;
      } else {
        foundInput[name] = value;
      }

      // Update the input array
      setInputArray(updatedInputArray);
    }
  };

  const handleCheckGroceryItem = (index: string) => {
    const updatedInputArray = [...inputArray];
    const foundInput = updatedInputArray.find((input) => input.id === index);
    if (foundInput) {
      foundInput.checked = !foundInput.checked;
      if (!foundInput.fields) {
        // Create a new fields array with a default quantity field
        foundInput.fields = [
          {
            type: "quantity",
            value: "1", // Default to 1
            updatedAt: new Date().toString(),
          },
        ];
      } else if (foundInput.fields.length === 0) {
        // If fields array is empty, add a default quantity field
        foundInput.fields.push({
          type: "quantity",
          value: "1", // Default to 1
          updatedAt: new Date().toString(),
        });
      }
    }
    setInputArray(updatedInputArray);
    setListItemData([...updatedInputArray]);
  };
  const handleRemoveListItem = (id: string) =>
    setInputArray((prev) => prev.filter((item) => item.id !== id));

  const toggleShowField = (id: string) => {
    setShowField(showField === id ? "" : id);
  };
  return (
    <div>
      {inputArray.length > 0 &&
        inputArray
          .filter((input) => !input.checked)
          .map((input: ListItemType) => {
            return (
              <div
                className="grid border-y-[1px] border-y-transparent py-1 hover:border-y-[1px] hover:border-slate-300"
                key={input.id}
              >
                <div className="flex w-full gap-x-2">
                  <div className="flex items-center gap-x-1">
                    <ShoppingCart size={16} />
                    <input
                      className="w-8"
                      name="quantity"
                      placeholder="1"
                      type="number"
                      value={
                        input.fields && input.fields.length > 0
                          ? input.fields[input.fields.length - 1]?.value
                          : 1
                      }
                      onChange={(e) => {
                        handleChangeListItem(e, input.id);
                      }}
                    />
                    <div className="cursor-pointer self-center text-blue-400 hover:scale-110">
                      <CheckInCircle
                        size={20}
                        onClick={() => {
                          handleCheckGroceryItem(input.id);
                        }}
                      />
                    </div>
                  </div>
                  <input
                    className="w-full"
                    name="name"
                    placeholder="List item"
                    value={input.name}
                    onChange={(e) => {
                      handleChangeListItem(e, input.id);
                    }}
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
              </div>
            );
          })}

      <div className="mt-2 border-t-[1px] py-2">
        {inputArray.length > 0 &&
          inputArray
            .filter((input) => input.checked)
            .map((input: ListItemType) => {
              const lastUpdatedAt =
                input.fields[input.fields.length - 1]?.updatedAt;
              let daysDifference = 0;
              if (lastUpdatedAt) {
                const currentDate = new Date();
                const lastUpdatedDate = new Date(lastUpdatedAt);
                const timeDifference =
                  currentDate.getTime() - lastUpdatedDate.getTime();
                daysDifference = Math.floor(
                  timeDifference / (1000 * 60 * 60 * 24)
                );
              }
              return (
                <div
                  className="grid border-y-[1px] border-y-transparent py-1 hover:border-y-[1px] hover:border-slate-300"
                  key={input.id}
                >
                  <div className="ml-[1px] flex w-full gap-x-2">
                    <div className="flex items-center gap-x-1">
                      <div className="flex items-center gap-x-1">
                        <div
                          className={clsx("cursor-pointer hover:scale-105", {
                            "text-blue-500": showField === input.id,
                          })}
                          onClick={() => toggleShowField(input.id)}
                        >
                          <Home size={16} />
                        </div>
                        {input.fields &&
                          input.fields.length > 0 &&
                          input.fields[input.fields.length - 1]?.value}
                      </div>
                      <div className="ml-6 cursor-pointer self-center text-blue-400 hover:scale-110">
                        <PlusCircle
                          size={20}
                          onClick={() => {
                            handleCheckGroceryItem(input.id);
                          }}
                        />
                      </div>
                    </div>
                    <input
                      className="w-full"
                      name="name"
                      placeholder="List item"
                      value={input.name}
                      onChange={(e) => {
                        handleChangeListItem(e, input.id);
                      }}
                    />
                    <div className="flex items-center gap-x-2 text-gray-400">
                      <Calendar
                        size={20}
                        onClick={() => setShowField(input.id)}
                      />
                      {daysDifference === 0 ? "now" : `${daysDifference}d`}
                    </div>
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
                  {showField === input.id &&
                    input.fields?.map((field) => {
                      return (
                        <div className="flex justify-between border-b-[1px] border-dashed px-5">
                          <span>{field.value}</span>
                          <span>
                            {new Date(field?.updatedAt ?? "").toDateString()}
                          </span>
                        </div>
                      );
                    })}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default GroceryList;
