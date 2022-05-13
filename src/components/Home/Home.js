import React, { useEffect, useState } from "react";
import "components/Home/Home.scss";
import SlateEditor from "components/SlateEditor/SlateEditor";
import Sidebar from "components/Sidebar/Sidebar";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { decodeToken } from "react-jwt";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const navigate = useNavigate();
  var { id } = useParams();
  // make the call here only and get the first id from the response
  // console.log(id);
  const [options, setOptions] = useState([]);
  const [documentId, setdocumentId] = useState("");
  const [loading, setLoading] = useState(false);

  console.log(documentId);
  useEffect(() => {
    async function documentsArray() {
      try {
        setLoading(true);
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
        // setOptions(res.data);
        if (res.data.length === 0) {
          console.log("passing new doc creation");
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
          console.log(res_2.data);
          var id_2 = parsedData["id"];
          navigate(`/documents/${id_2}`);
          return res_2.data;
        }
        // var id = res.data[0]["id"];
        // navigate(`/documents/${id}`);
        // var url = document.URL;
        // var id = url.substring(url.lastIndexOf("/") + 1);
        setOptions(res.data);
        var arr = [];
        await res.data.map((x) => arr.push(x["id"]));
        if (arr.includes(id)) {
          setdocumentId(id);
          navigate(`/documents/${id}`);
          setLoading(false);
        } else {
          setdocumentId(res.data[0]["id"]);
          navigate(`/documents/${res.data[0]["id"]}`);
          setLoading(false);
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
        navigate("/error");
      }
    }
    documentsArray();
  }, [navigate, id]);

  // useEffect(() => {
  //   documentsArray();
  // }, [documentsArray]);
  // get first id and redirect to that id
  // navigate(`/documents/${optionsDemo[0]["id"]}`);
  return (
    <div className="home">
      <Sidebar options={options} />
      {loading ? (
        <div className="home__loading">
          <CircularProgress size={40} color="secondary" />
        </div>
      ) : documentId !== "" ? (
        <SlateEditor documentId={documentId} />
      ) : null}
      {/* <SlateEditor documentId={documentId} /> */}
      {/* <SlateEditor documentId={documentId.length === 0 ? null : documentId} /> */}
    </div>
  );
}
