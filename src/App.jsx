import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Layout from "@/components/organisms/Layout";
import AllBookmarks from "@/components/pages/AllBookmarks";
import RecentBookmarks from "@/components/pages/RecentBookmarks";
import FoldersPage from "@/components/pages/FoldersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AllBookmarks />} />
          <Route path="recent" element={<RecentBookmarks />} />
          <Route path="folders" element={<FoldersPage />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </BrowserRouter>
  );
}

export default App;