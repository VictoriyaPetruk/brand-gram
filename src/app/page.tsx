import MainPage from "./main";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <Header />

      {/* Main Content Section */}
      <main className="flex-1 flex flex-col justify-center items-center">
        <MainPage />
      </main>
      <footer className="w-full">
    </footer>
    </div>
  );
}

