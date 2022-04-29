import React, { useEffect, useState } from "react";
import "components/Home/Home.scss";
import SlateEditor from "components/SlateEditor/SlateEditor";
import Sidebar from "components/Sidebar/Sidebar";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { decodeToken } from "react-jwt";

export default function Home() {
  const navigate = useNavigate();
  var { id } = useParams();
  // console.log(id);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    const documentsArray = async () => {
      var userId = decodeToken(localStorage.getItem("accessToken"))["user_id"];
      try {
        var config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        };
        var res = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/documents?user_id=${userId}`,
          config
        );
        var id = await res.data[0]["id"];
        navigate(`/documents/${id}`);
        setOptions(res.data);
        // var url = document.URL;
        // var id = url.substring(url.lastIndexOf("/") + 1);
        // var arr = [];
        // for (let i in res.data) {
        // arr.push(res.data[i]["id"]);
        // if (res.data[i]["id"].includes(id)) {
        //   return navigate(`/documents/${id}`);
        // }
        // else {
        // console.log("passing");
        // }
        // }
        // if (arr.includes(id)) {
        // navigate(`/documents/${id}`);
        // } else {
        // }
        return res.data;
      } catch (err) {
        console.log(err.message);
      }
    };
    documentsArray();
  }, []);

  // useEffect(() => {
  //   documentsArray();
  // }, [documentsArray]);
  // get first id and redirect to that id
  // navigate(`/documents/${optionsDemo[0]["id"]}`);
  return (
    <div className="home">
      <Sidebar options={options} />
      <SlateEditor documentId={id} />
    </div>
  );
}
