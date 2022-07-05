import React, { useCallback, useEffect, useState } from "react";
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
  const [documentsArray, setDocumentsArray] = useState([]);
  const [sharedDocumentsArray, setSharedDocumentsArray] = useState([]);
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
        if (res.data["documents"].length === 0) {
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
        setDocumentsArray(res.data["documents"]);
        setSharedDocumentsArray(res.data["shared_documents"]);
        let documents = [];
        let shared_documents = [];
        await res.data["documents"].map((x) => documents.push(x["id"]));
        await res.data["shared_documents"].map((x) =>
          shared_documents.push(x["id"])
        );
        if (documents.includes(id)) {
          setdocumentId(id);
          navigate(`/documents/${id}`);
          setLoading(false);
        } else if (shared_documents.includes(id)) {
          setdocumentId(id);
          navigate(`/documents/${id}`);
          setLoading(false);
        } else {
          setdocumentId(documents[0]);
          navigate(`/documents/${documents[0]}`);
          setLoading(false);
        }
      } catch (err) {
        console.log(err.message);
        navigate("/error");
      }
    }
    documentsArray();
  }, [navigate, id, accessToken]);

  const updateSidebarArray = useCallback(
    (data) => {
      var currentDocument = documentsArray.find((x) => x.id === documentId);
      var currrentSharedDocument = sharedDocumentsArray.find(
        (x) => x.id === documentId
      );
      if (currentDocument) {
        currentDocument.name = data;
        setDocumentsArray([...documentsArray]);
      } else {
        currrentSharedDocument.name = data;
        setSharedDocumentsArray([...sharedDocumentsArray]);
      }
    },
    [documentId, documentsArray, sharedDocumentsArray]
  );

  return (
    <div className="home">
      <Sidebar
        documentsArray={documentsArray}
        sharedDocumentsArray={sharedDocumentsArray}
      />
      {loading ? (
        <div className="home__loading">
          <CircularProgress size={40} color="secondary" />
        </div>
      ) : documentId !== "" ? (
        <SlateEditor
          documentId={documentId}
          updateSidebarArray={(data) => updateSidebarArray(data)}
        />
      ) : null}
    </div>
  );
}
