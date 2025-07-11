import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: {
    container: [
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
      ['undo', 'redo']
    ],
    handlers: {
      undo() { this.quill.history.undo(); },
      redo() { this.quill.history.redo(); }
    }
  },
  history: { delay: 500, maxStack: 100, userOnly: true }
};

const formats = [
  'font','size','bold','italic','underline','strike',
  'color','background','list','indent','blockquote','code-block',
  'link','image','clean'
];

const cleanPastedContent = (html) => {
  if (!html) return '';
  let cleaned = html
    .replace(/<!--StartFragment-->|<!--EndFragment-->/gi, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(\/?o:p)[^>]*>/gi, '')
    .replace(/\sclass=("|')?Mso.*?("|')/gi, '')
    .replace(/\s*mso-[^:]+:[^;"']+;?/gi, '');
  return DOMPurify.sanitize(cleaned, { USE_PROFILES: { html: true } });
};

const RichTextEditor = React.forwardRef(({ value, onChange }, ref) => {
  const internalRef = useRef(null);
  const quillRef = ref || internalRef;

  useEffect(() => {
    const quill = quillRef.current ? quillRef.current.getEditor() : null;
    if (!quill) return;
    const root = quill.root;
    const handlePaste = (e) => {
      const clipboard = e.clipboardData || window.clipboardData;
      const htmlData = clipboard.getData('text/html');
      if (htmlData) {
        e.preventDefault();
        const range = quill.getSelection(true);
        const sanitized = cleanPastedContent(htmlData);
        quill.clipboard.dangerouslyPasteHTML(range.index, sanitized, 'user');
      }
    };
    root.addEventListener('paste', handlePaste);
    return () => root.removeEventListener('paste', handlePaste);
  }, [quillRef]);

  const handleChange = (content) => {
    if (onChange) {
      const sanitized = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
      onChange(sanitized);
    }
  };

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={handleChange}
      modules={modules}
      formats={formats}
      theme="snow"
    />
  );
});

export default RichTextEditor;
