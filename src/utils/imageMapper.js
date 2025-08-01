// Image mapping utility to map question image paths to actual asset files

// Static import of all images - React Native requires static imports
const images = {
  // General questions
  'general-21-option-1.png': require('../assets/images/general-21-option-1.png'),
  'general-21-option-2.png': require('../assets/images/general-21-option-2.png'),
  'general-21-option-3.png': require('../assets/images/general-21-option-3.png'),
  'general-21-option-4.jpg': require('../assets/images/general-21-option-4.jpg'),
  'general-55-question.jpg': require('../assets/images/general-55-question.jpg'),
  'general-70-question.png': require('../assets/images/general-70-question.png'),
  'general-130-question.png': require('../assets/images/general-130-question.png'),
  'general-176-question.png': require('../assets/images/general-176-question.png'),
  'general-181-question.png': require('../assets/images/general-181-question.png'),
  'general-187-question.png': require('../assets/images/general-187-question.png'),
  'general-209-option-1.png': require('../assets/images/general-209-option-1.png'),
  'general-209-option-2.png': require('../assets/images/general-209-option-2.png'),
  'general-209-option-3.png': require('../assets/images/general-209-option-3.png'),
  'general-209-option-4.jpg': require('../assets/images/general-209-option-4.jpg'),
  'general-216-question.png': require('../assets/images/general-216-question.png'),
  'general-226-option-1.png': require('../assets/images/general-226-option-1.png'),
  'general-226-option-2.jpg': require('../assets/images/general-226-option-2.jpg'),
  'general-226-option-3.jpg': require('../assets/images/general-226-option-3.jpg'),
  'general-226-option-4.jpg': require('../assets/images/general-226-option-4.jpg'),
  'general-235-question.png': require('../assets/images/general-235-question.png'),
  
  // Baden-Württemberg
  'baden-w-rttemberg-1-option-1.jpg': require('../assets/images/baden-w-rttemberg-1-option-1.jpg'),
  'baden-w-rttemberg-1-option-2.png': require('../assets/images/baden-w-rttemberg-1-option-2.png'),
  'baden-w-rttemberg-1-option-3.png': require('../assets/images/baden-w-rttemberg-1-option-3.png'),
  'baden-w-rttemberg-1-option-4.png': require('../assets/images/baden-w-rttemberg-1-option-4.png'),
  'baden-w-rttemberg-8-question.png': require('../assets/images/baden-w-rttemberg-8-question.png'),
  
  // Bayern
  'bayern-1-option-1.jpg': require('../assets/images/bayern-1-option-1.jpg'),
  'bayern-1-option-2.png': require('../assets/images/bayern-1-option-2.png'),
  'bayern-1-option-3.png': require('../assets/images/bayern-1-option-3.png'),
  'bayern-1-option-4.png': require('../assets/images/bayern-1-option-4.png'),
  'bayern-8-question.png': require('../assets/images/bayern-8-question.png'),
  
  // Berlin
  'berlin-1-option-1.png': require('../assets/images/berlin-1-option-1.png'),
  'berlin-1-option-2.png': require('../assets/images/berlin-1-option-2.png'),
  'berlin-1-option-3.png': require('../assets/images/berlin-1-option-3.png'),
  'berlin-1-option-4.png': require('../assets/images/berlin-1-option-4.png'),
  'berlin-8-question.png': require('../assets/images/berlin-8-question.png'),
  
  // Brandenburg
  'brandenburg-1-option-1.png': require('../assets/images/brandenburg-1-option-1.png'),
  'brandenburg-1-option-2.png': require('../assets/images/brandenburg-1-option-2.png'),
  'brandenburg-1-option-3.png': require('../assets/images/brandenburg-1-option-3.png'),
  'brandenburg-1-option-4.jpg': require('../assets/images/brandenburg-1-option-4.jpg'),
  'brandenburg-8-question.png': require('../assets/images/brandenburg-8-question.png'),
  
  // Bremen
  'bremen-1-option-1.png': require('../assets/images/bremen-1-option-1.png'),
  'bremen-1-option-2.jpg': require('../assets/images/bremen-1-option-2.jpg'),
  'bremen-1-option-3.png': require('../assets/images/bremen-1-option-3.png'),
  'bremen-1-option-4.png': require('../assets/images/bremen-1-option-4.png'),
  'bremen-8-question.png': require('../assets/images/bremen-8-question.png'),
  
  // Hamburg
  'hamburg-1-option-1.png': require('../assets/images/hamburg-1-option-1.png'),
  'hamburg-1-option-2.png': require('../assets/images/hamburg-1-option-2.png'),
  'hamburg-1-option-3.png': require('../assets/images/hamburg-1-option-3.png'),
  'hamburg-1-option-4.png': require('../assets/images/hamburg-1-option-4.png'),
  'hamburg-8-question.png': require('../assets/images/hamburg-8-question.png'),
  
  // Hessen
  'hessen-1-option-1.png': require('../assets/images/hessen-1-option-1.png'),
  'hessen-1-option-2.png': require('../assets/images/hessen-1-option-2.png'),
  'hessen-1-option-3.png': require('../assets/images/hessen-1-option-3.png'),
  'hessen-1-option-4.jpg': require('../assets/images/hessen-1-option-4.jpg'),
  'hessen-8-question.png': require('../assets/images/hessen-8-question.png'),
  
  // Mecklenburg-Vorpommern
  'mecklenburg-vorpommern-1-option-1.png': require('../assets/images/mecklenburg-vorpommern-1-option-1.png'),
  'mecklenburg-vorpommern-1-option-2.png': require('../assets/images/mecklenburg-vorpommern-1-option-2.png'),
  'mecklenburg-vorpommern-1-option-3.png': require('../assets/images/mecklenburg-vorpommern-1-option-3.png'),
  'mecklenburg-vorpommern-1-option-4.png': require('../assets/images/mecklenburg-vorpommern-1-option-4.png'),
  'mecklenburg-vorpommern-8-question.png': require('../assets/images/mecklenburg-vorpommern-8-question.png'),
  
  // Niedersachsen
  'niedersachsen-1-option-1.png': require('../assets/images/niedersachsen-1-option-1.png'),
  'niedersachsen-1-option-2.png': require('../assets/images/niedersachsen-1-option-2.png'),
  'niedersachsen-1-option-3.png': require('../assets/images/niedersachsen-1-option-3.png'),
  'niedersachsen-1-option-4.jpg': require('../assets/images/niedersachsen-1-option-4.jpg'),
  'niedersachsen-8-question.png': require('../assets/images/niedersachsen-8-question.png'),
  
  // Nordrhein-Westfalen
  'nordrhein-westfalen-1-option-1.png': require('../assets/images/nordrhein-westfalen-1-option-1.png'),
  'nordrhein-westfalen-1-option-2.png': require('../assets/images/nordrhein-westfalen-1-option-2.png'),
  'nordrhein-westfalen-1-option-3.png': require('../assets/images/nordrhein-westfalen-1-option-3.png'),
  'nordrhein-westfalen-1-option-4.jpg': require('../assets/images/nordrhein-westfalen-1-option-4.jpg'),
  'nordrhein-westfalen-8-question.png': require('../assets/images/nordrhein-westfalen-8-question.png'),
  
  // Rheinland-Pfalz
  'rheinland-pfalz-1-option-1.png': require('../assets/images/rheinland-pfalz-1-option-1.png'),
  'rheinland-pfalz-1-option-2.png': require('../assets/images/rheinland-pfalz-1-option-2.png'),
  'rheinland-pfalz-1-option-3.png': require('../assets/images/rheinland-pfalz-1-option-3.png'),
  'rheinland-pfalz-1-option-4.png': require('../assets/images/rheinland-pfalz-1-option-4.png'),
  'rheinland-pfalz-8-question.png': require('../assets/images/rheinland-pfalz-8-question.png'),
  
  // Saarland
  'saarland-1-option-1.png': require('../assets/images/saarland-1-option-1.png'),
  'saarland-1-option-2.png': require('../assets/images/saarland-1-option-2.png'),
  'saarland-1-option-3.png': require('../assets/images/saarland-1-option-3.png'),
  'saarland-1-option-4.png': require('../assets/images/saarland-1-option-4.png'),
  'saarland-8-question.png': require('../assets/images/saarland-8-question.png'),
  
  // Sachsen
  'sachsen-1-option-1.png': require('../assets/images/sachsen-1-option-1.png'),
  'sachsen-1-option-2.png': require('../assets/images/sachsen-1-option-2.png'),
  'sachsen-1-option-3.png': require('../assets/images/sachsen-1-option-3.png'),
  'sachsen-1-option-4.jpg': require('../assets/images/sachsen-1-option-4.jpg'),
  'sachsen-8-question.png': require('../assets/images/sachsen-8-question.png'),
  
  // Sachsen-Anhalt
  'sachsen-anhalt-1-option-1.png': require('../assets/images/sachsen-anhalt-1-option-1.png'),
  'sachsen-anhalt-1-option-2.png': require('../assets/images/sachsen-anhalt-1-option-2.png'),
  'sachsen-anhalt-1-option-3.png': require('../assets/images/sachsen-anhalt-1-option-3.png'),
  'sachsen-anhalt-1-option-4.png': require('../assets/images/sachsen-anhalt-1-option-4.png'),
  'sachsen-anhalt-8-question.png': require('../assets/images/sachsen-anhalt-8-question.png'),
  
  // Schleswig-Holstein
  'schleswig-holstein-1-option-1.png': require('../assets/images/schleswig-holstein-1-option-1.png'),
  'schleswig-holstein-1-option-2.png': require('../assets/images/schleswig-holstein-1-option-2.png'),
  'schleswig-holstein-1-option-3.png': require('../assets/images/schleswig-holstein-1-option-3.png'),
  'schleswig-holstein-1-option-4.png': require('../assets/images/schleswig-holstein-1-option-4.png'),
  'schleswig-holstein-8-question.png': require('../assets/images/schleswig-holstein-8-question.png'),
  
  // Thüringen
  'th-ringen-1-option-1.jpg': require('../assets/images/th-ringen-1-option-1.jpg'),
  'th-ringen-1-option-2.png': require('../assets/images/th-ringen-1-option-2.png'),
  'th-ringen-1-option-3.jpg': require('../assets/images/th-ringen-1-option-3.jpg'),
  'th-ringen-1-option-4.png': require('../assets/images/th-ringen-1-option-4.png'),
  'th-ringen-8-question.png': require('../assets/images/th-ringen-8-question.png'),
};

/**
 * Get the actual image source for a given image path from questions.js
 * @param {string} imagePath - The image path from questions.js (e.g., "./images/general-21-option-1.png")
 * @returns {any} - The require() result for the actual image file, or null if not found
 */
export function getImageSource(imagePath) {
  if (!imagePath) return null;
  
  // Remove the "./images/" prefix to get just the filename
  const filename = imagePath.replace('./images/', '');
  
  // Look up the image in our static imports
  const imageSource = images[filename];
  
  if (!imageSource) {
    console.warn(`Image not found: ${filename}`);
    return null;
  }
  
  return imageSource;
}

/**
 * Get all image sources for a question's image_paths array
 * @param {string[]} imagePaths - Array of image paths from questions.js
 * @returns {any[]} - Array of require() results for actual image files
 */
export function getImageSources(imagePaths) {
  if (!imagePaths || !Array.isArray(imagePaths)) return [];
  
  return imagePaths
    .map(path => getImageSource(path))
    .filter(source => source !== null);
}

export default {
  getImageSource,
  getImageSources,
};