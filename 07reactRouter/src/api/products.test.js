import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './products'

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('product API client', () => {
  it('loads the saved product collection and validates its response', async () => {
    const products = [{ id: 'item-1', name: 'Table lamp' }]
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(products))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getProducts()).resolves.toEqual(products)
    expect(fetchMock).toHaveBeenCalledWith('/api/products')

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'not a list' }))
    await expect(getProducts()).rejects.toThrow(
      'The product API returned an invalid response.'
    )
  })

  it('creates, loads, and updates products through the API', async () => {
    const product = { name: 'Ceramic mug', price: 500 }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(product, 201))
      .mockResolvedValueOnce(jsonResponse({ ...product, id: 'item 1' }))
      .mockResolvedValueOnce(jsonResponse({ ...product, price: 600 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createProduct(product)).resolves.toEqual(product)
    await expect(getProduct('item 1')).resolves.toEqual({
      ...product,
      id: 'item 1',
    })
    await expect(updateProduct('item 1', { ...product, price: 600 })).resolves
      .toEqual({ ...product, price: 600 })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/products',
      '/api/products/item%201',
      '/api/products/item%201',
    ])
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    expect(fetchMock.mock.calls[2][1].method).toBe('PUT')
  })

  it('deletes products and reports API errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse({ error: 'Product not found.' }, 404))
    vi.stubGlobal('fetch', fetchMock)

    await expect(deleteProduct('item-1')).resolves.toEqual({ success: true })
    expect(fetchMock.mock.calls[0]).toEqual([
      '/api/products/item-1',
      { method: 'DELETE' },
    ])
    await expect(getProduct('missing')).rejects.toThrow('Product not found.')
  })
})
