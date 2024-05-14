import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";

import { api } from "~/utils/api";

const initialState = {
  lists: [],
  list: null,
  showModal: false,
};

const Home: NextPage = () => {
  const user = useUser();
  const ctx = api.useContext();

  return (
    <>
      <Head>
        <title>Keep Up</title>
        <meta name="description" content="Keep Up - supercharged ToDo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex min-h-screen flex-col items-center p-24">
        <Button>Hello Moto</Button>
      </main>
    </>
  );
};

export default Home;
