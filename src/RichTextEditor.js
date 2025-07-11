import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'font', 'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image'
];

function sanitizeWordHtml(html) {
  let cleaned = html.replace(/<!--(Start|End)Fragment-->/g, '');
  cleaned = cleaned.replace(/class="Mso[^"]*"/gi, '');
  cleaned = cleaned.replace(/style="[^"]*mso-[^;]*;?"/gi, '');
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      'p','div','span','br','strong','b','em','i','u','strike',
      'ol','ul','li','a','h1','h2','h3','h4','h5','h6','pre','code','img'
    ],
    ALLOWED_ATTR: ['href','src','alt','style'],
    ALLOW_ARIA_ATTR: false
  });
}

const RichTextEditor = React.forwardRef(({ value, onChange }, ref) => {
  const quillRef = useRef(null);
  const editorRef = ref || quillRef;

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const editor = editorRef.current.getEditor();
      editor.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value, editorRef]);

  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;
    const handlePaste = (e) => {
      const clipboard = e.clipboardData || window.clipboardData;
      const htmlData = clipboard.getData('text/html');
      const textData = clipboard.getData('text/plain');
      if (htmlData) {
        e.preventDefault();
        const clean = sanitizeWordHtml(htmlData);
        const range = editor.getSelection();
        const index = range ? range.index : editor.getLength();
        editor.clipboard.dangerouslyPasteHTML(index, clean);
        editor.setSelection(index + clean.length);
      } else if (textData) {
        e.preventDefault();
        const escaped = textData
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r\n|\r|\n/g, '<br>');
        const range = editor.getSelection();
        const index = range ? range.index : editor.getLength();
        editor.clipboard.dangerouslyPasteHTML(index, escaped);
        editor.setSelection(index + escaped.length);
      }
    };
    editor.root.addEventListener('paste', handlePaste);
    return () => editor.root.removeEventListener('paste', handlePaste);
  }, [editorRef]);

  return (
    <ReactQuill
      ref={editorRef}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      theme="snow"
    />
  );
});

export default RichTextEditor;
