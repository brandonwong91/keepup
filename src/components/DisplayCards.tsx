import { Fieldset, Loading, Badge, Button } from "@geist-ui/core";
import { type Item } from "@prisma/client";
import React from "react";
import { type ListDataUpdateInput, type List } from "~/types/list";

interface DisplayCardsProps {
  data: List[] | undefined;
  listData: List | undefined | null;
  showModal: boolean;
  handleShowModal: (input: boolean) => void;
  handleSetList: (data: List | undefined) => void;
  handleDelete: (id: string) => void;
  deleteLoading: boolean;
  updateHandler: (listData: ListDataUpdateInput) => void;
}

const DisplayCards = ({
  data,
  listData,
  showModal,
  handleShowModal,
  handleSetList,
  handleDelete,
  deleteLoading,
  updateHandler,
}: DisplayCardsProps) => {
  const renderUrls = (input: string) => {
    const splitUrls = input.split(" ");
    return (
      <div className="flex gap-x-1" onClick={() => handleShowModal(true)}>
        {splitUrls.map((item) => {
          if (
            item.startsWith("http://") ||
            item.startsWith("https://") ||
            item.startsWith("www.")
          ) {
            return (
              <a href={item} key={item} className="hover:underline">
                {item}
              </a>
            );
          } else {
            return <span key={item}>{item}</span>;
          }
        })}
      </div>
    );
  };

  const handleCheckboxClick = (list: ListDataUpdateInput, itemId: string) => {
    const updatedItems = list?.items?.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedList = {
      ...list,
      items: updatedItems,
    };

    updateHandler(updatedList);
  };

  return (
    <>
      {data &&
        data.length > 0 &&
        data.map((list: List) => (
          <div key={list.id}>
            {listData?.id === list.id && showModal ? (
              <Fieldset>
                <Loading />
              </Fieldset>
            ) : (
              <Fieldset>
                <div
                  onClick={() => {
                    handleSetList(list);
                  }}
                >
                  <div onClick={() => handleShowModal(true)}>
                    {list.title ? (
                      <>
                        <Fieldset.Title>{list.title}</Fieldset.Title>
                        <Fieldset.Subtitle>{list.name}</Fieldset.Subtitle>
                      </>
                    ) : (
                      <Fieldset.Title>{list.name}</Fieldset.Title>
                    )}
                  </div>
                  {list.items.length > 0 &&
                    list.items.map((item: Item) => {
                      return (
                        <div
                          key={item.id}
                          className="w-fit-content flex gap-x-2 overflow-x-auto text-slate-400"
                        >
                          <div className="self-center">
                            <input
                              type="checkbox"
                              size={16}
                              defaultChecked={item.checked}
                              onClick={() => {
                                handleCheckboxClick(
                                  list as unknown as ListDataUpdateInput,
                                  item.id
                                );
                              }}
                              className="hover:cursor-pointer"
                            />
                          </div>
                          {renderUrls(item.name)}
                        </div>
                      );
                    })}
                </div>
                <Fieldset.Footer>
                  <Badge type="success" scale={1 / 2}>
                    {list.updatedAt > list.createdAt
                      ? `${list.updatedAt.toLocaleDateString()} ${list.updatedAt.toLocaleTimeString()}`
                      : `${list.createdAt.toLocaleDateString()} ${list.createdAt.toLocaleTimeString()}`}
                  </Badge>
                  <Button
                    type="error"
                    auto
                    scale={1 / 3}
                    font="12px"
                    onClick={() => {
                      handleShowModal(false);
                      handleDelete(list.id);
                    }}
                    loading={deleteLoading}
                  >
                    Delete
                  </Button>
                </Fieldset.Footer>
              </Fieldset>
            )}
          </div>
        ))}
    </>
  );
};

export default DisplayCards;
