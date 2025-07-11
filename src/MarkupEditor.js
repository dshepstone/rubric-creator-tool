import React, { useEffect, useRef } from 'react';

const ALLOWED_TAGS = ['b','strong','i','em','u','p','br','ul','ol','li','a','span','div','h1','h2','h3','code','pre','strike'];

function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const fragment = document.createDocumentFragment();

  function clean(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (ALLOWED_TAGS.includes(tag)) {
        const el = document.createElement(tag);
        if (node.hasAttribute('href')) el.setAttribute('href', node.getAttribute('href'));
        if (node.hasAttribute('style')) {
          const style = node
            .getAttribute('style')
            .replace(/mso-[^:]+:[^;]+;?/gi, '')
            .replace(/\sclass=("|')?Mso.*?("|')/gi, '');
          if (style.trim()) el.setAttribute('style', style);
        }
        node.childNodes.forEach(child => {
          const cleaned = clean(child);
          if (cleaned) el.appendChild(cleaned);
        });
        return el;
      } else {
        const frag = document.createDocumentFragment();
        node.childNodes.forEach(child => {
          const cleaned = clean(child);
          if (cleaned) frag.appendChild(cleaned);
        });
        return frag;
      }
    }
    return null;
  }

  doc.body.childNodes.forEach(n => {
    const cleaned = clean(n);
    if (cleaned) fragment.appendChild(cleaned);
  });

  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment);
  return wrapper.innerHTML;
}

const MarkupEditor = React.forwardRef(({ value, onChange }, ref) => {
  const localRef = useRef(null);
  const editorRef = ref || localRef;

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      editorRef.current.innerHTML = value;
    }
  }, [value, editorRef]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editorRef]);

  const emitChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboard = e.clipboardData || window.clipboardData;
    const htmlData = clipboard.getData('text/html');
    const textData = clipboard.getData('text/plain');
    let clean = '';
    if (htmlData) {
      clean = sanitizeHtml(htmlData);
    } else {
      clean = textData
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n|\r|\n/g, '<br>');
    }
    document.execCommand('insertHTML', false, clean);
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={emitChange}
      onPaste={handlePaste}
      className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      style={{ minHeight: '200px', backgroundColor: '#fff', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      suppressContentEditableWarning
    />
  );
});

export default MarkupEditor;
