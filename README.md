# Blog Vulnerable - Aplicación para Evaluación

## Descripción

Esta es una aplicación de blog simple desarrollada para la Evaluación 2 de la asignatura CIB402 - Seguridad para Plataformas Web.

## Requisitos

- Node.js (versión 14 o superior)
- npm (gestor de paquetes de Node.js)

## Instalación

1. Clonar o descargar la carpeta de la aplicación
2. Abrir una terminal en la carpeta del proyecto
3. Ejecutar el comando:
   ```bash
   npm install
   ```

## Ejecución

Para iniciar la aplicación, ejecutar uno de los siguientes comandos:

```bash
# Para desarrollo (con recarga automática)
npm run dev

# Para producción
npm start
```

La aplicación estará disponible en: http://localhost:3000

## Uso de la Aplicación

### Inicio de Sesión

Puedes iniciar sesión con las siguientes credenciales:

- **Usuario Administrador:**
  - Usuario: admin
  - Contraseña: admin123

- **Usuario Estándar:**
  - Usuario: user
  - Contraseña: user123

### Funcionalidades

1. **Ver Posts:** En la página principal puedes ver todos los posts publicados.
2. **Ver Detalles de Post:** Haz clic en "Ver Detalles" para ver el contenido completo y comentarios.
3. **Crear Post:** Los usuarios autenticados pueden crear nuevos posts con texto e imágenes.
4. **Comentar:** Cualquier persona puede agregar comentarios a los posts.
5. **Eliminar Posts:** Los administradores pueden eliminar posts existentes.

## Estructura del Proyecto

```
app_vulnerable/
├── package.json          # Dependencias del proyecto
├── server.js             # Servidor backend
├── public/               # Archivos estáticos
│   ├── index.html        # Página principal
│   ├── style.css         # Estilos CSS
│   ├── script.js         # Lógica del frontend
│   └── uploads/          # Carpeta para imágenes subidas (se crea automáticamente)
└── README.md             # Este archivo
```

## Notas Técnicas

- La aplicación utiliza Express.js como framework web
- Los datos se almacenan en memoria (no persistente)
- Las imágenes subidas se guardan en la carpeta `public/uploads/`
- La aplicación está configurada para funcionar en el puerto 3000 por defecto

## Soporte

Para cualquier consulta técnica sobre la aplicación, contactar al docente de la asignatura.