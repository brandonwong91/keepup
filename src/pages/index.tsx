import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import { Card, Display, Text, Page } from "@geist-ui/core";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import DisplayCard from "~/components/DisplayCard";
import EditListModal from "~/components/EditListModal";
import InputForm from "~/components/InputForm";
import {
  type ListDataUpdateInput,
  type ItemType,
  type List,
} from "~/types/list";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();
  const ctx = api.useContext();
  const [listData, setListData] = useState<List>();
  const [showModal, setShowModal] = useState(false);
  const closeModalHandler = () => {
    setShowModal(false);
  };
  const { data, isLoading: listLoading } = api.lists.getAll.useQuery({
    userId: user.user?.id ?? "",
  });
  const { mutate: createList, isLoading: addLoading } =
    api.lists.create.useMutation({
      onSuccess: () => {
        void ctx.lists.getAll.invalidate();
      },
    });
  const { mutate: updateList, isLoading: updateLoading } =
    api.lists.update.useMutation({
      onSuccess: () => {
        void ctx.lists.getAll.invalidate();
        setShowModal(false);
      },
    });
  const { mutate: deleteList, isLoading: deleteLoading } =
    api.lists.delete.useMutation({
      onSuccess: () => {
        void ctx.lists.getAll.invalidate();
      },
    });
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
    if (listData)
      updateList({
        id: listData.id,
        name: listDataInput.name,
        title: listDataInput?.title,
        items: listDataInput.items,
      });
  };

  const handleDelete = (id: string) => {
    deleteList({
      id,
    });
  };

  const handleDeleteItem = (id: string) => {
    deleteItem({
      id,
    });
  };

  return (
    <>
      <Head>
        <title>Keep Up</title>
        <meta name="description" content="Generated by create-t3-app" />
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
                    <div className="rounded-md border border-black bg-slate-800 p-1 text-sm text-slate-300 hover:border-black hover:bg-white hover:text-slate-800">
                      <SignOutButton />
                    </div>
                  </div>
                </Card>
              </div>
            </Page.Header>
            <Page.Content>
              <div className="grid gap-4">
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
                <DisplayCard
                  data={data}
                  listData={listData}
                  setListData={setListData}
                  showModal={showModal}
                  setShowModal={setShowModal}
                  handleDelete={handleDelete}
                  deleteLoading={deleteLoading}
                />
              </div>
              <EditListModal
                showModal={showModal}
                closeHandler={closeModalHandler}
                listData={listData}
                updateHandler={handleEdit}
                updateLoading={updateLoading}
                deleteItemHandler={handleDeleteItem}
              />
            </Page.Content>
          </Page>
        )}
      </main>
    </>
  );
};

export default Home;
