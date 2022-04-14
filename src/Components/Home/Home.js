import React from "react";
import "Components/Home/Home.scss";
import SlateEditor from "Components/SlateEditor/SlateEditor";
import Sidebar from "Components/Sidebar/Sidebar";

export default function Home() {
  return (
    <div className="home">
      <Sidebar />
      <SlateEditor />
    </div>
  );
}
