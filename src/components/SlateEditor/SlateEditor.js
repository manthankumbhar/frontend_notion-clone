import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "components/SlateEditor/SlateEditor.scss";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import Menu, { Item as MenuItem } from "rc-menu";
import "rc-menu/assets/index.css";
import axios from "axios";
import { useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";

export default function SlateEditor({ documentId }) {
  const navigate = useNavigate();
  const editor = useMemo(() => withReact(createEditor()), []);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    editor.children = JSON.parse(sessionStorage.getItem(documentId)) || [
      {
        type: "paragraph",
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
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        var parsedData = JSON.parse(res.data)["data"];
        if (parsedData === null) {
          var data = [
            {
              type: "paragraph",
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
        console.log("sigh");
        setLoading(false);
        navigate("/error");
      }
    };
    getData();
  }, [navigate, documentId, editor]);

  const LIST_TYPES = useMemo(() => ["numbered-list", "bulleted-list"], []);
  const [showMenu, setShowMenu] = useState(false);
  const [coordinates, setCoordinates] = useState("");
  const allowedTags = [
    {
      label: "Text",
      value: "paragraph",
    },
    {
      label: "Heading 1",
      value: "heading-one",
    },
    {
      label: "Heading 2",
      value: "heading-two",
    },
    {
      label: "Heading 3",
      value: "heading-three",
    },
    {
      label: "Bulleted list",
      value: "bulleted-list",
    },
    {
      label: "Numbered list",
      value: "numbered-list",
    },
    {
      label: "Check list",
      value: "check-list",
    },
    {
      label: "Quote",
      value: "block-quote",
    },
  ];
  //eslint-disable-next-line
  const [menuOptions, setMenuOptions] = useState(allowedTags);
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
    <ol {...props.attributes} className="editor__styles--lists">
      {props.children}
    </ol>
  );

  const bulletedListElement = (props) => (
    <ul {...props.attributes}>{props.children}</ul>
  );

  const listItemElement = (props) => (
    <li {...props.attributes} className="editor__styles--lists">
      {props.children}
    </li>
  );

  const onChangeChecklist = useCallback(
    (e, props) => {
      const newProperties = {
        type: "check-list",
        children: props.children,
        checked: e.target.checked,
      };
      Transforms.setNodes(editor, newProperties);
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

  function isMarkActive(editor, format) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  }

  function isBlockActive(editor, format) {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
      })
    );

    return !!match;
  }

  const toggleMark = useCallback((editor, format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  }, []);

  const toggleBlock = useCallback(
    (editor, format) => {
      const isActive = isBlockActive(editor, format);
      const isList = LIST_TYPES.includes(format);
      const isChecklist = format === "check-list";

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          LIST_TYPES.includes(n.type),
        split: true,
      });
      const newProperties = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
      };
      Transforms.setNodes(editor, newProperties);

      if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
      }

      if (!isActive && isChecklist) {
        const block = { type: format, children: [], checked: false };
        Transforms.setNodes(editor, block);
      }
    },
    [LIST_TYPES]
  );

  const getCoordinates = () => {
    let x, y;
    const selection = window.getSelection();
    if (selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(false);
      const rect = range.getClientRects()[0];
      if (rect) {
        x = rect.top;
        y = rect.left;
      }
      return { top: x > 120 ? x - 150 : x + 20, left: y };
    } else {
      alert("Internal server error, please try again later");
    }
  };

  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, [setShowMenu]);

  const openMenu = useCallback(() => {
    const position = getCoordinates();
    setCoordinates(position);
    setShowMenu(true);
  }, [setCoordinates, setShowMenu]);

  const menuOnKeyDown = useCallback(
    (event) => {
      if (
        event.key === " " ||
        event.key === "Backspace" ||
        event.key === "Escape"
      ) {
        event.preventDefault();
        closeMenu();
        ReactEditor.focus(editor);
      }

      if (event.key === "Enter") {
        event.preventDefault();
      }
    },
    [closeMenu, editor]
  );

  var onClickMenu = useCallback(
    (item) => {
      toggleBlock(editor, item.value);
      closeMenu();
      ReactEditor.focus(editor);
    },
    [closeMenu, editor, toggleBlock]
  );

  const markdownListMenuOptions = menuOptions.map((item, key) => {
    return (
      <MenuItem tabIndex="0" key={key} onClick={() => onClickMenu(item)}>
        {item.label}
      </MenuItem>
    );
  });

  const MarkdownListMenu = useCallback(() => {
    return (
      <Menu
        className="editor__menu"
        style={coordinates}
        ref={menuFocus}
        onKeyDown={menuOnKeyDown}
      >
        {markdownListMenuOptions}
      </Menu>
    );
  }, [markdownListMenuOptions, coordinates, menuFocus, menuOnKeyDown]);

  const RenderMarkdownListMenu = useCallback(() => {
    return showMenu ? showMenu && <MarkdownListMenu /> : null;
  }, [showMenu]);

  useEffect(() => {
    showMenu
      ? document.addEventListener("click", closeMenu)
      : document.removeEventListener("click", closeMenu);
  }, [showMenu, closeMenu]);

  const editorOnKeyDown = useCallback(
    (event) => {
      if (event.key === "/") {
        openMenu();
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const isList = LIST_TYPES.includes(editor.getFragment()[0].type);
        const isChecklist = editor.getFragment()[0].type === "check-list";
        if (isList) {
          return Transforms.insertNodes(editor, {
            type: "list-item",
            children: [{ text: "" }],
          });
        } else if (isChecklist) {
          return Transforms.insertNodes(editor, {
            type: "check-list",
            children: [{ text: "" }],
            checked: false,
          });
        } else {
          Transforms.insertNodes(editor, {
            type: "paragraph",
            children: [{ text: "" }],
          });
        }
      }

      if (event.key === "Backspace") {
        const isList = LIST_TYPES.includes(editor.getFragment()[0].type);
        const isChecklist = editor.getFragment()[0].type === "check-list";
        if (isList) {
          const listLength =
            editor.children[editor.selection.anchor.path[0]].children[
              editor.selection.anchor.path[1]
            ].children[0].text.length;
          const listType = editor.getFragment()[0].type;
          if (listLength === 0) {
            event.preventDefault();
            toggleBlock(editor, listType);
          }
        } else if (isChecklist) {
          const checklistLength =
            editor.children[editor.selection.anchor.path[0]].children[0].text
              .length;
          if (checklistLength === 0) {
            event.preventDefault();
            Transforms.setNodes(editor, {
              type: "paragraph",
              children: [{ text: "" }],
            });
          }
        } else {
          return null;
        }
      }

      if (!event.ctrlKey) {
        return;
      }

      switch (event.key) {
        case "e": {
          event.preventDefault();
          toggleMark(editor, "code");
          break;
        }

        case "b": {
          event.preventDefault();
          toggleMark(editor, "bold");
          break;
        }

        case "i": {
          event.preventDefault();
          toggleMark(editor, "italic");
          break;
        }

        case "u": {
          event.preventDefault();
          toggleMark(editor, "underline");
          break;
        }

        case "s": {
          event.preventDefault();
          toggleMark(editor, "strikeThrough");
          break;
        }

        default: {
          return null;
        }
      }
    },
    [editor, openMenu, LIST_TYPES, toggleBlock, toggleMark]
  );

  const editorOnChange = useCallback(
    (newValue) => {
      setContent(newValue);
      const isAstChange = editor.operations.some(
        (op) => "set_selection" !== op.type
      );
      if (isAstChange) {
        const content = JSON.stringify(newValue);
        sessionStorage.setItem(documentId, content);
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        };
        axios.post(
          `${process.env.REACT_APP_SERVER_LINK}/documents/${documentId}`,
          { data: content },
          config
        );
      }
    },
    [documentId, editor]
  );

  return (
    <div className="editor">
      <Slate
        editor={editor}
        value={content}
        onChange={(newValue) => editorOnChange(newValue)}
      >
        <RenderMarkdownListMenu />
        {loading ? (
          <div className="editor__loading">
            <CircularProgress size={40} color="secondary" />
          </div>
        ) : (
          <Editable
            className="editor__area"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={editorOnKeyDown}
            placeholder={"Type '/' to checkout the magical options."}
          />
        )}
      </Slate>
    </div>
  );
}
