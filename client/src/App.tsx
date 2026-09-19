import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NewPost } from "./pages/NewPost";
import { PostDetail } from "./pages/PostDetail";
import { NewProject } from "./pages/NewProject";
import { ProjectDetail } from "./pages/ProjectDetail";
import { QuestionList } from "./pages/QuestionList";
import { NewQuestion } from "./pages/NewQuestion";
import { QuestionDetail } from "./pages/QuestionDetail";
import { ShareRepo } from "./pages/ShareRepo";
import { RepoDetail } from "./pages/RepoDetail";
import { Profile } from "./pages/Profile";
import { EditProfile } from "./pages/EditProfile";
import { Search } from "./pages/Search";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog/new" element={<NewPost />} />
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/questions" element={<QuestionList />} />
          <Route path="/questions/new" element={<NewQuestion />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/share-repo" element={<ShareRepo />} />
          <Route path="/repos/:id" element={<RepoDetail />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/settings/profile" element={<EditProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
