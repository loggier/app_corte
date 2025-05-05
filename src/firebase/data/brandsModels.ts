import { collection, getDocs, query, where } from 'firebase/firestore';
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
    return modelsList;
  } catch (error) {
    console.error(`Error fetching models for brand ${brandId}:`, error);
    throw error; // Or return an empty array depending on desired error handling
  }
}