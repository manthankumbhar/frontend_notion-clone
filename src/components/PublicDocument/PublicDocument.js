import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "components/SlateEditor/SlateEditor.scss";
import { createEditor, Transforms } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import { withHistory } from "slate-history";
import logo from "public/assets/arc_logo_full.svg";

export default function PublicDocument() {
  const { id } = useParams();
  const documentId = id;
  console.log(documentId);
  const navigate = useNavigate();
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    editor.children = JSON.parse(sessionStorage.getItem(documentId)) || [
      {
        type: "heading-one",
        children: [{ text: "" }],
      },
    ];
    setLoading(false);
  }, [documentId, editor, content]);

  useEffect(() => {
    var getData = async () => {
      try {
        setLoading(true);
        var res = await axios.get(
          `${process.env.REACT_APP_SERVER_LINK}/documents/${documentId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        var parsedData = JSON.parse(res.data)["data"];
        if (parsedData === null) {
          var data = [
            {
              type: "heading-one",
              children: [{ text: "" }],
            },
          ];
          sessionStorage.setItem(`${documentId}`, JSON.stringify(data));
          setContent(data);
          setLoading(false);
          return data;
        } else {
          sessionStorage.setItem(`${documentId}`, parsedData);
          setContent(parsedData);
          setLoading(false);
          return parsedData;
        }
      } catch (error) {
        setLoading(false);
        navigate("/error");
      }
    };
    getData();
  }, [navigate, documentId, editor]);

  const menuFocus = createRef();

  useEffect(() => {
    menuFocus.current?.focus();
  }, [menuFocus]);

  const headingOneElement = (props) => (
    <h1 {...props.attributes}>{props.children}</h1>
  );

  const headingTwoElement = (props) => (
    <h2 {...props.attributes}>{props.children}</h2>
  );

  const headingThreeElement = (props) => (
    <h3 {...props.attributes}>{props.children}</h3>
  );

  const numberedListElement = (props) => (
    <ol {...props.attributes} className="editor__styles--numbered">
      {props.children}
    </ol>
  );

  const bulletedListElement = (props) => (
    <ul {...props.attributes} className="editor__styles--bulleted">
      {props.children}
    </ul>
  );

  const listItemElement = (props) => (
    <li {...props.attributes} className="editor__styles--bulleted">
      {props.children}
    </li>
  );

  const onChangeChecklist = useCallback(
    (e, props) => {
      const path = ReactEditor.findPath(editor, props.element);
      const newProperties = {
        checked: e.target.checked,
      };
      Transforms.setNodes(editor, newProperties, { at: path });
    },
    [editor]
  );

  const checkListElement = useCallback(
    (props) => {
      return (
        <span className="editor__styles--checklist">
          <input
            {...props.attributes}
            type="checkbox"
            className="editor__styles--checklist-input"
            checked={props.children[0].props.parent.checked}
            onChange={(e) => {
              onChangeChecklist(e, props);
            }}
          />
          {props.children}
        </span>
      );
    },
    [onChangeChecklist]
  );

  const blockQuoteElement = (props) => (
    <blockquote {...props.attributes} className="editor__styles--quote">
      {props.children}
    </blockquote>
  );

  const renderElement = useCallback(
    (props) => {
      switch (props.element.type) {
        case "heading-one":
          return headingOneElement(props);
        case "heading-two":
          return headingTwoElement(props);
        case "heading-three":
          return headingThreeElement(props);
        case "numbered-list":
          return numberedListElement(props);
        case "bulleted-list":
          return bulletedListElement(props);
        case "check-list":
          return checkListElement(props);
        case "list-item":
          return listItemElement(props);
        case "block-quote":
          return blockQuoteElement(props);
        default:
          return <p {...props.attributes}>{props.children}</p>;
      }
    },
    [checkListElement]
  );

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.code) {
      children = <code className="editor__styles--code">{children}</code>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.strikeThrough) {
      children = <del>{children}</del>;
    }

    return <span {...attributes}>{children}</span>;
  };

  return (
    <div>
      <Slate editor={editor} value={content}>
        {loading ? (
          <div className="editor__loading">
            <CircularProgress size={40} color="secondary" />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#191919",
              }}
            >
              <img
                src={logo}
                alt="logo"
                className="sidebar__logo--icon"
                style={{
                  backgroundColor: "#191919",
                  padding: "2rem 3rem",
                }}
              />
              <a
                href="/signup"
                target="_blank"
                style={{
                  width: "10rem",
                  height: "3rem",
                  margin: "2rem 3rem",
                  textDecoration: "none",
                  paddingTop: "1rem",
                }}
                className="sidebar__btn"
              >
                Try Arc Free
              </a>
            </div>
            <Editable
              className="editor__area"
              style={{ padding: "3rem 3rem 3rem 10rem", marginTop: "-5px" }}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              readOnly={true}
            />
          </>
        )}
      </Slate>
    </div>
  );
}
