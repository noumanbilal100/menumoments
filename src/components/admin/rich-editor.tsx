'use client';

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { stripPastedMarkup } from '@/lib/clean-html';
import { compressImage, formatBytes } from './image-tools';

export interface RichEditorHandle {
  /** HTML to save; images added here are `src="pending:<id>"`. */
  getHtml(): string;
  /** Files for the pending images still present in the content. */
  pendingFiles(): [string, File][];
}

interface Pending {
  file: File;
  url: string;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function RichEditor({
  initialHtml,
  handleRef,
  onChange,
}: {
  initialHtml: string;
  handleRef: Ref<RichEditorHandle>;
  onChange?: () => void;
}) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [source, setSource] = useState(initialHtml);
  const [notice, setNotice] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef(new Map<string, Pending>());

  function toVisual(html: string): string {
    return html.replace(/src="pending:([a-z0-9-]+)"/gi, (m, id: string) => {
      const p = pending.current.get(id);
      return p ? `src="${p.url}" data-pending-id="${id}"` : m;
    });
  }

  function fromVisual(): string {
    const el = editorRef.current;
    if (!el) return source;
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('img[data-pending-id]').forEach((img) => {
      img.setAttribute('src', `pending:${img.getAttribute('data-pending-id')}`);
      img.removeAttribute('data-pending-id');
    });
    return copy.innerHTML.trim();
  }

  function currentHtml(): string {
    return mode === 'html' ? source : fromVisual();
  }

  useImperativeHandle(handleRef, () => ({
    getHtml: currentHtml,
    pendingFiles: () => {
      const html = currentHtml();
      return [...pending.current.entries()]
        .filter(([id]) => html.includes(`pending:${id}`))
        .map(([id, p]) => [id, p.file]);
    },
  }));

  useEffect(() => {
    if (mode === 'visual' && editorRef.current) editorRef.current.innerHTML = toVisual(source);
    // Only when switching into visual mode; typing must not reset the DOM.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function switchMode(next: 'visual' | 'html') {
    if (next === mode) return;
    if (next === 'html') setSource(fromVisual());
    setMode(next);
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    onChange?.();
  }

  function addLink() {
    const url = window.prompt('Link address (https://… or /a-post/)');
    if (!url) return;
    if (/^\s*javascript:/i.test(url)) return;
    exec('createLink', url.trim());
  }

  async function addImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice('That file is not an image.');
      return;
    }
    setNotice('Preparing image…');
    const { file: small } = await compressImage(file);
    const id = Math.random().toString(36).slice(2, 10);
    const url = URL.createObjectURL(small);
    pending.current.set(id, { file: small, url });
    const alt = window.prompt('Describe the image (alt text, for SEO and screen readers)') ?? '';
    exec('insertHTML', `<img src="${url}" data-pending-id="${id}" alt="${escapeAttr(alt)}" />`);
    setNotice(`Image added (${formatBytes(small.size)}). It uploads when you save.`);
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const html = e.clipboardData.getData('text/html');
    if (!html) return;
    e.preventDefault();
    const cleaned = stripPastedMarkup(
      html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<\/?(meta|html|head|body|style|script)[^>]*>/gi, '')
        .replace(/\sstyle=("[^"]*"|'[^']*')/gi, '')
        .replace(/\sdata-[a-z-]+=("[^"]*"|'[^']*')/gi, ''),
    );
    document.execCommand('insertHTML', false, cleaned);
    onChange?.();
  }

  const btn =
    'rounded-md px-2 py-1 text-xs font-medium text-char-300 hover:bg-bone-100 hover:text-char-500 dark:text-bone-100 dark:hover:bg-char-400';
  const tools: { label: string; title: string; run: () => void }[] = [
    { label: 'P', title: 'Paragraph', run: () => exec('formatBlock', '<p>') },
    { label: 'H2', title: 'Section heading', run: () => exec('formatBlock', '<h2>') },
    { label: 'H3', title: 'Sub-heading', run: () => exec('formatBlock', '<h3>') },
    { label: 'B', title: 'Bold', run: () => exec('bold') },
    { label: 'I', title: 'Italic', run: () => exec('italic') },
    { label: '• List', title: 'Bulleted list', run: () => exec('insertUnorderedList') },
    { label: '1. List', title: 'Numbered list', run: () => exec('insertOrderedList') },
    { label: '❝ Quote', title: 'Quote', run: () => exec('formatBlock', '<blockquote>') },
    { label: 'Link', title: 'Add link to the selected text', run: addLink },
    { label: 'Unlink', title: 'Remove link', run: () => exec('unlink') },
    { label: 'Image', title: 'Insert image', run: () => fileRef.current?.click() },
    { label: '―', title: 'Divider', run: () => exec('insertHorizontalRule') },
    { label: 'Clear', title: 'Clear formatting', run: () => exec('removeFormat') },
    { label: '↶', title: 'Undo', run: () => exec('undo') },
    { label: '↷', title: 'Redo', run: () => exec('redo') },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-bone-200 bg-bone-50 dark:border-char-400 dark:bg-char-500">
      <div className="flex flex-wrap items-center gap-1 border-b border-bone-200 bg-bone-100/70 px-2 py-1.5 dark:border-char-400 dark:bg-char-400/40">
        {mode === 'visual' &&
          tools.map((t) => (
            <button
              key={t.title}
              type="button"
              title={t.title}
              className={btn}
              onMouseDown={(e) => e.preventDefault()}
              onClick={t.run}
            >
              {t.label}
            </button>
          ))}
        <div className="ml-auto flex rounded-lg border border-bone-200 bg-bone-50 p-0.5 dark:border-char-400 dark:bg-char-500">
          {(['visual', 'html'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                mode === m ? 'bg-char-500 text-white dark:bg-bone-50 dark:text-char-600' : 'text-char-300 dark:text-bone-100'
              }`}
            >
              {m === 'visual' ? 'Visual' : 'HTML'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onChange?.()}
          onPaste={onPaste}
          className="prose-article min-h-[420px] max-w-none px-5 py-4 outline-none sm:px-8"
          aria-label="Content"
        />
      ) : (
        <textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            onChange?.();
          }}
          spellCheck={false}
          className="block min-h-[420px] w-full resize-y bg-transparent px-4 py-3 font-mono text-xs leading-relaxed text-char-500 outline-none dark:text-bone-50"
          aria-label="Content HTML"
        />
      )}

      {notice && (
        <p className="border-t border-bone-200 px-4 py-2 text-xs text-char-200 dark:border-char-400">{notice}</p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void addImage(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
