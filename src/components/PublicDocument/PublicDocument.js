import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "components/PublicDocument/PublicDocument.scss";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import { withHistory } from "slate-history";
import logo from "public/assets/arc_logo_full.svg";

export default function PublicDocument() {
  const { id } = useParams();
  const documentId = id;
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let res = await axios.get(
        `${process.env.REACT_APP_SERVER_LINK}/documents/${documentId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let parsedData = JSON.parse(res.data)["data"];
      if (parsedData === null) {
        let data = [
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
  }, [navigate, documentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    <ol {...props.attributes} className="publicDocument__styles--numbered">
      {props.children}
    </ol>
  );

  const bulletedListElement = (props) => (
    <ul {...props.attributes} className="publicDocument__styles--bulleted">
      {props.children}
    </ul>
  );

  const listItemElement = (props) => (
    <li {...props.attributes} className="publicDocument__styles--bulleted">
      {props.children}
    </li>
  );

  const checkListElement = useCallback((props) => {
    return (
      <span className="publicDocument__styles--checklist">
        <input
          {...props.attributes}
          type="checkbox"
          className="publicDocument__styles--checklist-input"
          checked={props.children[0].props.parent.checked}
        />
        {props.children}
      </span>
    );
  }, []);

  const blockQuoteElement = (props) => (
    <blockquote {...props.attributes} className="publicDocument__styles--quote">
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
      children = (
        <code className="publicDocument__styles--code">{children}</code>
      );
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

    if (leaf.hyperLink) {
      children = (
        <a
          // have to dig into children and find the text properly
          href={
            children.props.leaf.text.includes("http")
              ? `${children.props.leaf.text}`
              : `//${children.props.leaf.text}`
          }
          target="_blank"
          rel="noreferrer"
          className="publicDocument__styles--hyperlink"
        >
          {children}
        </a>
      );
    }

    return <span {...attributes}>{children}</span>;
  };

  return (
    <div>
      <Slate editor={editor} value={content}>
        {loading ? (
          <div className="publicDocument__loading">
            <CircularProgress size={40} color="secondary" />
          </div>
        ) : (
          <>
            <div
              className="publicDocument__container"
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#191919",
              }}
            >
              <img
                src={logo}
                alt="logo"
                className="publicDocument__container--icon"
              />
              <a
                href="/signup"
                target="_blank"
                className="publicDocument__container--btn"
              >
                Try Arc Free
              </a>
            </div>
            <Editable
              className="publicDocument__area"
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
