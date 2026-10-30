/* eslint-env node */
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))
const productsFile = path.join(projectDirectory, 'product.json')
const port = Number(process.env.API_PORT || 3001)
const maximumRequestSize = 1024 * 1024


function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end(JSON.stringify(data))
}

async function readProducts() {
  const contents = await readFile(productsFile, 'utf8')
  const products = JSON.parse(contents)

  if (!Array.isArray(products)) {
    throw new Error('product.json must contain a JSON array.')
  }

  return products
}

async function writeProducts(products) {
  await writeFile(productsFile, `${JSON.stringify(products, null, 2)}\n`, 'utf8')
}

async function readRequestBody(request) {
  let body = ''

  for await (const chunk of request) {
    body += chunk
    if (Buffer.byteLength(body) > maximumRequestSize) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      throw error
    }
  }

  return JSON.parse(body)
}

function validateProduct(input, existingProduct = null) {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const link = typeof input.link === 'string' ? input.link.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const price = Number(input.price)

  if (!name || name.length > 120) {
    return { error: 'Product name is required and must be 120 characters or fewer.' }
  }
  if (!description || description.length > 3000) {
    return { error: 'Description is required and must be 3000 characters or fewer.' }
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Enter a valid non-negative price.' }
  }

  try {
    const url = new URL(link)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { error: 'Product link must use http or https.' }
    }
  } catch {
    return { error: 'Enter a valid product URL.' }
  }

  const now = new Date().toISOString()

  if (existingProduct) {
    return {
      product: {
        ...existingProduct,
        name,
        link,
        description,
        price,
        updatedAt: now,
      },
    }
  }

  return {
    product: {
      id: randomUUID(),
      name,
      link,
      description,
      price,
      createdAt: now,
    },
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost')
  const pathname = url.pathname

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    response.end()
    return
  }

  // Route: /api/products
  if (pathname === '/api/products') {
    if (request.method === 'GET') {
      try {
        const products = await readProducts()
        sendJson(response, 200, products)
      } catch (error) {
        console.error('Unable to read product.json:', error)
        sendJson(response, 500, { error: 'Unable to load saved products.' })
      }
      return
    }

    if (request.method === 'POST') {
      let input
      try {
        input = await readRequestBody(request)
      } catch (error) {
        sendJson(response, error.statusCode || 400, {
          error: error.statusCode === 413 ? error.message : 'Request body must contain valid JSON.',
        })
        return
      }

      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        sendJson(response, 400, { error: 'Product data must be a JSON object.' })
        return
      }

      const validation = validateProduct(input)
      if (validation.error) {
        sendJson(response, 400, { error: validation.error })
        return
      }

      try {
        const products = await readProducts()
        products.push(validation.product)
        await writeProducts(products)
        sendJson(response, 201, validation.product)
      } catch (error) {
        console.error('Unable to save product to product.json:', error)
        sendJson(response, 500, { error: 'Unable to save the product.' })
      }
      return
    }

    response.setHeader('Allow', 'GET, POST')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  // Route: /api/products/:id
  const itemMatch = pathname.match(/^\/api\/products\/([^/]+)$/)
  if (itemMatch) {
    const productId = decodeURIComponent(itemMatch[1])

    if (request.method === 'GET') {
      try {
        const products = await readProducts()
        const product = products.find((item) => item.id === productId)
        if (!product) {
          sendJson(response, 404, { error: 'Product not found.' })
          return
        }
        sendJson(response, 200, product)
      } catch (error) {
        console.error('Unable to read product.json:', error)
        sendJson(response, 500, { error: 'Unable to load product.' })
      }
      return
    }

    if (request.method === 'PUT') {
      let input
      try {
        input = await readRequestBody(request)
      } catch (error) {
        sendJson(response, error.statusCode || 400, {
          error: error.statusCode === 413 ? error.message : 'Request body must contain valid JSON.',
        })
        return
      }

      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        sendJson(response, 400, { error: 'Product data must be a JSON object.' })
        return
      }

      try {
        const products = await readProducts()
        const index = products.findIndex((item) => item.id === productId)
        if (index === -1) {
          sendJson(response, 404, { error: 'Product not found to update.' })
          return
        }

        const existing = products[index]
        const validation = validateProduct(input, existing)
        if (validation.error) {
          sendJson(response, 400, { error: validation.error })
          return
        }

        products[index] = validation.product
        await writeProducts(products)
        sendJson(response, 200, validation.product)
      } catch (error) {
        console.error('Unable to update product in product.json:', error)
        sendJson(response, 500, { error: 'Unable to update the product.' })
      }
      return
    }

    if (request.method === 'DELETE') {
      try {
        const products = await readProducts()
        const index = products.findIndex((item) => item.id === productId)
        if (index === -1) {
          sendJson(response, 404, { error: 'Product not found to delete.' })
          return
        }

        const [deleted] = products.splice(index, 1)
        await writeProducts(products)
        sendJson(response, 200, {
          success: true,
          message: 'Product deleted successfully.',
          id: deleted.id,
        })
      } catch (error) {
        console.error('Unable to delete product from product.json:', error)
        sendJson(response, 500, { error: 'Unable to delete the product.' })
      }
      return
    }

    response.setHeader('Allow', 'GET, PUT, DELETE')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  sendJson(response, 404, { error: 'Endpoint not found.' })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Product API listening on http://127.0.0.1:${port}`)
})
