'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isAdminAuthorization } from '@/lib/admin-auth';
import {
  ValidationError,
  deletePage,
  deletePost,
  loadPage,
  loadPost,
  savePage,
  savePost,
} from '@/lib/cms/content';
import { StoreNotConfiguredError, storeMode } from '@/lib/cms/store';

export interface ActionState {
  ok: boolean;
  message: string;
}

async function assertAdmin(): Promise<void> {
  const h = await headers();
  if (!isAdminAuthorization(h.get('authorization'))) throw new Error('Unauthorized');
}

function savedMessage(what: string): string {
  return storeMode() === 'github'
    ? `${what} saved. The live site picks it up after Cloudflare rebuilds it, usually within a few minutes.`
    : `${what} saved.`;
}

function failure(err: unknown): ActionState {
  if (err instanceof ValidationError || err instanceof StoreNotConfiguredError) {
    return { ok: false, message: err.message };
  }
  console.error('[admin] save failed', err);
  return { ok: false, message: `Could not save: ${err instanceof Error ? err.message : String(err)}` };
}

export async function savePostAction(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await assertAdmin();
  const existingSlug = String(form.get('existingSlug') ?? '');
  let created: { slug: string } | null = null;
  try {
    const existing = existingSlug ? await loadPost(existingSlug) : null;
    if (existingSlug && !existing) return { ok: false, message: 'This post no longer exists.' };
    const result = await savePost(form, existing);
    if (!existing) created = result;
    revalidatePath('/admin', 'layout');
  } catch (err) {
    return failure(err);
  }
  if (created) redirect(`/admin/posts/${created.slug}/edit/?saved=1`);
  return { ok: true, message: savedMessage('Post') };
}

export async function deletePostAction(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await assertAdmin();
  const slug = String(form.get('slug') ?? '');
  try {
    await deletePost(slug);
    revalidatePath('/admin', 'layout');
  } catch (err) {
    return failure(err);
  }
  redirect(`/admin/posts/?deleted=${encodeURIComponent(slug)}`);
}

export async function savePageAction(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await assertAdmin();
  const existingSlug = String(form.get('existingSlug') ?? '');
  let created: { slug: string } | null = null;
  try {
    const existing = existingSlug ? await loadPage(existingSlug) : null;
    if (existingSlug && !existing) return { ok: false, message: 'This page no longer exists.' };
    const result = await savePage(form, existing);
    if (!existing) created = result;
    revalidatePath('/admin', 'layout');
  } catch (err) {
    return failure(err);
  }
  if (created) redirect(`/admin/pages/${created.slug}/edit/?saved=1`);
  return { ok: true, message: savedMessage('Page') };
}

export async function deletePageAction(_prev: ActionState | null, form: FormData): Promise<ActionState> {
  await assertAdmin();
  const slug = String(form.get('slug') ?? '');
  try {
    await deletePage(slug);
    revalidatePath('/admin', 'layout');
  } catch (err) {
    return failure(err);
  }
  redirect(`/admin/pages/?deleted=${encodeURIComponent(slug)}`);
}
