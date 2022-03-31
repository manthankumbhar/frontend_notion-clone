import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "Components/SlateEditor/SlateEditor.scss";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import Menu, { Item as MenuItem } from "rc-menu";
import "rc-menu/assets/index.css";

export default function SlateEditor() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem("content")) || [
      {
        type: "paragraph",
        children: [{ text: "A line of text in a paragraph." }],
      },
    ]
  );
  const LIST_TYPES = ["numbered-list", "bulleted-list"];
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
  const [menuOptions, setMenuOptions] = useState(allowedTags);
  const menuFocus = createRef();

  useEffect(() => {
    menuFocus.current?.focus();
  }, [menuFocus]);

  const renderElement = useCallback(
    (props) => {
      switch (props.element.type) {
        case "block-quote":
          return (
            <blockquote {...props.attributes} className="editor__styles--quote">
              {props.children}
            </blockquote>
          );
        case "bulleted-list":
          return <ul {...props.attributes}>{props.children}</ul>;
        case "heading-one":
          return <h1 {...props.attributes}>{props.children}</h1>;
        case "heading-two":
          return <h2 {...props.attributes}>{props.children}</h2>;
        case "heading-three":
          return <h3 {...props.attributes}>{props.children}</h3>;
        case "list-item":
          return (
            <li {...props.attributes} className="editor__styles--lists">
              {props.children}
            </li>
          );
        case "numbered-list":
          return (
            <ol {...props.attributes} className="editor__styles--lists">
              {props.children}
            </ol>
          );
        case "check-list":
          return (
            <span className="editor__styles--checklist">
              <input
                {...props.attributes}
                type="checkbox"
                className="editor__styles--checklist-input"
                checked={props.children[0].props.parent.checked}
                onChange={(e) => {
                  const newProperties = {
                    type: "check-list",
                    children: props.children,
                    checked: e.target.checked,
                  };
                  Transforms.setNodes(editor, newProperties);
                }}
              />
              {props.children}
            </span>
          );
        default:
          return <p {...props.attributes}>{props.children}</p>;
      }
    },
    [editor]
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

  const CustomEditor = {
    isMarkActive(editor, format) {
      const marks = Editor.marks(editor);
      return marks ? marks[format] === true : false;
    },

    isBlockActive(editor, format) {
      const { selection } = editor;
      if (!selection) return false;

      const [match] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
        })
      );

      return !!match;
    },

    toggleMark(editor, format) {
      const isActive = CustomEditor.isMarkActive(editor, format);
      if (isActive) {
        Editor.removeMark(editor, format);
      } else {
        Editor.addMark(editor, format, true);
      }
    },

    toggleBlock(editor, format) {
      const isActive = CustomEditor.isBlockActive(editor, format);
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
  };

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
      CustomEditor.toggleBlock(editor, item.value);
      closeMenu();
      ReactEditor.focus(editor);
    },
    [closeMenu, editor]
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
            CustomEditor.toggleBlock(editor, listType);
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
          CustomEditor.toggleMark(editor, "code");
          break;
        }

        case "b": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "bold");
          break;
        }

        case "i": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "italic");
          break;
        }

        case "u": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "underline");
          break;
        }

        case "s": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "strikeThrough");
          break;
        }

        default: {
          return null;
        }
      }
    },
    [editor, openMenu]
  );

  return (
    <div className="editor">
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          const isAstChange = editor.operations.some(
            (op) => "set_selection" !== op.type
          );
          if (isAstChange) {
            const content = JSON.stringify(newValue);
            localStorage.setItem("content", content);
          }
        }}
      >
        <RenderMarkdownListMenu />
        <Editable
          className="editor__area"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={editorOnKeyDown}
        />
      </Slate>
    </div>
  );
}
