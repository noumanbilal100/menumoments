'use client';

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { stripPastedMarkup } from '@/lib/clean-html';
import { compressImage, extensionOf, formatBytes, renameFile, seoFileName } from './image-tools';
import { inputClass, labelClass } from './ui';

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

/** The image being added or edited in the details dialog. */
interface ImageDraft {
  target: { kind: 'new'; id: string } | { kind: 'edit'; img: HTMLImageElement };
  preview: string;
  alt: string;
  title: string;
  caption: string;
  /** Only for images that have not been uploaded yet; uploaded files keep their name. */
  pendingId?: string;
  fileName: string;
  fileNameTouched: boolean;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** The image together with a link wrapped around only it, which is what moves or goes as one. */
function unitOf(img: HTMLImageElement): HTMLElement {
  const parent = img.parentElement;
  return parent?.tagName === 'A' && parent.children.length === 1 ? parent : img;
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
  const [draft, setDraft] = useState<ImageDraft | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef(new Map<string, Pending>());
  const savedRange = useRef<Range | null>(null);

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

  /** Where the cursor was, so the image lands there after the dialog takes the focus. */
  function rememberCursor() {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    savedRange.current = range && editorRef.current?.contains(range.commonAncestorContainer) ? range.cloneRange() : null;
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
    setNotice('');
    setDraft({ target: { kind: 'new', id }, preview: url, alt: '', title: '', caption: '', pendingId: id, fileName: '', fileNameTouched: false });
  }

  function editImage(img: HTMLImageElement) {
    const pendingId = img.getAttribute('data-pending-id') ?? undefined;
    const file = pendingId ? pending.current.get(pendingId)?.file : undefined;
    setDraft({
      target: { kind: 'edit', img },
      preview: img.src,
      alt: img.getAttribute('alt') ?? '',
      title: img.getAttribute('title') ?? '',
      caption: img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ?? '',
      pendingId,
      fileName: file ? file.name.replace(/\.[a-z0-9]+$/i, '') : '',
      fileNameTouched: Boolean(file),
    });
  }

  function applyDraft() {
    if (!draft) return;
    const alt = draft.alt.trim();
    const title = draft.title.trim();
    const caption = draft.caption.trim();
    if (draft.pendingId) {
      const p = pending.current.get(draft.pendingId);
      const name = draft.fileNameTouched ? draft.fileName : alt;
      if (p) pending.current.set(draft.pendingId, { ...p, file: renameFile(p.file, name) });
    }

    if (draft.target.kind === 'new') {
      const img = `<img src="${draft.preview}" data-pending-id="${draft.target.id}" alt="${escapeAttr(alt)}"${title ? ` title="${escapeAttr(title)}"` : ''} />`;
      const html = caption ? `<figure class="wp-block-image">${img}<figcaption>${escapeText(caption)}</figcaption></figure><p><br></p>` : img;
      editorRef.current?.focus();
      const selection = window.getSelection();
      if (savedRange.current && selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange.current);
      }
      document.execCommand('insertHTML', false, html);
      const size = pending.current.get(draft.target.id)?.file.size ?? 0;
      setNotice(`Image added (${formatBytes(size)}). It uploads when you save.`);
    } else {
      const { img } = draft.target;
      img.setAttribute('alt', alt);
      if (title) img.setAttribute('title', title);
      else img.removeAttribute('title');
      const figure = img.closest('figure');
      if (caption) {
        let holder = figure;
        if (!holder) {
          holder = document.createElement('figure');
          holder.className = 'wp-block-image';
          const unit = unitOf(img);
          unit.replaceWith(holder);
          holder.appendChild(unit);
        }
        let figcaption = holder.querySelector('figcaption');
        if (!figcaption) {
          figcaption = document.createElement('figcaption');
          holder.appendChild(figcaption);
        }
        figcaption.textContent = caption;
      } else {
        figure?.querySelector('figcaption')?.remove();
      }
      setNotice('Image details updated.');
    }
    onChange?.();
    setDraft(null);
  }

  function removeDraftImage() {
    if (draft?.target.kind !== 'edit') return;
    const { img } = draft.target;
    const figure = img.closest('figure');
    if (figure && figure.querySelectorAll('img').length === 1) figure.remove();
    else unitOf(img).remove();
    onChange?.();
    setDraft(null);
    setNotice('Image removed.');
  }

  function cancelDraft() {
    // A new image that was never inserted is let go.
    if (draft?.target.kind === 'new') {
      URL.revokeObjectURL(draft.preview);
      pending.current.delete(draft.target.id);
    }
    setDraft(null);
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
    {
      label: 'Image',
      title: 'Insert image (click an image later to edit its alt text, title and caption)',
      run: () => {
        rememberCursor();
        fileRef.current?.click();
      },
    },
    { label: '―', title: 'Divider', run: () => exec('insertHorizontalRule') },
    { label: 'Clear', title: 'Clear formatting', run: () => exec('removeFormat') },
    { label: '↶', title: 'Undo', run: () => exec('undo') },
    { label: '↷', title: 'Redo', run: () => exec('redo') },
  ];

  const shownName = draft ? (draft.fileNameTouched ? draft.fileName : seoFileName(draft.alt)) : '';
  const pendingFile = draft?.pendingId ? pending.current.get(draft.pendingId)?.file : undefined;
  const ext = pendingFile ? extensionOf(pendingFile) || '.webp' : '';

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
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
              e.preventDefault();
              editImage(target as HTMLImageElement);
            }
          }}
          className="prose-article min-h-[420px] max-w-none px-5 py-4 outline-none sm:px-8 [&_img]:cursor-pointer [&_img:hover]:outline [&_img:hover]:outline-2 [&_img:hover]:outline-ember-400"
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

      <p className="border-t border-bone-200 px-4 py-2 text-xs text-char-200 dark:border-char-400">
        {notice || 'Click any image to edit its alt text, title and caption.'}
      </p>
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

      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-char-600/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image details"
          onKeyDown={(e) => {
            // Enter in a field would otherwise submit the whole post.
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault();
              if (draft.alt.trim()) applyDraft();
            }
            if (e.key === 'Escape') cancelDraft();
          }}
        >
          <div className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-bone-50 p-5 shadow-xl dark:bg-char-500">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.preview} alt="" className="h-20 w-28 shrink-0 rounded-lg bg-bone-100 object-cover" />
              <div>
                <p className="text-sm font-semibold">Image details</p>
                <p className="mt-1 text-xs leading-relaxed text-char-200">
                  Google reads the alt text, file name and caption to understand the picture and show it in image search.
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="img-alt" className={labelClass}>
                  Alt text (required)
                </label>
                <span className={`text-[11px] ${draft.alt.length > 125 ? 'text-amber-600' : 'text-char-200'}`}>{draft.alt.length}/125</span>
              </div>
              <textarea
                id="img-alt"
                autoFocus
                rows={2}
                value={draft.alt}
                onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
                placeholder="e.g. Breville Bambino espresso machine pulling a shot into a glass cup"
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-char-200">Say what the picture shows, in a sentence. Use the keyword only where it fits.</p>
            </div>
            <div>
              <label htmlFor="img-title" className={labelClass}>
                Title (optional, shown on hover)
              </label>
              <input id="img-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="img-caption" className={labelClass}>
                Caption (optional, shown under the image)
              </label>
              <input id="img-caption" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className={inputClass} />
            </div>
            {draft.pendingId && (
              <div>
                <label htmlFor="img-file" className={labelClass}>
                  File name
                </label>
                <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-bone-200 bg-bone-100 text-sm dark:border-char-400 dark:bg-char-400">
                  <input
                    id="img-file"
                    value={shownName}
                    onChange={(e) => setDraft({ ...draft, fileName: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'), fileNameTouched: true })}
                    placeholder="written-from-the-alt-text"
                    className="min-w-0 flex-1 bg-bone-50 px-3 py-2 text-char-500 outline-none dark:bg-char-600 dark:text-bone-50"
                  />
                  <span className="px-2 text-char-200">{ext}</span>
                </div>
                <p className="mt-1 text-[11px] text-char-200">Made from the alt text unless you change it.</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={applyDraft}
                disabled={!draft.alt.trim()}
                className="rounded-lg bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {draft.target.kind === 'new' ? 'Insert image' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancelDraft}
                className="rounded-lg border border-bone-200 px-4 py-2 text-sm text-char-300 dark:border-char-400 dark:text-bone-100"
              >
                Cancel
              </button>
              {draft.target.kind === 'edit' && (
                <button type="button" onClick={removeDraftImage} className="ml-auto text-xs font-medium text-red-600 hover:underline">
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
