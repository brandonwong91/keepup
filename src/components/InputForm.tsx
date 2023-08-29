import { Button, Card } from "@geist-ui/core";
import React, { useState } from "react";
import { List, Plus, X } from "@geist-ui/icons";
import { type ItemType, type ListItemType } from "~/types/list";
import ListItemInput from "./ListItemInput";
import clsx from "clsx";

interface InputFormProps {
  onEnterKeyDown: (name: string, title: string, items: ItemType[]) => void;
  addLoading: boolean;
}

const initInput = {
  name: "",
  title: "",
};

const InputForm = ({ onEnterKeyDown, addLoading }: InputFormProps) => {
  const [showTitle, setShowTitle] = useState(false);
  const [addList, setAddList] = useState(false);
  const [error, setError] = useState(false);
  const [listItemData, setListItemData] = useState<ListItemType[]>([]);
  const [input, setInput] = useState(initInput);
  const handleInputChange = (key: string, value: string) => {
    setInput((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  return (
      <Card className="flex-grow md:flex-none">
          {showTitle && (
            <input
              className="mb-2"
              placeholder="Title"
              onChange={(e) => handleInputChange("title", e.target.value)}
              value={input.title}
            />
          )}
          <div className="flex justify-between">
            <div className="flex flex-col">
              <input
                placeholder="Add note"
                onClick={() => setShowTitle(true)}
                onChange={(e) => {
                  handleInputChange("name", e.target.value);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onEnterKeyDown(input.name, input.title, listItemData);
                    setTimeout(() => setInput(initInput), 300);
                  }
                }}
                value={input.name}
                className={clsx({
                  "border-b-2 border-red-500": error,
                })}
              />
              {error && (
                <span className="text-xs text-red-500">
                  This field is required
                </span>
              )}
            </div>
            {!showTitle && (
              <div className="cursor-pointer text-gray-400">
                <List
                  onClick={() => {
                    setAddList(true);
                  }}
                />
              </div>
            )}
          </div>
          {addList && <ListItemInput setListItemData={setListItemData} />}
          {showTitle && (
            <div>
              <div className="flex cursor-pointer justify-between pt-2 text-gray-400">
                <List onClick={() => setAddList((prev) => !prev)} />
                <div className="flex">
                  {addLoading && (
                    <Button
                      type="abort"
                      auto
                      scale={1 / 5}
                      loading={addLoading}
                    />
                  )}
                  <div
                    className="text-green-600"
                    onClick={() => {
                      if (input.name === "") {
                        setError(true);
                      } else {
                        onEnterKeyDown(input.name, input.title, listItemData);
                        setShowTitle(false);
                        setInput(initInput);
                        setAddList(false);
                      }
                    }}
                  >
                    <Plus className="hover:scale-110" />
                  </div>
                  <div className="text-red-600">
                    <X
                      className="hover:scale-110"
                      onClick={() => {
                        setShowTitle(false);
                        setInput(initInput);
                        setAddList(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
      </Card>
  );
};

export default InputForm;
