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
      label: "h1",
      value: "heading-one",
    },
    {
      label: "h2",
      value: "heading-two",
    },
    {
      label: "quote",
      value: "block-quote",
    },
    {
      label: "numbered",
      value: "numbered-list",
    },
    {
      label: "bullets",
      value: "bulleted-list",
    },
    {
      label: "p",
      value: "paragraph",
    },
  ];
  const [menuOptions, setMenuOptions] = useState(allowedTags);
  const menuFocus = createRef();

  useEffect(() => {
    menuFocus.current?.focus();
  }, [menuFocus]);

  const renderElement = useCallback((props) => {
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
      case "list-item":
        return <li {...props.attributes}>{props.children}</li>;
      case "numbered-list":
        return <ol {...props.attributes}>{props.children}</ol>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

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
    }
    return { top: x > 120 ? x - 150 : x + 20, left: y };
  };

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    document.removeEventListener("click", closeMenu);
  }, []);

  const openMenu = useCallback(() => {
    const position = getCoordinates();
    setCoordinates(position);
    setShowMenu(true);
    document.addEventListener("click", closeMenu);
  }, [closeMenu]);

  const renderMenu = () => {
    return (
      <Menu
        className="editor__menu"
        style={coordinates}
        ref={menuFocus}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Backspace") {
            closeMenu();
            ReactEditor.focus(editor);
            event.preventDefault();
          }

          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
      >
        {menuOptions.map((item, key) => {
          return (
            <MenuItem
              tabIndex="0"
              key={key}
              onClick={() => {
                CustomEditor.toggleBlock(editor, item.value);
                closeMenu();
                ReactEditor.focus(editor);
              }}
            >
              {item.label}
            </MenuItem>
          );
        })}
      </Menu>
    );
  };

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
        {showMenu ? renderMenu() : null}
        <Editable
          className="editor__area"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (event.key === "/") {
              openMenu();
            }
            if (event.key === " " || event.key === "Backspace") {
              closeMenu();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              const isList = LIST_TYPES.includes(editor.getFragment()[0].type);
              return isList
                ? Transforms.insertNodes(editor, {
                    type: "list-item",
                    children: [{ text: "" }],
                  })
                : Transforms.insertNodes(editor, {
                    type: "paragraph",
                    children: [{ text: "" }],
                  });
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
          }}
        />
      </Slate>
    </div>
  );
}
