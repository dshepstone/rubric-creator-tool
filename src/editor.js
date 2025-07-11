import React, { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Eraser
} from 'lucide-react';

// Sanitize pasted HTML, keeping only allowed tags and flattening everything else
const sanitizeHtml = (html) => {
  const ALLOWED_TAGS = [
    'b',
    'i',
    'u',
    'strong',
    'em',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'code',
    'a'
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

        node.childNodes.forEach((child) => {
          const cleaned = cleanNode(child);
          if (cleaned) el.appendChild(cleaned);
        });

        return el;
      }

      // Flatten children of disallowed tags
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

// Remove Microsoft Word specific markup and normalize blocks
const cleanPastedContent = (html) => {
  if (!html) return '';

  let cleaned = html
    .replace(/<!--StartFragment-->|<!--EndFragment-->/gi, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(\/)?o:p[^>]*>/gi, '')
    .replace(/\sclass=("|')?Mso.*?("|')/gi, '')
    .replace(/\s*mso-[^:]+:[^;"']+;?/gi, '');

  const doc = new DOMParser().parseFromString(cleaned, 'text/html');

  doc.querySelectorAll('[style]').forEach((el) => {
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

  // Replace <p> with <div> to avoid Word margins
  doc.querySelectorAll('p').forEach((p) => {
    const div = doc.createElement('div');
    div.innerHTML = p.innerHTML;
    p.replaceWith(div);
  });

  return sanitizeHtml(doc.body.innerHTML)
    .replace(/(<div>\s*<br>\s*<\/div>)+/gi, '<br>')
    .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>');
};

const ToolbarButton = ({ icon: Icon, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-1 hover:bg-gray-200 rounded"
  >
    <Icon size={16} />
  </button>
);

const MarkupEditor = React.forwardRef(({ initialHTML, onChange }, ref) => {
  const localRef = useRef(null);
  const editorRef = ref || localRef;

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHTML || '';
      // focus after mount
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

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    emitChange();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 mb-2 overflow-x-auto">
        <ToolbarButton icon={Bold} onClick={() => exec('bold')} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => exec('italic')} title="Italic" />
        <ToolbarButton icon={Underline} onClick={() => exec('underline')} title="Underline" />
        <ToolbarButton icon={Strikethrough} onClick={() => exec('strikeThrough')} title="Strikethrough" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={Heading1} onClick={() => exec('formatBlock', 'h1')} title="Heading 1" />
        <ToolbarButton icon={Heading2} onClick={() => exec('formatBlock', 'h2')} title="Heading 2" />
        <ToolbarButton icon={Heading3} onClick={() => exec('formatBlock', 'h3')} title="Heading 3" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} title="Bulleted List" />
        <ToolbarButton icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Numbered List" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={LinkIcon} onClick={() => { const url = prompt('Enter URL'); if (url) exec('createLink', url); }} title="Link" />
        <ToolbarButton icon={Undo2} onClick={() => exec('undo')} title="Undo" />
        <ToolbarButton icon={Redo2} onClick={() => exec('redo')} title="Redo" />
        <ToolbarButton icon={Eraser} onClick={() => exec('removeFormat')} title="Clear Formatting" />
      </div>
      <style>{`
        .rich-text-editor h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        .rich-text-editor h2 { font-size: 1.3em; font-weight: bold; margin: 0.4em 0; }
        .rich-text-editor h3 { font-size: 1.1em; font-weight: bold; margin: 0.3em 0; }
        .rich-text-editor p { margin: 0.5em 0; }
        .rich-text-editor ul, .rich-text-editor ol { margin: 0.5em 0; padding-left: 1.5em; }
        .rich-text-editor li { margin: 0.2em 0; }
        .rich-text-editor blockquote {
          margin: 0.5em 0;
          padding: 0.5em 1em;
          border-left: 4px solid #e5e7eb;
          background: #f9fafb;
          font-style: italic;
        }
        .rich-text-editor pre {
          background: #f3f4f6;
          padding: 0.5em;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
          white-space: pre-wrap;
        }
        .rich-text-editor a { color: #3b82f6; text-decoration: underline; }
        .rich-text-editor hr { margin: 1em 0; border: none; border-top: 1px solid #d1d5db; }
        .rich-text-editor br { line-height: 1.8; }
      `}</style>
      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onPaste={handlePaste}
        className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rich-text-editor"
        style={{
          minHeight: '150px',
          backgroundColor: '#fff',
          fontSize: '14px',
          lineHeight: '1.8',
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
});

export default MarkupEditor;
