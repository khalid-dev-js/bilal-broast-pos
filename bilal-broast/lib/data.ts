export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  image: string
  ingredients: string[]
  isPopular?: boolean
  isDeal?: boolean
}

export type CartLine = Product & { quantity: number }

export type Order = {
  id: string
  customerName: string
  phone: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  address: string
  deliveryInstructions: string
  location?: { latitude: number; longitude: number }
  status: 'New' | 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
  createdAt: string
}

export const categories = [
  { name: 'Broast', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=85' },
  { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85' },
  { name: 'Chicken', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85' },
  { name: 'Fries', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85' },
  { name: 'Deals', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85' },
  { name: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85' },
]

export const products: Product[] = [
  { id: '1', slug: 'signature-broast', name: 'Signature Broast', description: 'Golden, crunchy chicken marinated in our secret spice blend.', price: 690, category: 'Broast', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=85', ingredients: ['Crispy chicken', 'Signature herbs', 'Coleslaw', 'Fries'], isPopular: true },
  { id: '2', slug: 'zinger-burger', name: 'BB Zinger Burger', description: 'Crispy chicken, creamy mayo and fresh lettuce in a toasted bun.', price: 520, originalPrice: 590, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85', ingredients: ['Chicken fillet', 'Lettuce', 'Mayo', 'Sesame bun'], isPopular: true, isDeal: true },
  { id: '3', slug: 'malai-tikka', name: 'Malai Tikka', description: 'Tender boneless chicken, delicately seasoned and char-grilled.', price: 780, category: 'Chicken', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1200&q=85', ingredients: ['Boneless chicken', 'Creamy marinade', 'Charred peppers'], isPopular: true },
  { id: '4', slug: 'family-feast', name: 'Family Feast', description: 'A generous spread for sharing, with all the Bilal Broast favourites.', price: 1890, originalPrice: 2190, category: 'Deals', image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85', ingredients: ['8 pc chicken', '2 burgers', 'Fries', 'Drinks'], isDeal: true },
  { id: '5', slug: 'masala-fries', name: 'Masala Fries', description: 'Crisp fries tossed in our bold house masala.', price: 260, category: 'Fries', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=85', ingredients: ['Potatoes', 'House masala', 'Chaat seasoning'] },
  { id: '6', slug: 'crunchy-wings', name: 'Crunchy Wings', description: 'Juicy wings with an irresistible peppery crunch.', price: 480, category: 'Chicken', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1200&q=85', ingredients: ['Chicken wings', 'Pepper spice', 'Crispy coating'] },
  { id: '7', slug: 'mint-margarita', name: 'Mint Margarita', description: 'Cool, fizzy and freshly blended with mint and lime.', price: 220, category: 'Drinks', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=85', ingredients: ['Fresh mint', 'Lime', 'Soda'] },
  { id: '8', slug: 'weekend-box', name: 'Weekend Box', description: 'The perfect solo feast for a proper comfort-food craving.', price: 990, originalPrice: 1150, category: 'Deals', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=85', ingredients: ['2 pc chicken', 'Zinger burger', 'Fries', 'Drink'], isDeal: true },
]

export const mockOrders: Order[] = [
  { id: 'BB-1048', customerName: 'Ayesha Khan', phone: '+92 300 1234567', items: [{ name: 'Signature Broast', quantity: 2, price: 690 }, { name: 'Mint Margarita', quantity: 2, price: 220 }], total: 1820, address: 'Shop No. 12, Jamia Masjid, Jamshed Quarter Rd, Jamshed Quarters Allama Binori Town, Karachi, Pakistan', deliveryInstructions: 'Please call on arrival.', status: 'Preparing', createdAt: 'Today, 12:42 PM' },
  { id: 'BB-1047', customerName: 'Hamza Ahmed', phone: '+92 321 9876543', items: [{ name: 'Family Feast', quantity: 1, price: 1890 }], total: 1890, address: 'Jamshed Quarters, Karachi, Pakistan', deliveryInstructions: '', status: 'Out for Delivery', createdAt: 'Today, 12:18 PM' },
  { id: 'BB-1046', customerName: 'Sana Malik', phone: '+92 333 2221199', items: [{ name: 'BB Zinger Burger', quantity: 2, price: 520 }, { name: 'Masala Fries', quantity: 1, price: 260 }], total: 1300, address: 'Allama Binori Town, Karachi, Pakistan', deliveryInstructions: 'Ring the bell twice.', status: 'New', createdAt: 'Today, 11:56 AM' },
]

export const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`
export const getProduct = (slug: string) => products.find((product) => product.slug === slug)
export const popularProducts = products.filter((product) => product.isPopular)
export const relatedProducts = (product: Product) => products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3)

export const restaurant = { phone: '+92 21 111-BROAST', address: 'Shop No. 12, Jamia Masjid, Jamshed Quarter Rd, Jamshed Quarters Allama Binori Town, Karachi, Pakistan', hours: '11:00 AM – 1:00 AM daily' }
