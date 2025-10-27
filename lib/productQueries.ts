import { client } from "@/sanityClient";

// Fetch all products
export const getAllProducts = async (
  page: number = 1,
  limit: number = 12
): Promise<any[] | undefined> => {
  const start = (page - 1) * limit;
  const end = start + limit;

  const query = `*[_type == "product" && hidden != true] | order(_createdAt desc) [${start}...${end}] {
    _id,
    name,
    category -> {
      name,
      slug
    },
    brand,
    compatibility,
    features,
    images[] {
      asset -> {
        url
      }
    },
    quantity,
    price,
    offerPrice,
    description,
    soldOut
  }`;

  try {
    const products = await client.fetch(query);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return undefined;
  }
};


// Fetch a single product by ID
export const getProductById = async (id: string): Promise<any | undefined> => {
  const query = `*[_type == "product" && _id == $id] {
    _id,
    name,
    category -> {
      name,
      slug
    },
    brand,
    compatibility,
    features,
    images[] {
      asset -> {
        url
      }
    },
    quantity,
    price,
    offerPrice,
    description,
    soldOut
  }`;

  try {
    const product = await client.fetch(query, { id });
    if (product.length === 0) {
      console.warn(`No product found for ID: ${id}`);
      return undefined;
    }
    return product[0];
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return undefined;
  }
};

// Search for products by keyword
export const searchProducts = async (keyword: string): Promise<any[] | undefined> => {
  const query = `*[_type == "product" && (
    name match $keyword || 
    brand match $keyword || 
    compatibility match $keyword || 
    description match $keyword
  )] {
    _id,
    name,
    category -> {
      name,
      slug
    },
    brand,
    compatibility,
    features,
    images[] {
      asset -> {
        url
      }
    },
    price,
    offerPrice,
    description,
    soldOut
  }`;

  try {
    const products = await client.fetch(query, { keyword: `*${keyword}*` });
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return undefined;
  }
};

// Add a product to the cart
export const addToCart = (product: any) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!cart.some((item: any) => item._id === product._id)) {
    const updatedCart = [...cart, product];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  }
};

// Fetch all categories
export const getAllCategories = async (): Promise<any[] | undefined> => {
  const query = `*[_type == "category"] {
    _id,
    name,
    slug,
    image {
      asset->{
        url,
        metadata {
          dimensions
        }
      },
      alt
    }
  }`;

  try {
    const categories = await client.fetch(query);
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return undefined;
  }
};

// Fetch products by category slug
export const getProductsByCategory = async (categorySlug: string): Promise<any[] | undefined> => {
  const query = `*[_type == "product" && category->slug.current == $categorySlug] {
    _id,
    name,
    category -> {
      name,
      slug
    },
    brand,
    compatibility,
    features,
    images[] {
      asset -> {
        url
      }
    },
    price,
    offerPrice,
    description,
    soldOut
  }`;

  try {
    const products = await client.fetch(query, { categorySlug });
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return undefined;
  }
};