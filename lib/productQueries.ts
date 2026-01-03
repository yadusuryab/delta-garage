import { client } from "@/sanityClient";

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const DEFAULT_LIMIT = 40;

// Helper function for caching
const withCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: number = CACHE_DURATION
): Promise<T> => {
  if (typeof window === 'undefined') {
    return fetchFn();
  }

  const now = Date.now();
  const cacheKey = `kspyn_${key}`;
  const timestampKey = `${cacheKey}_timestamp`;

  const cached = localStorage.getItem(cacheKey);
  const timestamp = localStorage.getItem(timestampKey);

  if (cached && timestamp) {
    const isStale = now - parseInt(timestamp) > duration;
    if (!isStale) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Cache corrupted
      }
    }
  }

  const data = await fetchFn();
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(timestampKey, now.toString());
  } catch (e) {
    // Storage might be full
  }

  return data;
};

// **FIXED: Return images in correct structure**
export const getAllProducts = async (
  page: number = 1,
  limit: number = DEFAULT_LIMIT
): Promise<any[] | undefined> => {
  const start = (page - 1) * limit;
  
  // Keep images array structure
  const query = `*[_type == "product" && hidden != true && !(_id in path("drafts.**"))] | order(_createdAt desc) [${start}...${start + limit}] {
    _id,
    name,
    category -> {
      _id,
      name,
      "slug": slug.current
    },
    brand,
    compatibility,
    features,
    images[] {
      asset->{
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    price,
    offerPrice,
    soldOut,
    description,
    "discount": select(offerPrice != null => round((price - offerPrice) / price * 100))
  }`;

  try {
    return await withCache(`products_${page}_${limit}`, async () => {
      const products = await client.fetch(query);
      
      // Keep the images structure intact for ProductCard
      return products.map((product: any) => ({
        ...product,
        // Don't flatten images array - keep structure for ProductCard
      }));
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return undefined;
  }
};

// **FIXED: Keep images structure for grouped products**
export const getProductsGroupedByCategory = async (
  productsPerCategory: number = 4,
  maxCategories: number = 15
): Promise<any[] | undefined> => {
  // First get all categories with product count
  const categoriesQuery = `*[_type == "category" && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    image {
      asset->{
        url,
        metadata {
          dimensions,
          lqip
        }
      }
    },
    "productCount": count(*[_type == "product" && references(^._id) && hidden != true])
  } | order(productCount desc) [0...${maxCategories}]`;

  try {
    return await withCache('products_grouped', async () => {
      const categories = await client.fetch(categoriesQuery);
      
      // Fetch products for each category with ALL needed fields including category
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category: any) => {
          const productsQuery = `*[
            _type == "product" && 
            category->_id == $categoryId && 
            hidden != true && 
            !(_id in path("drafts.**"))
          ] | order(_createdAt desc) [0...${productsPerCategory}] {
            _id,
            name,
            category -> {
              name,
              "slug": slug.current
            },
            brand,
            images[] {
              asset->{
                url,
                metadata {
                  lqip,
                  dimensions
                }
              }
            },
            price,
            offerPrice,
            soldOut,
            "discount": select(offerPrice != null => round((price - offerPrice) / price * 100))
          }`;

          const products = await client.fetch(productsQuery, { 
            categoryId: category._id 
          });

          return {
            ...category,
            products: products,
            description: `Explore our ${category.name} collection with ${category.productCount} premium products`
          };
        })
      );

      return categoriesWithProducts.filter((cat: any) => cat.products.length > 0);
    });
  } catch (error) {
    console.error("Error fetching grouped products:", error);
    return undefined;
  }
};

// **FIXED: Single product query**
export const getProductById = async (id: string): Promise<any | undefined> => {
  const query = `*[_type == "product" && _id == $id && hidden != true && !(_id in path("drafts.**"))] [0] {
    _id,
    name,
    category -> {
      name,
      "slug": slug.current
    },
    brand,
    compatibility,
    features[],
    images[] {
      asset -> {
        url,
        metadata {
          dimensions,
          lqip
        }
      }
    },
    quantity,
    price,
    offerPrice,
    codCharge,
    prepaidCharge,
    description[],
    soldOut,
    "relatedProducts": *[
      _type == "product" && 
      category->._id == ^.category._id && 
      _id != $id && 
      hidden != true
    ] | order(_createdAt desc) [0...4] {
      _id,
      name,
      images[] {
        asset -> {
          url,
          metadata {
            lqip,
            dimensions
          }
        }
      },
      price,
      offerPrice
    }
  }`;

  try {
    return await client.fetch(query, { id });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return undefined;
  }
};

// **FIXED: Search products**
export const searchProducts = async (keyword: string): Promise<any[] | undefined> => {
  if (!keyword.trim()) return [];
  
  const query = `*[_type == "product" && hidden != true && !(_id in path("drafts.**")) && (
    name match $keyword + "*" || 
    brand match $keyword + "*" || 
    compatibility match $keyword + "*"
  )] | score(
    boost(name match $keyword + "*", 3),
    boost(brand match $keyword + "*", 2),
    compatibility match $keyword + "*"
  ) | order(_score desc) [0...20] {
    _id,
    name,
    category -> {
      name,
      "slug": slug.current
    },
    brand,
    compatibility,
    images[] {
      asset -> {
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    price,
    offerPrice,
    soldOut,
    "discount": select(offerPrice != null => round((price - offerPrice) / price * 100))
  }`;

  try {
    const products = await client.fetch(query, { keyword });
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return undefined;
  }
};

// **FIXED: Add to cart**
export const addToCart = (product: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const existingIndex = cart.findIndex((item: any) => item._id === product._id);
    
    if (existingIndex === -1) {
      const productToAdd = {
        _id: product._id,
        name: product.name,
        price: product.offerPrice || product.price,
        image: product.images?.[0]?.asset?.url,
        quantity: 1
      };
      
      const updatedCart = [...cart, productToAdd];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { cart: updatedCart } 
      }));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedCart)
      }));
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

// **FIXED: Categories**
export const getAllCategories = async (): Promise<any[] | undefined> => {
  const query = `*[_type == "category" && !(_id in path("drafts.**"))] {
    _id,
    name,
    "slug": slug.current,
    image {
      asset->{
        url,
        metadata {
          dimensions,
          lqip
        }
      },
      alt
    },
    "productCount": count(*[_type == "product" && references(^._id) && hidden != true])
  } | order(name asc)`;

  try {
    return await withCache('categories', async () => {
      return await client.fetch(query);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return undefined;
  }
};

// **FIXED: Products by category**
export const getProductsByCategory = async (
  categorySlug: string, 
  page: number = 1, 
  limit: number = 12
): Promise<any[] | undefined> => {
  const start = (page - 1) * limit;
  
  const query = `*[
    _type == "product" && 
    category->slug.current == $categorySlug && 
    hidden != true && 
    !(_id in path("drafts.**"))
  ] | order(_createdAt desc) [${start}...${start + limit}] {
    _id,
    name,
    category -> {
      name,
      "slug": slug.current
    },
    brand,
    compatibility,
    images[] {
      asset -> {
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    price,
    offerPrice,
    soldOut,
    "discount": select(offerPrice != null => round((price - offerPrice) / price * 100))
  }`;

  try {
    const cacheKey = `category_${categorySlug}_${page}_${limit}`;
    
    return await withCache(cacheKey, async () => {
      return await client.fetch(query, { categorySlug });
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return undefined;
  }
};

// **FIXED: Category by slug**
export const getCategoryBySlug = async (slug: string): Promise<any | undefined> => {
  const query = `*[_type == "category" && slug.current == $slug && !(_id in path("drafts.**"))] [0] {
    _id,
    name,
    "slug": slug.current,
    image {
      asset->{
        url,
        metadata {
          dimensions,
          lqip
        }
      },
      alt
    },
    description,
    "productCount": count(*[_type == "product" && references(^._id) && hidden != true])
  }`;

  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return undefined;
  }
};

// **FIXED: Featured products**
export const getFeaturedProducts = async (limit: number = 8): Promise<any[] | undefined> => {
  const query = `*[
    _type == "product" && 
    hidden != true && 
    !(_id in path("drafts.**")) &&
    offerPrice != null
  ] | order(offerPrice / price asc) [0...${limit}] {
    _id,
    name,
    category -> {
      name,
      "slug": slug.current
    },
    images[] {
      asset -> {
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    price,
    offerPrice,
    "discount": round((price - offerPrice) / price * 100),
    soldOut
  }`;

  try {
    return await withCache('featured_products', async () => {
      return await client.fetch(query);
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return undefined;
  }
};

// **NEW: Get best selling products**
export const getBestSellingProducts = async (limit: number = 8): Promise<any[] | undefined> => {
  const query = `*[
    _type == "product" && 
    hidden != true && 
    !(_id in path("drafts.**"))
  ] | order(_createdAt desc) [0...${limit}] {
    _id,
    name,
    category -> {
      name,
      "slug": slug.current
    },
    images[] {
      asset -> {
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    price,
    offerPrice,
    soldOut,
    "discount": select(offerPrice != null => round((price - offerPrice) / price * 100))
  }`;

  try {
    return await withCache('best_selling', async () => {
      return await client.fetch(query);
    });
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    return undefined;
  }
};

// **NEW: Check if product exists**
export const checkProductExists = async (productId: string): Promise<boolean> => {
  const query = `count(*[_type == "product" && _id == $productId && hidden != true]) > 0`;
  
  try {
    return await client.fetch(query, { productId });
  } catch (error) {
    console.error("Error checking product exists:", error);
    return false;
  }
};

// **NEW: Get multiple products by IDs**
export const getProductsByIds = async (ids: string[]): Promise<any[] | undefined> => {
  if (!ids.length) return [];
  
  const query = `*[_type == "product" && _id in $ids && hidden != true] {
    _id,
    name,
    category -> {
      name,
      "slug": slug.current
    },
    images[] {
      asset -> {
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    price,
    offerPrice,
    soldOut,
    "discount": select(offerPrice != null => round((price - offerPrice) / price * 100))
  }`;

  try {
    return await client.fetch(query, { ids });
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return undefined;
  }
};