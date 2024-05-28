import React, { useState } from "react";

const TAG_OPTIONS = ["🛒", "🏋️‍♀️", "📑"];

const TagSelect = ({
  status,
  onTagSelect,
}: {
  status: string;
  onTagSelect: (status: string) => void;
}) => {
  const [tag, setTag] = useState(status);
  const [showTag, setShowTag] = useState(false);
  return tag === "updated" || tag === "" ? (
    <div className="flex cursor-pointer place-items-center gap-x-1 text-gray-400">
      {showTag && (
        <div className="flex place-items-center gap-x-1">
          {TAG_OPTIONS.map((tag) => {
            return (
              <div
                key={tag}
                className="text-md h-auto w-fit rounded-xl bg-gray-200 p-2"
                onClick={() => {
                  setTag(tag);
                  onTagSelect(tag);
                }}
              >
                {tag}
              </div>
            );
          })}
        </div>
      )}
    </div>
  ) : (
    <div
      className="cursor-pointer self-start"
      onClick={() => {
        setTag("");
        setShowTag(true);
        onTagSelect("");
      }}
    >
      {tag}
    </div>
  );
};

export default TagSelect;
