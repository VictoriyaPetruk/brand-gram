import MainPage from "./main";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col justify-center">
        <MainPage />
      </div>
    </div>
  );
}
