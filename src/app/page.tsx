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
  <main className="flex flex-col">
    <Confetti />
  </main>
);

export default Home;
