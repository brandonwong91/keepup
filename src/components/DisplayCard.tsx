import { Fieldset, Loading, Badge, Button } from "@geist-ui/core";
import { Checkbox } from "@geist-ui/icons";
import { type Item } from "@prisma/client";
import React from "react";
import { type List } from "~/types/list";

interface DisplayCardProps {
  data: List[] | undefined;
  listData: List | undefined;
  showModal: boolean;
  setShowModal: (input: boolean) => void;
  setListData: (data: List | undefined) => void;
  handleDelete: (id: string) => void;
  deleteLoading: boolean;
}

const DisplayCard = ({
  data,
  listData,
  showModal,
  setShowModal,
  setListData,
  handleDelete,
  deleteLoading,
}: DisplayCardProps) => {
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
                    setShowModal(true);
                    setListData(list);
                  }}
                >
                  {list.title ? (
                    <div>
                      <Fieldset.Title>{list.title}</Fieldset.Title>
                      <Fieldset.Subtitle>{list.name}</Fieldset.Subtitle>
                    </div>
                  ) : (
                    <Fieldset.Title>{list.name}</Fieldset.Title>
                  )}
                  {list.items.length > 0 &&
                    list.items.map((item: Item) => {
                      return (
                        <div
                          key={item.id}
                          className="flex gap-x-2 text-slate-400"
                        >
                          <div className="self-center">
                            <Checkbox type="success" size={16} />
                          </div>
                          {item.name}
                        </div>
                      );
                    })}
                </div>
                <Fieldset.Footer>
                  <Badge type="success" scale={1 / 2}>
                    {`${list.createdAt.toLocaleDateString()} ${list.createdAt.toLocaleTimeString()}`}
                  </Badge>
                  <Button
                    type="error"
                    auto
                    scale={1 / 3}
                    font="12px"
                    onClick={() => {
                      setShowModal(false);
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

export default DisplayCard;
