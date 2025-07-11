import React, { useEffect, useRef } from 'react';

// Basic HTML sanitizer keeping common formatting tags
const sanitizeHtml = (html) => {
  const ALLOWED_TAGS = [
    'b', 'i', 'u', 'strong', 'em', 'p', 'div', 'span', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'code', 'a'
  ];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const frag = document.createDocumentFragment();

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (ALLOWED_TAGS.includes(tag)) {
        const el = document.createElement(tag);
        if (tag === 'a' && node.getAttribute('href')) {
          el.setAttribute('href', node.getAttribute('href'));
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
        if (node.getAttribute('style')) {
          el.setAttribute('style', node.getAttribute('style'));
        }
        node.childNodes.forEach((child) => {
          const cleaned = cleanNode(child);
          if (cleaned) el.appendChild(cleaned);
        });
        return el;
      }
      // flatten children of disallowed tags
      const container = document.createDocumentFragment();
      node.childNodes.forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) container.appendChild(cleaned);
      });
      return container;
    }
    return null;
  };

  Array.from(doc.body.childNodes).forEach((n) => {
    const cleaned = cleanNode(n);
    if (cleaned) frag.appendChild(cleaned);
  });

  const wrapper = document.createElement('div');
  wrapper.appendChild(frag);
  return wrapper.innerHTML.replace(/(<br\s*\/?>\s*){2,}/gi, '<br>');
};

// Remove MS Word specific markup and normalize
const cleanPastedContent = (html) => {
  if (!html) return '';
  let cleaned = html
    .replace(/<!--StartFragment-->|<!--EndFragment-->/gi, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(\/?o:p)[^>]*>/gi, '')
    .replace(/\sclass=("|')?Mso.*?("|')/gi, '')
    .replace(/\s*mso-[^:]+:[^;"']+;?/gi, '');

  const doc = new DOMParser().parseFromString(cleaned, 'text/html');
  const body = doc.body || doc;

  body.querySelectorAll('[style]').forEach((el) => {
    const style = el.getAttribute('style')
      .replace(/mso-[^:]+:[^;]+;?/gi, '')
      .replace(/margin[^:]*:[^;]+;?/gi, '')
      .replace(/padding[^:]*:[^;]+;?/gi, '');
    if (style.trim()) {
      el.setAttribute('style', style.trim());
    } else {
      el.removeAttribute('style');
    }
  });

  return sanitizeHtml(body.innerHTML || '').trim();
};

const MarkupEditor = React.forwardRef(({ initialHTML, onChange }, ref) => {
  const localRef = useRef(null);
  const editorRef = ref || localRef;

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHTML || '';
      setTimeout(() => editorRef.current && editorRef.current.focus(), 0);
    }
  }, [initialHTML, editorRef]);

  const emitChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboard = e.clipboardData || window.clipboardData;
    const htmlData = clipboard.getData('text/html');
    const textData = clipboard.getData('text/plain');
    let clean;
    if (htmlData) {
      clean = cleanPastedContent(htmlData);
    } else {
      clean = textData
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n|\r|\n/g, '<br>');
    }
    document.execCommand('insertHTML', false, clean);
    emitChange();
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={emitChange}
      onPaste={handlePaste}
      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{ minHeight: '150px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}
      suppressContentEditableWarning
    />
  );
});

export default MarkupEditor;
