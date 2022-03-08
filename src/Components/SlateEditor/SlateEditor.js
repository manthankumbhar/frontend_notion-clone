import React, { useMemo, useState } from "react";
import "Components/SlateEditor/SlateEditor.scss";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";

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
        <Editable className="editor__area" />
      </Slate>
    </div>
  );
}
