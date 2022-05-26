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
  const [options, setOptions] = useState([]);
  const [documentId, setdocumentId] = useState("");
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.accessToken;
  if (accessToken === "" || accessToken === null || accessToken === undefined) {
    navigate("/error");
  }

  useEffect(() => {
    async function documentsArray() {
      try {
        setLoading(true);
        var userId = await decodeToken(accessToken)["user_id"];
        var config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
        var res = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/documents?user_id=${userId}`,
          config
        );
        if (res.data.length === 0) {
          var config_2 = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
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
      } catch (err) {
        console.log(err.message);
        navigate("/error");
      }
    }
    documentsArray();
  }, [navigate, id, accessToken]);

  return (
    <div className="home">
      <Sidebar documentIdArray={options} />
      {loading ? (
        <div className="home__loading">
          <CircularProgress size={40} color="secondary" />
        </div>
      ) : documentId !== "" ? (
        <SlateEditor documentId={documentId} />
      ) : null}
    </div>
  );
}
