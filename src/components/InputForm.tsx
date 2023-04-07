import { Button, Card } from "@geist-ui/core";
import React, { useState } from "react";
import { List, Plus, X } from "@geist-ui/icons";

interface InputFormProps {
  onEnterKeyDown: (name: string, title: string) => void;
  addLoading: boolean;
}

const initInput = {
  name: "",
  title: "",
};

const InputForm = ({ onEnterKeyDown, addLoading }: InputFormProps) => {
  const [showTitle, setShowTitle] = useState(false);
  const [input, setInput] = useState(initInput);
  const handleInputChange = (key: string, value: string) => {
    setInput((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <div>
      <Card>
        <div className="flex flex-col">
          {showTitle && (
            <input
              className="mb-2"
              placeholder="Title"
              onChange={(e) => handleInputChange("title", e.target.value)}
              value={input.title}
            />
          )}

          <div className="flex">
            <input
              placeholder="Add note"
              onClick={() => setShowTitle(true)}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnterKeyDown(input.name, input.title);
                  setTimeout(() => setInput(initInput), 300);
                }
              }}
              value={input.name}
            />
            {!showTitle && (
              <div className="text-gray-400">
                <List />
              </div>
            )}
          </div>
          {showTitle && (
            <div>
              <div className="flex cursor-pointer justify-between pt-2 text-gray-400">
                <List />
                <div className="flex">
                  {addLoading && (
                    <Button
                      type="abort"
                      auto
                      scale={1 / 5}
                      loading={addLoading}
                    />
                  )}
                  <div className="text-green-600">
                    <Plus className="hover:scale-110" />
                  </div>
                  <div className="text-red-600">
                    <X
                      className="hover:scale-110"
                      onClick={() => {
                        setShowTitle(false);
                        setInput(initInput);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InputForm;
