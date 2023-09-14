import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import { Card, Display, Text, Page, useToasts } from "@geist-ui/core";
import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useReducer, useState } from "react";
import DisplayCards from "~/components/DisplayCards";
import EditListModal from "~/components/EditListModal";
import InputForm from "~/components/InputForm";
import { setList, setLists, setShowModal } from "~/state/action";
import reducer from "~/state/reducer";
import {
  type ListDataUpdateInput,
  type ItemType,
  type List,
} from "~/types/list";

import { api } from "~/utils/api";

const initialState = {
  lists: [],
  list: null,
  showModal: false,
};

const Home: NextPage = () => {
  const user = useUser();
  const ctx = api.useContext();
  const { setToast } = useToasts({ placement: "topRight" });
  const [state, dispatch] = useReducer(reducer, initialState);
  const { lists, list, showModal } = state;
  const closeModalHandler = (
    inputChanged?: boolean,
    listDataInput?: ListDataUpdateInput
  ) => {
    dispatch(setShowModal(false));
    if (list && listDataInput && inputChanged)
      updateList({
        id: list.id,
        name: listDataInput.name,
        title: listDataInput?.title,
        items: listDataInput.items,
      });
  };
  const { data, isLoading: listLoading } = api.lists.getAll.useQuery({
    userId: user.user?.id ?? "",
  });
  const { mutate: createList, isLoading: addLoading } =
    api.lists.create.useMutation({
      onSuccess: () => {
        void ctx.lists.getAll.invalidate();
      },
      onError: () => {
        setToast({
          text: "Conflict in name, please try another!",
          type: "error",
        });
      },
    });
  const { mutate: updateList, isLoading: updateLoading } =
    api.lists.update.useMutation({
      onSuccess: () => {
        void ctx.lists.getAll.invalidate();
        dispatch(setShowModal(false));
      },
    });
  const { mutate: deleteList, isLoading: deleteLoading } =
    api.lists.delete.useMutation({
      onSuccess: () => {
        void ctx.lists.getAll.invalidate();
      },
    });
  const { mutate: deleteFromListId } = api.items.deleteFromListId.useMutation();
  const { mutate: deleteItem } = api.items.delete.useMutation({
    onSuccess: () => {
      void ctx.lists.getAll.invalidate();
    },
  });

  const handleAddList = (name: string, title: string, items: ItemType[]) => {
    createList({
      name,
      title,
      items,
    });
  };

  const handleEdit = (listDataInput: ListDataUpdateInput) => {
    if (list)
      updateList({
        id: list.id,
        name: listDataInput.name,
        title: listDataInput?.title,
        items: listDataInput.items,
      });
  };

  const handleDelete = (id: string) => {
    deleteFromListId({ id });
    setTimeout(() => {
      deleteList({ id });
    }, 500);
  };
  const handleDeleteItem = (id: string) => {
    deleteItem({
      id,
    });
  };

  const handleShowModal = (value: boolean) => {
    dispatch(setShowModal(value));
  };

  const handleSetList = (data: List | undefined) => {
    if (data) dispatch(setList(data));
  };

  useEffect(() => {
    if (data) dispatch(setLists(data));
  }, [data]);
  return (
    <>
      <Head>
        <title>Keep Up</title>
        <meta name="description" content="Keep Up - supercharged ToDo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {!user.isSignedIn && (
          <div className="flex h-screen items-center justify-center">
            <Display shadow>
              <Text h1 className="mx-4 bg-transparent">{`Keep Up`}</Text>
              <SignIn />
            </Display>
          </div>
        )}
        {!!user.isSignedIn && user.user.firstName && (
          <Page>
            <Page.Header>
              <div className="mt-4">
                <Card>
                  <div className="flex justify-between">
                    <div className="self-center text-xl">{`Hi there, ${user.user.firstName}`}</div>
                    <div className="h-min self-center whitespace-nowrap rounded-md border border-black bg-slate-800 p-1 text-sm text-slate-300 hover:border-black hover:bg-white hover:text-slate-800">
                      <SignOutButton />
                    </div>
                  </div>
                </Card>
              </div>
            </Page.Header>
            <Page.Content>
              <div className="flex flex-col gap-4 sm:grid">
                <div className="flex place-content-center gap-x-1">
                  <InputForm
                    onEnterKeyDown={handleAddList}
                    addLoading={addLoading}
                  />
                </div>
                {listLoading && (
                  <Card>
                    <div className="grid gap-y-2">
                      <div className="h-4 w-auto animate-pulse rounded-3xl bg-slate-200" />
                      <div className="h-4 w-auto animate-pulse rounded-3xl bg-slate-200" />
                      <div className="h-4 w-auto animate-pulse rounded-3xl bg-slate-200" />
                    </div>
                  </Card>
                )}
                <DisplayCards
                  data={lists}
                  deleteLoading={deleteLoading}
                  handleDelete={handleDelete}
                  listData={list}
                  handleSetList={handleSetList}
                  handleShowModal={handleShowModal}
                  showModal={showModal}
                  updateHandler={handleEdit}
                />
              </div>
              <EditListModal
                closeHandler={closeModalHandler}
                deleteItemHandler={handleDeleteItem}
                listData={list}
                showModal={showModal}
                updateHandler={handleEdit}
                updateLoading={updateLoading}
              />
            </Page.Content>
          </Page>
        )}
      </main>
    </>
  );
};

export default Home;
