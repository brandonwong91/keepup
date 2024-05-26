import { Metadata } from "next";
import Confetti from "~/components/Confetti";
export const metadata: Metadata = {
  title: "Keep Up",
  description: "Keep up with yourself and your inner circle.",
  icons: {
    icon: "/favicon.ico",
  },
};
const Home = () => (
  <main className="mx-auto flex h-full min-h-screen flex-col items-center p-24">
    <Confetti />
  </main>
);

export default Home;
