import { Routes, Route } from "react-router-dom";
import { ClosetProvider } from "./contexts/ClosetContext";
import Home from "./pages/Home";
import Closet from "./pages/Closet";
import Outfits from "./pages/Outfits";
import StyleTwin from "./pages/StyleTwin";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Success from "./pages/Success";
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <ClosetProvider>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/closet" element={<Closet />} />
            <Route path="/outfits" element={<Outfits />} />
            <Route path="/styletwin" element={<StyleTwin />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </ClosetProvider>
  );
}
