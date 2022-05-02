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
    async function documentsArray() {
      try {
        var userId = await decodeToken(localStorage.getItem("accessToken"))[
          "user_id"
        ];
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
        setOptions(res.data);
        if (res.data === []) {
          var config_2 = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          };
          var res_2 = await axios.post(
            `${process.env.REACT_APP_SERVER_LINK}/documents`,
            {},
            config_2
          );
          var parsedData = JSON.parse(res_2.data);
          var id_2 = parsedData["id"];
          navigate(`/documents/${id_2}`);
          return res_2.data;
        }
        // var id = res.data[0]["id"];
        // navigate(`/documents/${id}`);
        var url = document.URL;
        var id = url.substring(url.lastIndexOf("/") + 1);
        var arr = [];
        await res.data.map((x) => arr.push(x["id"]));
        if (arr.includes(id)) {
          return navigate(`/documents/${id}`);
        } else {
          return navigate(`/documents/${res.data[0]["id"]}`);
        }
        // if (x["id"] === id) {
        // navigate(`/documents/${id}`);
        // } else {
        // return navigate(`/documents/${x["id"]}`);
        // }
        // return null;
        // });
        // var arr = [];
        // for (let i of res.data) {
        //   arr.push(i['id'])
        //   // console.log(i["id"]);
        // }
        // if () {
        //   navigate(`/documents/${id}`);
        // } else {
        //   navigate(`/documents/${res.data[0]["id"]}`);
        // }
        // if (arr.includes(id)) {
        // navigate(`/documents/${id}`);
        // } else {
        // }
        // return null;
      } catch (err) {
        console.log(err.message);
      }
    }
    documentsArray();
  }, [navigate]);

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
