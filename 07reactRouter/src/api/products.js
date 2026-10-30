async function readResponse(response) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'The product request failed.')
  }

  return data
}

export async function getProducts() {
  const products = await readResponse(await fetch('/api/products'))

  if (!Array.isArray(products)) {
    throw new Error('The product API returned an invalid response.')
  }

  return products
}

export async function getProduct(id) {
  return readResponse(await fetch(`/api/products/${encodeURIComponent(id)}`))
}

export async function createProduct(product) {
  return readResponse(
    await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
  )
}

export async function updateProduct(id, product) {
  return readResponse(
    await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
  )
}

export async function deleteProduct(id) {
  return readResponse(
    await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  )
}
