import {admin, db} from "../../config/firebase.config";
import {logger} from "../../utils/logger.util";
import {createNotFoundError} from "../../utils/error.util";

/**
 * Generic Firestore service for database operations
 */
export class FirestoreService {
  /**
   * Get a single document by ID
   */
  static async getDocument(
    collection: string,
    documentId: string
  ): Promise<any> {
    try {
      const docRef = db.collection(collection).doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw createNotFoundError(`Document in ${collection}`);
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      logger.error(`Error getting document from ${collection}`, error);
      throw error;
    }
  }

  /**
   * Get multiple documents with optional filtering
   */
  static async getDocuments(
    collection: string,
    filters?: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[],
    orderBy?: { field: string; direction: "asc" | "desc" },
    limit?: number
  ): Promise<any[]> {
    try {
      let query: FirebaseFirestore.Query = db.collection(collection);

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction);
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      logger.error(`Error getting documents from ${collection}`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  static async createDocument(
    collection: string,
    data: any,
    documentId?: string
  ): Promise<{ id: string; [key: string]: any }> {
    try {
      const timestamp = new Date().toISOString();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      let docRef;

      if (documentId) {
        // Use provided ID
        docRef = db.collection(collection).doc(documentId);
        await docRef.set(docData);
      } else {
        // Auto-generate ID
        docRef = await db.collection(collection).add(docData);
      }

      return {
        id: docRef.id,
        ...docData,
      };
    } catch (error) {
      logger.error(`Error creating document in ${collection}`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  static async updateDocument(
    collection: string,
    documentId: string,
    data: any
  ): Promise<void> {
    try {
      const docRef = db.collection(collection).doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw createNotFoundError(`Document in ${collection}`);
      }

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await docRef.update(updateData);
    } catch (error) {
      logger.error(`Error updating document in ${collection}`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(
    collection: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = db.collection(collection).doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw createNotFoundError(`Document in ${collection}`);
      }

      await docRef.delete();
    } catch (error) {
      logger.error(`Error deleting document from ${collection}`, error);
      throw error;
    }
  }

  /**
   * Batch write operations
   */
  static async batchWrite(
    operations: {
      type: "create" | "update" | "delete";
      collection: string;
      documentId?: string;
      data?: any;
    }[]
  ): Promise<void> {
    try {
      const batch = db.batch();
      const timestamp = new Date().toISOString();

      operations.forEach((operation) => {
        const docRef = operation.documentId ?
          db.collection(operation.collection).doc(operation.documentId) :
          db.collection(operation.collection).doc();

        switch (operation.type) {
        case "create":
          batch.set(docRef, {
            ...operation.data,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
          break;

        case "update":
          batch.update(docRef, {
            ...operation.data,
            updatedAt: timestamp,
          });
          break;

        case "delete":
          batch.delete(docRef);
          break;
        }
      });

      await batch.commit();
    } catch (error) {
      logger.error("Error performing batch write", error);
      throw error;
    }
  }

  /**
   * Increment a numeric field
   */
  static async incrementField(
    collection: string,
    documentId: string,
    field: string,
    incrementBy = 1
  ): Promise<void> {
    try {
      const docRef = db.collection(collection).doc(documentId);

      await docRef.update({
        [field]: admin.firestore.FieldValue.increment(incrementBy),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Error incrementing field in ${collection}`, error);
      throw error;
    }
  }

  /**
   * Get documents from a subcollection
   */
  static async getSubcollection(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    filters?: { field: string; operator: FirebaseFirestore.WhereFilterOp; value: any }[]
  ): Promise<any[]> {
    try {
      let query: FirebaseFirestore.Query = db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection);

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      logger.error(`Error getting subcollection ${subcollection}`, error);
      throw error;
    }
  }

  /**
   * Create a document in a subcollection
   */
  static async createSubcollectionDocument(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    data: any,
    documentId?: string
  ): Promise<{ id: string; [key: string]: any }> {
    try {
      const timestamp = new Date().toISOString();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      let docRef;

      if (documentId) {
        docRef = db
          .collection(parentCollection)
          .doc(parentDocId)
          .collection(subcollection)
          .doc(documentId);
        await docRef.set(docData);
      } else {
        docRef = await db
          .collection(parentCollection)
          .doc(parentDocId)
          .collection(subcollection)
          .add(docData);
      }

      return {
        id: docRef.id,
        ...docData,
      };
    } catch (error) {
      logger.error(`Error creating document in subcollection ${subcollection}`, error);
      throw error;
    }
  }

  /**
   * Get a single document from a subcollection
   */
  static async getSubcollectionDocument(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    documentId: string
  ): Promise<any> {
    try {
      const docRef = db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection)
        .doc(documentId);

      const doc = await docRef.get();

      if (!doc.exists) {
        throw createNotFoundError(`Document in ${subcollection}`);
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      logger.error(`Error getting document from ${subcollection}`, error);
      throw error;
    }
  }

  /**
   * Update a document in a subcollection
   */
  static async updateSubcollectionDocument(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    documentId: string,
    data: any
  ): Promise<void> {
    try {
      const docRef = db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection)
        .doc(documentId);

      const doc = await docRef.get();

      if (!doc.exists) {
        throw createNotFoundError(`Document in ${subcollection}`);
      }

      await docRef.update({
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Error updating document in ${subcollection}`, error);
      throw error;
    }
  }

  /**
   * Delete a document from a subcollection
   */
  static async deleteSubcollectionDocument(
    parentCollection: string,
    parentDocId: string,
    subcollection: string,
    documentId: string
  ): Promise<void> {
    try {
      const docRef = db
        .collection(parentCollection)
        .doc(parentDocId)
        .collection(subcollection)
        .doc(documentId);

      const doc = await docRef.get();

      if (!doc.exists) {
        throw createNotFoundError(`Document in ${subcollection}`);
      }

      await docRef.delete();
    } catch (error) {
      logger.error(`Error deleting document from ${subcollection}`, error);
      throw error;
    }
  }
}
