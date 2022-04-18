import React from "react";
import "components/Home/Home.scss";
import SlateEditor from "components/SlateEditor/SlateEditor";
import Sidebar from "components/Sidebar/Sidebar";

export default function Home() {
  return (
    <div className="home">
      <Sidebar />
      <SlateEditor />
    </div>
  );
}
