import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Adjust the path if necessary
import { Brand, Model } from '@/lib/definitions'; // Adjust the path if necessary

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const brandsCollection = collection(db, 'brands');
    const brandSnapshot = await getDocs(brandsCollection);
    const brandsList = brandSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as { name: string }
    }));
     // Sort brands alphabetically by name
     brandsList.sort((a, b) => a.name.localeCompare(b.name));
    return brandsList;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error; // Or return an empty array depending on desired error handling
  }
}

export async function getModelsByBrandId(brandId: string): Promise<Model[]> {
  try {
    const modelsCollection = collection(db, 'models');
    const q = query(modelsCollection, where('brandId', '==', brandId));
    const modelSnapshot = await getDocs(q);
    const modelsList = modelSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as { name: string, brandId: string }
    }));
    // Sort models alphabetically by name
    modelsList.sort((a, b) => a.name.localeCompare(b.name));
    return modelsList;
  } catch (error) {
    console.error(`Error fetching models for brand ${brandId}:`, error);
    throw error; // Or return an empty array depending on desired error handling
  }
}

// Function to add a new model to a specific brand
export async function addModelToBrand(brandId: string, modelName: string): Promise<Model> {
    if (!brandId || !modelName) {
      throw new Error("Brand ID and Model Name are required.");
    }

    const modelNameTrimmed = modelName.trim();
    if (!modelNameTrimmed) {
        throw new Error("Model name cannot be empty.");
    }

    try {
      // Optional: Check if model already exists for this brand (case-insensitive check)
      const existingModels = await getModelsByBrandId(brandId);
      const modelExists = existingModels.some(m => m.name.toLowerCase() === modelNameTrimmed.toLowerCase());

      if (modelExists) {
        throw new Error(`Model "${modelNameTrimmed}" already exists for this brand.`);
      }


      const modelsCollection = collection(db, 'models');
      const docRef = await addDoc(modelsCollection, {
        brandId: brandId,
        name: modelNameTrimmed, // Use trimmed name
        createdAt: serverTimestamp(), // Optional: Add a timestamp
      });

      // Return the newly added model data, including its ID
      return {
        id: docRef.id,
        brandId: brandId,
        name: modelNameTrimmed,
      };
    } catch (error) {
      console.error(`Error adding model "${modelNameTrimmed}" to brand ${brandId}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }
