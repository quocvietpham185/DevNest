import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { ShareRepo } from "./pages/ShareRepo";

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/share-repo" element={<ShareRepo />} />
        </Routes>
      </main>
    </div>
  );
}
