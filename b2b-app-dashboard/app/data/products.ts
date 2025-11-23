// np. /data/products.ts albo na razie w [slug].vue

export const allProducts = [
  {
    id: 1,
    name: 'Doniczka Classic 12 cm',
    sku: 'CL-12-BR',
    image: '/img/series/oslonka.jpg',
    diameter: '12 cm',
    height: '10 cm',
    color: 'Brąz',
    packSize: 20,
    priceNet: 1.25,
    seriesSlug: 'seria-classic'
  },
  {
    id: 2,
    name: 'Doniczka Classic 16 cm',
    sku: 'CL-16-BR',
    image: '/img/series/oslonka.jpg',
    diameter: '16 cm',
    height: '14 cm',
    color: 'Brąz',
    packSize: 15,
    priceNet: 1.95,
    seriesSlug: 'seria-classic'
  },
  {
    id: 3,
    name: 'Doniczka Premium 14 cm',
    sku: 'PR-14-AN',
    image: '/img/series/oslonka.jpg',
    diameter: '14 cm',
    height: '12 cm',
    color: 'Antracyt',
    packSize: 10,
    priceNet: 2.40,
    seriesSlug: 'seria-premium'
  }
]

export const allSeries = [
  { slug: 'seria-classic', name: 'Seria Classic' },
  { slug: 'seria-premium', name: 'Seria Premium' },
  { slug: 'seria-eco-line', name: 'Seria Eco Line' },
  { slug: 'seria-xxl', name: 'Seria XXL' }
]
