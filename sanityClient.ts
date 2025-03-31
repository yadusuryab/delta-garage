import { createClient } from '@sanity/client'; // Use named export
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, // Replace with your Sanity project ID
  dataset: 'production',
  apiVersion:'2025-01-02', // Replace with your Sanity dataset name
  useCdn: true, // Set to false to bypass the CDN and get fresh data
  token : process.env.NEXT_PUBLIC_SANITY_TOKEN
});

const builder = imageUrlBuilder(client);

// Function to generate the image URL from Sanity image asset
export const urlFor = (source: any) => builder.image(source);
