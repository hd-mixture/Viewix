export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ViewixDB', 1)
    
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('pdfs')) {
        request.result.createObjectStore('pdfs')
      }
    }
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const savePdfToDB = async (name: string, file: File) => {
  try {
    const db = await initDB()
    const tx = db.transaction('pdfs', 'readwrite')
    tx.objectStore('pdfs').put(file, name)
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  } catch (error) {
    console.error("Failed to save PDF to IndexedDB", error)
  }
}

export const getPdfFromDB = async (name: string): Promise<File | null> => {
  try {
    const db = await initDB()
    const tx = db.transaction('pdfs', 'readonly')
    const request = tx.objectStore('pdfs').get(name)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Failed to retrieve PDF from IndexedDB", error)
    return null
  }
}
