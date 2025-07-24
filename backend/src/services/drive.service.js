const axios = require('axios');

// Clase que maneja la interacción con Google Drive (o similar)
class DriveService {
  // Método para obtener la lista de videos disponibles
  getVideoList() {
    // aquí se usa el catálogo global definido en index.js
    const VIDEO_CATALOG = global.VIDEO_CATALOG;
    // Convierte las claves del catálogo en un array de objetos con id y título
    return Object.keys(VIDEO_CATALOG).map(key => ({
      id: key,  // ID interno (ej: "video1")
      title: `Video ${key.replace('video', '')}`  // Genera un título legible (ej: "Video 1")
    }));
  }

  // Método para obtener el ID real de Google Drive a partir de un ID interno
  getRealFileId(internalId) {
    const VIDEO_CATALOG = global.VIDEO_CATALOG;
    return VIDEO_CATALOG[internalId];  // Busca en el catálogo
  }

  // Método para transmitir un video en chunks (para streaming)
  async streamVideo(internalId, range) {
    // Obtiene el ID real del archivo en Drive
    const realFileId = this.getRealFileId(internalId);

    // Si no existe el ID, lanza un error
    if (!realFileId) {
      throw new Error('Video no encontrado en el catálogo');
    }

    // Construye la URL de descarga de Google Drive
    const driveFileUrl = `https://drive.google.com/uc?export=download&id=${realFileId}`;

    // Hace una petición GET a Drive con:
    return await axios.get(driveFileUrl, {
      headers: { Range: range },  // Cabecera Range para streaming
      responseType: 'stream',     // Recibe la respuesta como stream
      validateStatus: (status) => status < 500  // Considera válidos los códigos <500
    });
  }

  // Método para obtener información del archivo (metadatos)
  async getFileInfo(internalId) {
    // Obtiene el ID real del archivo
    const realFileId = this.getRealFileId(internalId);

    // Verifica si existe
    if (!realFileId) {
      throw new Error('Video no encontrado en el catálogo');
    }

    // Construye la URL de Drive
    const driveFileUrl = `https://drive.google.com/uc?export=download&id=${realFileId}`;

    // Hace una petición HEAD (solo obtiene cabeceras, sin el cuerpo del archivo)
    const response = await axios.head(driveFileUrl);

    // Retorna un objeto con metadatos del archivo
    return {
      id: internalId,  // ID interno
      mimeType: response.headers['content-type'] || 'video/mp4',  // Tipo de archivo
      size: response.headers['content-length'] || 'Desconocido',  // Tamaño en bytes
      name: `Video ${internalId.replace('video', '')}`,  // Nombre legible
      accessible: true  // Indica que el archivo es accesible
    };
  }
}

// Exporta una instancia ya creada de DriveService (patrón Singleton)
module.exports = new DriveService();