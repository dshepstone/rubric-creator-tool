
// editor.js (fixed) – waits for the #editor element before attaching paste handler safely
(function() {
    function attachPasteHandler(editorElement) {
        // Only attach once
        if (editorElement._pasteHandlerAttached) return;
        editorElement._pasteHandlerAttached = true;

        editorElement.addEventListener('paste', function(e) {
            e.preventDefault();

            const clipboard = (e.clipboardData || window.clipboardData);
            const htmlData = clipboard.getData('text/html');
            const textData = clipboard.getData('text/plain');

            let clean;
            if (htmlData) {
                clean = sanitizeHtml(htmlData);
            } else {
                clean = textData
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\r?\n/g, '<br>');
            }
            document.execCommand('insertHTML', false, clean);
        });

        function sanitizeHtml(html) {
            const ALLOWED_TAGS = ['b','i','u','strong','em','p','br','ul','ol','li'];
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const frag = document.createDocumentFragment();

            function cleanNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    return document.createTextNode(node.textContent);
                }
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = node.tagName.toLowerCase();
                    if (ALLOWED_TAGS.includes(tag)) {
                        const el = document.createElement(tag);
                        node.childNodes.forEach(child => {
                            const cn = cleanNode(child);
                            if (cn) el.appendChild(cn);
                        });
                        return el;
                    } else {
                        const container = document.createDocumentFragment();
                        node.childNodes.forEach(child => {
                            const cn = cleanNode(child);
                            if (cn) container.appendChild(cn);
                        });
                        return container;
                    }
                }
                return null;
            }

            Array.from(doc.body.childNodes).forEach(n => {
                const cleaned = cleanNode(n);
                if (cleaned) frag.appendChild(cleaned);
            });

            const wrapper = document.createElement('div');
            wrapper.appendChild(frag);
            return wrapper.innerHTML;
        }
    }

    function initEditor() {
        const editorEl = document.getElementById('editor');
        if (editorEl) {
            attachPasteHandler(editorEl);
        }
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditor);
    } else {
        initEditor();
    }

    // Watch for dynamically added editors
    const observer = new MutationObserver((mutations, obs) => {
        if (document.getElementById('editor')) {
            initEditor();
            obs.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
