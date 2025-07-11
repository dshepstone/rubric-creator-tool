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
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
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
    'div',
    'span',
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

        if (node.getAttribute('style')) {
          el.setAttribute('style', node.getAttribute('style'));
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

  return sanitizeHtml(body.innerHTML || '')
    .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
    .trim();
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

const RichTextEditor = React.forwardRef(({ initialHTML, onChange }, ref) => {
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
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 mb-1 overflow-x-auto">
        <ToolbarButton icon={Bold} onClick={() => exec('bold')} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => exec('italic')} title="Italic" />
        <ToolbarButton icon={Underline} onClick={() => exec('underline')} title="Underline" />
        <ToolbarButton icon={Strikethrough} onClick={() => exec('strikeThrough')} title="Strikethrough" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={Heading1} onClick={() => exec('formatBlock', 'h1')} title="Heading 1" />
        <ToolbarButton icon={Heading2} onClick={() => exec('formatBlock', 'h2')} title="Heading 2" />
        <ToolbarButton icon={Heading3} onClick={() => exec('formatBlock', 'h3')} title="Heading 3" />
        <span className="mx-1 border-l border-gray-300" />
        <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="w-8 h-8 border rounded cursor-pointer" title="Text Color" />
        <input type="color" onChange={(e) => exec('hiliteColor', e.target.value)} className="w-8 h-8 border rounded cursor-pointer ml-1" title="Highlight" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={List} onClick={() => exec('insertUnorderedList')} title="Bulleted List" />
        <ToolbarButton icon={ListOrdered} onClick={() => exec('insertOrderedList')} title="Numbered List" />
        <ToolbarButton icon={Outdent} onClick={() => exec('outdent')} title="Decrease Indent" />
        <ToolbarButton icon={Indent} onClick={() => exec('indent')} title="Increase Indent" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={AlignLeft} onClick={() => exec('justifyLeft')} title="Align Left" />
        <ToolbarButton icon={AlignCenter} onClick={() => exec('justifyCenter')} title="Align Center" />
        <ToolbarButton icon={AlignRight} onClick={() => exec('justifyRight')} title="Align Right" />
        <ToolbarButton icon={AlignJustify} onClick={() => exec('justifyFull')} title="Justify" />
        <span className="mx-1 border-l border-gray-300" />
        <ToolbarButton icon={LinkIcon} onClick={() => { const url = prompt('Enter URL'); if (url) exec('createLink', url); }} title="Link" />
        <ToolbarButton icon={Undo2} onClick={() => exec('undo')} title="Undo" />
        <ToolbarButton icon={Redo2} onClick={() => exec('redo')} title="Redo" />
        <ToolbarButton icon={Eraser} onClick={() => exec('removeFormat')} title="Clear Formatting" />
      </div>
      <div className="flex flex-wrap gap-1 text-xs mb-2 px-2">
        <span className="text-gray-600 mr-2">Quick Insert:</span>
        <button type="button" onClick={() => exec('insertHTML', '<strong>Example:</strong> ')} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">Example</button>
        <button type="button" onClick={() => exec('insertHTML', '<em>Note:</em> ')} className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded">Note</button>
        <button type="button" onClick={() => exec('insertHTML', '<strong>Requirements:</strong><br>• <br>• <br>• ')} className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded">Requirements</button>
        <button type="button" onClick={() => { if (editorRef.current) { editorRef.current.innerHTML = ''; emitChange(); } }} className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded">Clear All</button>
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

export default RichTextEditor;
