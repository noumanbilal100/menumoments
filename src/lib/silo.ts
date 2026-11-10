import { getCategory, hubForSection, type Category } from '@/data/taxonomy';

/**
 * Breadcrumb trails through the silo (see SECTION_HUBS in data/taxonomy.ts):
 * Home › section hub › category › post. The visible breadcrumb and the
 * BreadcrumbList markup are both built from these, so they always agree.
 */
export interface Crumb {
  name: string;
  path: string;
}

/** Home › hub › category, with the hub left out when the category is the hub itself. */
export function categoryTrail(cat: { slug: string; name: string; section: Category['section'] }): Crumb[] {
  const hub = hubForSection(cat.section);
  const crumbs: Crumb[] = [{ name: 'Home', path: '/' }];
  if (hub.slug !== cat.slug) crumbs.push({ name: hub.title, path: `/category/${hub.slug}/` });
  crumbs.push({ name: hub.slug === cat.slug ? hub.title : cat.name, path: `/category/${cat.slug}/` });
  return crumbs;
}

/** Home › hub › main category › post. */
export function postTrail(post: { slug: string; title: string; categories: string[] }): Crumb[] {
  const cat = post.categories[0] ? getCategory(post.categories[0]) : undefined;
  return [...(cat ? categoryTrail(cat) : [{ name: 'Home', path: '/' }]), { name: post.title, path: `/${post.slug}/` }];
}
