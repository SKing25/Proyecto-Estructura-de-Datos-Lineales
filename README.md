# Proyecto Estructura de Datos Lineales

**"El devorador de mundos"**

Este proyecto es una aplicación web desarrollada en Python que implementa diversas estructuras de datos lineales, como listas, pilas y colas. 
Utiliza el microframework Flask para la creación de la interfaz web, permitiendo a los usuarios interactuar de manera intuitiva con las estructuras de datos y visualizar su comportamiento en tiempo real.

## Características

- **Interfaz Web Intuitiva**: Gracias a Flask y HTML/CSS, la aplicación ofrece una interfaz amigable para interactuar con las estructuras de datos.
- **Implementación de Estructuras Lineales**:
  - **Listas**: Inserción, eliminación y búsqueda de elementos.
  - **Pilas**: Operaciones de apilar y desapilar.
  - **Colas**: Encolado y desencolado de elementos.
- **Visualización Dinámica**: Representación gráfica del estado actual de cada estructura tras cada operación.
- **Código Modular**: Organización clara del código en módulos para facilitar su mantenimiento y expansión.

## Estructura del Proyecto

```
├── app.py               # Archivo principal que inicia la aplicación Flask, backend.
├── static/              # Archivos estáticos (CSS, imágenes, etc.)
├── templates/           # Plantillas HTML para las vistas
└── README.md            # Documentación del proyecto
```

## Requisitos

- Python 3.7 o superior
- Flask

## Instalación

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/SKing25/Proyecto-Estructura-de-Datos-Lineales.git
   cd Proyecto-Estructura-de-Datos-Lineales
   ```

2. **Crear y activar un entorno virtual (opcional pero recomendado)**:

   ```bash
   python -m venv env
   source env/bin/activate  # En Windows: env\Scripts\activate
   ```

3. **Instalar las dependencias**:

   ```bash
   pip install flask
   pip install pandas
   ```

4. **Ejecutar la aplicación**:

   ```bash
   python app.py
   ```

5. **Acceder a la aplicación**:

   Abre tu navegador y visita `http://127.0.0.1:5000/` para interactuar con la aplicación.

## Uso

Una vez iniciada la aplicación:

- Navega a la sección de la estructura de datos que deseas explorar (lista, pila o cola).
- Utiliza los formularios disponibles para realizar operaciones como agregar, eliminar o buscar elementos.
- Observa cómo cambia la representación gráfica de la estructura tras cada operación.

## Autores

- **SKing** - [@SKing25](https://github.com/SKing25)
- **JAGR1792** - [@JAGR1792](https://github.com/JAGR1792)
  
Desarrollado como parte del curso de Estructura de Datos Lineales.

