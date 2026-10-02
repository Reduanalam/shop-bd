// Predefined default photos for common categories
const defaultCategoryImages = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
  clothing: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
  default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
};

const getAutoImageForCategory = (categoryName) => {
  const normalized = categoryName.toLowerCase().trim();
  
  for (const key in defaultCategoryImages) {
    if (normalized.includes(key)) {
      return defaultCategoryImages[key];
    }
  }
  
  // Unsplash Source API dynamic keyword matching (Alternative option)
  return `https://source.unsplash.com/featured/?${encodeURIComponent(categoryName)}`;
};

module.exports = { getAutoImageForCategory };