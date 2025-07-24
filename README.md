# 🎬 drive-video-proxy

Ejemplo básico reproducción de video vía streaming con react, nodejs con protección de enlaces sensibles mediante una arquitectura proxy segura.

---

## 📦 Descripción

  Solución para **transmitir videos protegidos desde un servidor externo sin exponer su URL original al cliente**. Esto es útil en plataformas donde se desea controlar el acceso al contenido multimedia, como sistemas educativos, portales privados, entre otros.

La arquitectura está dividida en tres módulos:

1. **Server**  
   Responsable de acceder al recurso de video desde un proveedor externo (como un sistema de almacenamiento en la nube) utilizando autenticación segura.

2. **Proxy**  
   Capa de seguridad que expone el contenido al cliente sin revelar la fuente real del archivo, aplicando lógica de control de acceso y reenviando el stream.

3. **Cliente**  
   Interfaz web construida en React para reproducir.

### INSTALAR CON **npm install** EN CADA CARPETA
### EJECUTAR CON **npm run dev** EN CADA CARPETA