import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface EditorProps {
  field: any;
  key: string;
  id: string;
}

function Editor({field, key, id}: EditorProps) {
  return (
    <ReactQuill
      {...field}
      key={key}
      id={id}
      className="bg-input/30 rounded-md border border-input custom-quill min-h-[10rem]"
    />
  );
}

export default Editor;
