/** @jest-environment node */

import { NextRequest } from 'next/server';
import { GET as getCatalog } from '@/app/api/resources/catalog/route';
import { GET as getSearch } from '@/app/api/resources/search/route';
import { GET as getItem } from '@/app/api/resources/item/[slug]/route';
import { GET as getSource } from '@/app/api/resources/sources/[id]/route';

describe('resources api contract', () => {
  it('catalog returns expected top-level shape', async () => {
    const req = new NextRequest('http://localhost/api/resources/catalog?locale=tr&page=1&pageSize=5');
    const res = await getCatalog(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.items)).toBe(true);
    expect(typeof json.total).toBe('number');
    expect(typeof json.page).toBe('number');
    expect(typeof json.pageSize).toBe('number');
    expect(typeof json.totalPages).toBe('number');
    expect(typeof json.meta).toBe('object');
    expect(Array.isArray(json.meta.routinePackages)).toBe(true);
    expect(Array.isArray(json.meta.weeklyPresets)).toBe(true);
  });

  it('search returns filtered shape', async () => {
    const req = new NextRequest('http://localhost/api/resources/search?q=subhanallah&locale=en');
    const res = await getSearch(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json.items)).toBe(true);
  });

  it('item endpoint returns 404 for missing slug', async () => {
    const req = new NextRequest('http://localhost/api/resources/item/not-found?locale=tr');
    const res = await getItem(req, { params: Promise.resolve({ slug: 'not-found' }) });

    expect(res.status).toBe(404);
  });

  it('source endpoint returns 404 for missing source id', async () => {
    const req = new NextRequest('http://localhost/api/resources/sources/not-found');
    const res = await getSource(req, { params: Promise.resolve({ id: 'not-found' }) });

    expect(res.status).toBe(404);
  });
});
