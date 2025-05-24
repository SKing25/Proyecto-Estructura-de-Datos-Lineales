from flask import Flask, request, render_template
import pandas as pd
import time
from memory_profiler import memory_usage
from functools import wraps

app = Flask(__name__) # Inicializa la aplicación Flask

# Ruta principal - Menú
@app.route('/') # Define la ruta para la página principal
def index():
    return render_template('index.html') # Renderiza la plantilla index.html

if __name__ == '__main__': # Si este archivo se ejecuta directamente
    app.run(debug=True, host='0.0.0.0') # Inicia la aplicación Flask en modo de depuración

def benchmark(func):
    @wraps(func) # Decorador para mantener la firma original de la función
    def wrapper(*args, **kwargs): # Define una función interna que acepta cualquier número de argumentos y palabras clave.
        mem_before = memory_usage()[0] # Mide la memoria usada antes de ejecutar la función.
        start = time.perf_counter() # Guarda el tiempo de inicio de la ejecución
        result = func(*args, **kwargs) # Llama a la función original con los argumentos dados.
        end = time.perf_counter() # Guarda el tiempo de finalización de la ejecución
        mem_after = memory_usage()[0] # Mide la memoria usada después de ejecutar la función.
        tiempo = end - start # Calcula el tiempo total de ejecución
        memoria = mem_after - mem_before # Calcula la diferencia de memoria
        return result, tiempo, memoria # Retorna el resultado de la función original, tiempo y la diferencia de memoria
    return wrapper # Devuelve la función decorada (el wrapper).

# -------------------------------Lista Enlazada Simple---------------------------------

class Nodo:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None

class ListaEnlazada:
    def __init__(self):
        self.cabeza = None
        self.ultimo = None
        self.tamaño = 0

    @benchmark
    def insertar(self, dato):
        nuevo_nodo = Nodo(dato)
        if not self.cabeza:
            self.cabeza = nuevo_nodo
            self.ultimo = nuevo_nodo
        else:
            self.ultimo.siguiente = nuevo_nodo
            self.ultimo = nuevo_nodo
        self.tamaño += 1

    @benchmark
    def eliminar(self, dato):
        if not self.cabeza:
            return

        if self.cabeza.dato == dato:
            self.cabeza = self.cabeza.siguiente
            self.tamaño -= 1
            return

        actual = self.cabeza
        while actual.siguiente and actual.siguiente.dato != dato:
            actual = actual.siguiente

        if actual.siguiente:
            actual.siguiente = actual.siguiente.siguiente
            self.tamaño -= 1

    def obtener_lista(self):
        datos = []
        actual = self.cabeza
        while actual:
            datos.append(actual.dato)
            actual = actual.siguiente
        return datos

    @benchmark
    def buscar(self, dato):
        actual = self.cabeza
        posicion = 0
        while actual:
            if actual.dato == dato:
                return posicion
            actual = actual.siguiente
            posicion += 1
        return -1

lista = ListaEnlazada() # Crea una instancia de la lista enlazada simple

# Rutas para Lista Simple
@app.route('/lista-simple') # Define la ruta para la lista simple
def lista_simple():
    datos = lista.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_simple.html
        'lista_simple.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista) # Pasa la lista como contexto a la plantilla

@app.route('/lista-simple/buscar', methods=['POST']) # Define la ruta para buscar un elemento en la lista simple
def buscar():
    valor = request.form['valor'] # Obtiene el valor a buscar del formulario
    posicion, tiempo, memoria = lista.buscar(valor) # Llama a la función buscar y obtiene la posición, tiempo y memoria
    datos = lista.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}' # Mensaje de búsqueda
    return render_template( # Renderiza la plantilla lista_simple.html
        'lista_simple.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        mensaje_busqueda=mensaje, # Mensaje de búsqueda
        lista=lista, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
        memorias=f"{memoria:.6f} MB" # Memoria utilizada
    )

@app.route('/lista-simple/insertar', methods=['POST']) # Define la ruta para insertar un elemento en la lista simple
def insertar():
    valor = request.form['valor'] # Obtiene el valor a insertar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for valor in valor.split(','): # Recorre los valores separados por comas
        _, t, m = lista.insertar(valor.strip()) # Llama a la función insertar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias
    datos = lista.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_simple.html
        'lista_simple.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

@app.route('/lista-simple/eliminar', methods=['POST']) # Define la ruta para eliminar un elemento de la lista simple
def eliminar():
    valor = request.form['valor'] # Obtiene el valor a eliminar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for valor in valor.split(','): # Recorre los valores separados por comas
        _, t, m = lista.eliminar(valor.strip()) # Llama a la función eliminar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias
    datos = lista.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_simple.html
        'lista_simple.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

#---------------------------------Lista Enlazada Doble---------------------------------

class NodoDoble:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None
        self.anterior = None

class ListaEnlazadaDoble:
    def __init__(self):
        self.cabeza = None
        self.ultimo = None
        self.tamaño = 0

    @benchmark
    def insertar(self, dato):
        nuevo_nodo = NodoDoble(dato)
        if not self.cabeza:
            self.cabeza = nuevo_nodo
            self.ultimo = nuevo_nodo
        else:
            nuevo_nodo.anterior = self.ultimo
            self.ultimo.siguiente = nuevo_nodo
            self.ultimo = nuevo_nodo
        self.tamaño += 1

    @benchmark
    def eliminar(self, dato):
        if not self.cabeza:
            return

        actual = self.cabeza
        while actual and actual.dato != dato:
            actual = actual.siguiente

        if actual:
            if actual.anterior:
                actual.anterior.siguiente = actual.siguiente
            else:
                self.cabeza = actual.siguiente

            if actual.siguiente:
                actual.siguiente.anterior = actual.anterior
            else:
                self.ultimo = actual.anterior

            self.tamaño -= 1

    def obtener_lista(self):
        datos = []
        actual = self.cabeza
        while actual:
            datos.append(actual.dato)
            actual = actual.siguiente
        return datos

    @benchmark
    def buscar(self, dato):
        actual = self.cabeza
        posicion = 0
        while actual:
            if actual.dato == dato:
                return posicion
            actual = actual.siguiente
            posicion += 1
        return -1

lista_doble = ListaEnlazadaDoble() # Crea una instancia de la lista enlazada doble

# Rutas para Lista Doble
@app.route('/lista-doble') # Define la ruta para la lista doble
def mostrar_lista_doble():
    datos = lista_doble.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('lista_doble.html', # Renderiza la plantilla lista_doble.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=lista_doble) # Pasa la lista como contexto a la plantilla

@app.route('/lista-doble/buscar', methods=['POST']) # Define la ruta para buscar un elemento en la lista doble
def buscar_doble():
    valor = request.form['valor'] # Obtiene el valor a buscar del formulario
    posicion, tiempo, memoria = lista_doble.buscar(valor) # Llama a la función buscar y obtiene la posición, tiempo y memoria
    datos = lista_doble.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}' # Mensaje de búsqueda
    return render_template( # Renderiza la plantilla lista_doble.html
        'lista_doble.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        mensaje_busqueda=mensaje, # Mensaje de búsqueda
        lista=lista_doble, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
        memorias=f"{memoria:.6f} MB" # Memoria utilizada
    )

@app.route('/lista-doble/insertar', methods=['POST']) # Define la ruta para insertar un elemento en la lista doble
def insertar_doble():
    valor = request.form['valor'] # Obtiene el valor a insertar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for valor in valor.split(','): # Recorre los valores separados por comas
        _, t, m = lista_doble.insertar(valor.strip()) # Llama a la función insertar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias
    datos = lista_doble.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_doble.html
        'lista_doble.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista_doble, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

@app.route('/lista-doble/eliminar', methods=['POST']) # Define la ruta para eliminar un elemento de la lista doble
def eliminar_doble():
    valor = request.form['valor'] # Obtiene el valor a eliminar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for valor in valor.split(','): # Recorre los valores separados por comas
        _, t, m = lista_doble.eliminar(valor.strip()) # Llama a la función eliminar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias
    datos = lista_doble.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_doble.html
        'lista_doble.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista_doble, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

#-----------------------Lista Circular---------------------------------

class ListaCircular:
    def __init__(self):
        self.cabeza = None
        self.ultimo = None
        self.tamaño = 0

    @benchmark
    def insertar(self, dato):
        nuevo_nodo = Nodo(dato)
        if not self.cabeza:
            self.cabeza = nuevo_nodo
            self.ultimo = nuevo_nodo
            nuevo_nodo.siguiente = nuevo_nodo
        else:
            nuevo_nodo.siguiente = self.cabeza
            self.ultimo.siguiente = nuevo_nodo
            self.ultimo = nuevo_nodo
        self.tamaño += 1

    @benchmark
    def eliminar(self, dato):
        if not self.cabeza:
            return

        if self.cabeza.dato == dato:
            if self.tamaño == 1:
                self.cabeza = None
                self.ultimo = None
            else:
                self.cabeza = self.cabeza.siguiente
                self.ultimo.siguiente = self.cabeza
            self.tamaño -= 1
            return

        actual = self.cabeza
        while actual.siguiente != self.cabeza and actual.siguiente.dato != dato:
            actual = actual.siguiente

        if actual.siguiente != self.cabeza:
            if actual.siguiente == self.ultimo:
                self.ultimo = actual
            actual.siguiente = actual.siguiente.siguiente
            self.tamaño -= 1

    def obtener_lista(self):
        if not self.cabeza:
            return []
        datos = []
        actual = self.cabeza
        while True:
            datos.append(actual.dato)
            actual = actual.siguiente
            if actual == self.cabeza:
                break
        return datos

    @benchmark
    def buscar(self, dato):
        if not self.cabeza:
            return -1
        actual = self.cabeza
        posicion = 0
        while True:
            if actual.dato == dato:
                return posicion
            actual = actual.siguiente
            posicion += 1
            if actual == self.cabeza:
                break
        return -1

lista_circular = ListaCircular() # Crea una instancia de la lista circular

@app.route('/lista-circular') # Define la ruta para la lista circular
def mostrar_lista_circular():
    datos = lista_circular.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('lista_circular.html', # Renderiza la plantilla lista_circular.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=lista_circular) # Pasa la lista como contexto a la plantilla

@app.route('/lista-circular/buscar', methods=['POST']) # Define la ruta para buscar un elemento en la lista circular
def buscar_circular():
    valor = request.form['valor'] # Obtiene el valor a buscar del formulario
    posicion, tiempo, memoria = lista_circular.buscar(valor) # Llama a la función buscar y obtiene la posición, tiempo y memoria
    datos = lista_circular.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}' # Mensaje de búsqueda
    return render_template( # Renderiza la plantilla lista_circular.html
        'lista_circular.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        mensaje_busqueda=mensaje, # Mensaje de búsqueda
        lista=lista_circular, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
        memorias=f"{memoria:.6f} MB" # Memoria utilizada
    )

@app.route('/lista-circular/insertar', methods=['POST']) # Define la ruta para insertar un elemento en la lista circular
def insertar_circular():
    valor = request.form['valor'] # Obtiene el valor a insertar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for valor in valor.split(','): # Recorre los valores separados por comas
        _, t, m = lista_circular.insertar(valor.strip()) # Llama a la función insertar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias
    datos = lista_circular.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_circular.html
        'lista_circular.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista_circular, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

@app.route('/lista-circular/eliminar', methods=['POST']) # Define la ruta para eliminar un elemento de la lista circular
def eliminar_circular():
    valor = request.form['valor'] # Obtiene el valor a eliminar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for valor in valor.split(','): # Recorre los valores separados por comas
        _, t, m = lista_circular.eliminar(valor.strip()) # Llama a la función eliminar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias
    datos = lista_circular.obtener_lista() # Obtiene los datos de la lista
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla lista_circular.html
        'lista_circular.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=lista_circular, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

#-----------------------Pila basada en lista enlazada-----------------------------

class PilaLista:
    def __init__(self):
        self.tope = None
        self.tamaño = 0

    @benchmark
    def push(self, dato):
        nuevo_nodo = Nodo(dato)
        nuevo_nodo.siguiente = self.tope
        self.tope = nuevo_nodo
        self.tamaño += 1

    @benchmark
    def pop(self):
        if not self.tope:
            return None
        dato = self.tope.dato
        self.tope = self.tope.siguiente
        self.tamaño -= 1
        return dato

    @benchmark
    def peek(self):
        if not self.tope:
            return None
        return self.tope.dato

    def obtener_pila(self):
        datos = []
        actual = self.tope
        while actual:
            datos.append(actual.dato)
            actual = actual.siguiente
        return datos

pila_lista = PilaLista() # Crea una instancia de la pila basada en lista enlazada

@app.route('/pila-lista')
def mostrar_pila_lista():
    datos = pila_lista.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla pila_lista.html
        'pila_lista.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=pila_lista, # Pasa la lista como contexto a la plantilla
    )

@app.route('/pila-lista/push', methods=['POST']) # Define la ruta para insertar un elemento en la pila
def push_pila_lista():
    valor = request.form['valor'] # Obtiene el valor a insertar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for val in valor.split(','): # Recorre los valores separados por comas
        _, t, m = pila_lista.push(val.strip()) # Llama a la función push y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias

    datos = pila_lista.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla pila_lista.html
        'pila_lista.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=pila_lista, # Pasa la lista como contexto a la plantilla
        tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
        memorias=f"{memoria_total:.6f} MB" # Memoria total utilizada
    )

@app.route('/pila-lista/pop', methods=['POST']) # Define la ruta para eliminar un elemento de la pila
def pop_pila_lista():
    dato, tiempo, memoria = pila_lista.pop() # Llama a la función pop y obtiene el dato, tiempo y memoria
    mensaje = f'Elemento extraído: {dato}' if dato else 'Pila vacía' # Mensaje de extracción

    datos = pila_lista.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla pila_lista.html
        'pila_lista.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=pila_lista, # Pasa la lista como contexto a la plantilla
        mensaje_busqueda=mensaje, # Mensaje de extracción
        tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
        memorias=f"{memoria:.6f} MB" # Memoria utilizada
    )

@app.route('/pila-lista/peek', methods=['POST']) # Define la ruta para ver el elemento en la parte superior de la pila
def peek_pila_lista():
    dato, tiempo, memoria = pila_lista.peek() # Llama a la función peek y obtiene el dato, tiempo y memoria
    mensaje = f'Elemento en el tope: {dato}' if dato else 'Pila vacía' # Mensaje de vista

    datos = pila_lista.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template( # Renderiza la plantilla pila_lista.html
        'pila_lista.html',
        datos=df.to_html(index=False), # Convierte el DataFrame a HTML
        lista=pila_lista, # Pasa la lista como contexto a la plantilla
        mensaje_busqueda=mensaje, # Mensaje de vista
        tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
        memorias=f"{memoria:.6f} MB" # Memoria utilizada
    )

#-----------------------Pila basada en arreglo-----------------------------

class PilaArreglo:
    def __init__(self):
        self.items = []
        self.tamaño = 0

    @benchmark
    def push(self, dato):
        self.items.append(dato)
        self.tamaño += 1

    @benchmark
    def pop(self):
        if self.esta_vacia():
            return None
        self.tamaño -= 1
        return self.items.pop()

    @benchmark
    def peek(self):
        if self.esta_vacia():
            return None
        return self.items[-1]

    def esta_vacia(self):
        return self.tamaño == 0

    def obtener_pila(self):
        return self.items[::-1]  # Retorna una copia invertida para mostrar el tope arriba

pila_arreglo = PilaArreglo()  # Instancia global de la pila

@app.route('/pila-arreglo') # Define la ruta para la pila basada en arreglo
def mostrar_pila_arreglo():
    datos = pila_arreglo.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('pila_arreglo.html', # Renderiza la plantilla pila_arreglo.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=pila_arreglo) # Pasa la lista como contexto a la plantilla

@app.route('/pila-arreglo/push', methods=['POST']) # Define la ruta para insertar un elemento en la pila basada en arreglo
def push_pila_arreglo():
    valor = request.form['valor'] # Obtiene el valor a insertar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for val in valor.split(','): # Recorre los valores separados por comas
        _, t, m = pila_arreglo.push(val.strip()) # Llama a la función push y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias

    datos = pila_arreglo.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('pila_arreglo.html', # Renderiza la plantilla pila_arreglo.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=pila_arreglo, # Pasa la lista como contexto a la plantilla
                         tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
                         memorias=f"{memoria_total:.6f} MB") # Memoria total utilizada

@app.route('/pila-arreglo/pop', methods=['POST']) # Define la ruta para eliminar un elemento de la pila basada en arreglo
def pop_pila_arreglo():
    dato, tiempo, memoria = pila_arreglo.pop() # Llama a la función pop y obtiene el dato, tiempo y memoria
    mensaje = f'Elemento extraído: {dato}' if dato else 'Pila vacía' # Mensaje de extracción

    datos = pila_arreglo.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('pila_arreglo.html', # Renderiza la plantilla pila_arreglo.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=pila_arreglo, # Pasa la lista como contexto a la plantilla
                         mensaje_busqueda=mensaje, # Mensaje de extracción
                         tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
                         memorias=f"{memoria:.6f} MB") # Memoria utilizada

@app.route('/pila-arreglo/peek', methods=['POST']) # Define la ruta para ver el elemento en la parte superior de la pila basada en arreglo
def peek_pila_arreglo():
    dato, tiempo, memoria = pila_arreglo.peek() # Llama a la función peek y obtiene el dato, tiempo y memoria
    mensaje = f'Elemento en el tope: {dato}' if dato else 'Pila vacía' # Mensaje de vista

    datos = pila_arreglo.obtener_pila() # Obtiene los datos de la pila
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('pila_arreglo.html', # Renderiza la plantilla pila_arreglo.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=pila_arreglo, # Pasa la lista como contexto a la plantilla
                         mensaje_busqueda=mensaje, # Mensaje de vista
                         tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
                         memorias=f"{memoria:.6f} MB") # Memoria utilizada

#-------------------------------Cola Simple-------------------------------------

class ColaSimple:
    def __init__(self):
        self.items = []
        self.tamaño = 0

    @benchmark
    def encolar(self, dato):
        self.items.append(dato)
        self.tamaño += 1

    @benchmark
    def desencolar(self):
        if self.esta_vacia():
            return None
        self.tamaño -= 1
        return self.items.pop(0)

    @benchmark
    def buscar(self, dato):
        try:
            return self.items.index(dato)
        except ValueError:
            return -1

    def esta_vacia(self):
        return self.tamaño == 0

    def obtener_cola(self):
        return self.items

    def peek(self):
        return self.items[0] if not self.esta_vacia() else None

cola_simple = ColaSimple()  # Instancia global de la cola

@app.route('/cola-simple') # Define la ruta para la cola simple
def mostrar_cola_simple():
    datos = cola_simple.obtener_cola() # Obtiene los datos de la cola
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('cola_simple.html', # Renderiza la plantilla cola_simple.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=cola_simple) # Pasa la lista como contexto a la plantilla

@app.route('/cola-simple/encolar', methods=['POST']) # Define la ruta para insertar un elemento en la cola simple
def encolar():
    valor = request.form['valor'] # Obtiene el valor a insertar del formulario
    tiempos = [] # Inicializa una lista para almacenar los tiempos
    memorias = [] # Inicializa una lista para almacenar las memorias
    for val in valor.split(','): # Recorre los valores separados por comas
        _, t, m = cola_simple.encolar(val.strip()) # Llama a la función encolar y obtiene el tiempo y memoria
        tiempos.append(t) # Agrega el tiempo a la lista de tiempos
        memorias.append(m) # Agrega la memoria a la lista de memorias
    tiempo_total = sum(tiempos) # Suma todos los tiempos
    memoria_total = sum(memorias) # Suma todas las memorias

    datos = cola_simple.obtener_cola() # Obtiene los datos de la cola
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    peek = f'Primer elemento en la cola: {cola_simple.peek()}' if not cola_simple.esta_vacia() else 'Cola vacía' # Mensaje de vista
    return render_template('cola_simple.html', # Renderiza la plantilla cola_simple.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=cola_simple, # Pasa la lista como contexto a la plantilla
                         mensaje_busqueda=peek, # Mensaje de vista
                         tiempos=f"{tiempo_total:.7f} s", # Tiempo total de ejecución
                         memorias=f"{memoria_total:.6f} MB") # Memoria total utilizada

@app.route('/cola-simple/desencolar', methods=['POST']) # Define la ruta para eliminar un elemento de la cola simple
def desencolar():
    dato, tiempo, memoria = cola_simple.desencolar() # Llama a la función desencolar y obtiene el dato, tiempo y memoria
    mensaje = f'Elemento desencolado: {dato}' if dato else 'Cola vacía' # Mensaje de extracción
    peek = f'Primer elemento en la cola: {cola_simple.peek()}' if not cola_simple.esta_vacia() else 'Cola vacía' # Mensaje de vista
    mensaje_completo = f'{mensaje} | {peek}' # Mensaje completo

    datos = cola_simple.obtener_cola() # Obtiene los datos de la cola
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    return render_template('cola_simple.html', # Renderiza la plantilla cola_simple.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=cola_simple, # Pasa la lista como contexto a la plantilla
                         mensaje_busqueda=mensaje_completo, # Mensaje de extracción
                         tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
                         memorias=f"{memoria:.6f} MB") # Memoria utilizada
@app.route('/cola-simple/buscar', methods=['POST']) # Define la ruta para buscar un elemento en la cola simple
def buscar_cola():
    valor = request.form['valor'] # Obtiene el valor a buscar del formulario
    posicion, tiempo, memoria = cola_simple.buscar(valor) # Llama a la función buscar y obtiene la posición, tiempo y memoria
    datos = cola_simple.obtener_cola() # Obtiene los datos de la cola
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor']) # Crea un DataFrame de pandas con los datos
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}' # Mensaje de búsqueda
    peek = f'Primer elemento en la cola: {cola_simple.peek()}' if not cola_simple.esta_vacia() else 'Cola vacía' # Mensaje de vista
    mensaje_completo = f'{mensaje} | {peek}' # Mensaje completo
    return render_template('cola_simple.html', # Renderiza la plantilla cola_simple.html
                         datos=df.to_html(index=False), # Convierte el DataFrame a HTML
                         lista=cola_simple, # Pasa la lista como contexto a la plantilla
                         mensaje_busqueda=mensaje_completo, # Mensaje de búsqueda
                         tiempos=f"{tiempo:.7f} s", # Tiempo de ejecución
                         memorias=f"{memoria:.6f} MB") # Memoria utilizada