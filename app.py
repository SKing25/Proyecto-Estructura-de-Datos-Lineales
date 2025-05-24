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

# -------------------------------Lista Enlazda Simple---------------------------------

class Nodo:
    def __init__(self, dato):
        self.dato = dato # Almacena el dato
        self.siguiente = None # Inicializa el siguiente nodo como None

class ListaEnlazada:
    def __init__(self):
        self.cabeza = None # Inicializa la cabeza de la lista como None
        self.ultimo = None # Inicializa el último nodo como None
        self.tamaño = 0 # Inicializa el tamaño de la lista como 0

    @benchmark # Decorador para medir el tiempo y memoria de la función
    def insertar(self, dato):
        nuevo_nodo = Nodo(dato) # Crea un nuevo nodo con el dato dado
        if not self.cabeza: # Si la lista está vacía
            self.cabeza = nuevo_nodo # Asigna el nuevo nodo como cabeza
            self.ultimo = nuevo_nodo # Asigna el nuevo nodo como último
        else:
            self.ultimo.siguiente = nuevo_nodo # Asigna el siguiente del último nodo al nuevo nodo
            self.ultimo = nuevo_nodo # Actualiza el último nodo a ser el nuevo nodo
        self.tamaño += 1 # Incrementa el tamaño de la lista

    @benchmark # Decorador para medir el tiempo y memoria de la función
    def eliminar(self, dato):
        if not self.cabeza: # Si la lista está vacía
            return # No hay nada que eliminar

        if self.cabeza.dato == dato: # Si el dato a eliminar es la cabeza
            self.cabeza = self.cabeza.siguiente # Actualiza la cabeza al siguiente nodo
            self.tamaño -= 1 # Decrementa el tamaño de la lista
            return # Sale de la función

        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        while actual.siguiente and actual.siguiente.dato != dato: # Recorre la lista hasta encontrar el nodo a eliminar
            actual = actual.siguiente # Avanza al siguiente nodo

        if actual.siguiente: # Si se encontró el nodo a eliminar
            actual.siguiente = actual.siguiente.siguiente # Salta el nodo a eliminar
            self.tamaño -= 1 # Decrementa el tamaño de la lista

    def obtener_lista(self):
        datos = [] # Inicializa una lista vacía para almacenar los datos
        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        while actual: # Recorre la lista
            datos.append(actual.dato) # Agrega el dato del nodo actual a la lista de datos
            actual = actual.siguiente # Avanza al siguiente nodo
        return datos # Retorna la lista de datos

    @benchmark # Decorador para medir el tiempo y memoria de la función
    def buscar(self, dato):
        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        posicion = 0 # Inicializa la posición como 0
        while actual: # Recorre la lista
            if actual.dato == dato: # Si el dato del nodo actual es igual al dato buscado
                return posicion # Retorna la posición del nodo
            actual = actual.siguiente # Avanza al siguiente nodo
            posicion += 1 # Incrementa la posición
        return -1 # Retorna -1 si no se encontró el dato

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
        self.dato = dato # Almacena el dato
        self.siguiente = None # Inicializa el siguiente nodo como None
        self.anterior = None # Inicializa el nodo anterior como None

class ListaEnlazadaDoble:
    def __init__(self):
        self.cabeza = None # Inicializa la cabeza de la lista como None
        self.ultimo = None # Inicializa el último nodo como None
        self.tamaño = 0 # Inicializa el tamaño de la lista como 0

    @benchmark
    def insertar(self, dato):
        nuevo_nodo = NodoDoble(dato) # Crea un nuevo nodo con el dato dado
        if not self.cabeza: # Si la lista está vacía
            self.cabeza = nuevo_nodo # Asigna el nuevo nodo como cabeza
            self.ultimo = nuevo_nodo # Asigna el nuevo nodo como último
        else:
            nuevo_nodo.anterior = self.ultimo # Asigna el nodo anterior al último nodo
            self.ultimo.siguiente = nuevo_nodo # Asigna el siguiente del último nodo al nuevo nodo
            self.ultimo = nuevo_nodo # Actualiza el último nodo a ser el nuevo nodo
        self.tamaño += 1 # Incrementa el tamaño de la lista

    @benchmark
    def eliminar(self, dato):
        if not self.cabeza: # Si la lista está vacía
            return # No hay nada que eliminar

        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        while actual and actual.dato != dato: # Recorre la lista hasta encontrar el nodo a eliminar
            actual = actual.siguiente # Avanza al siguiente nodo

        if actual: # Si se encontró el nodo a eliminar
            if actual.anterior: # Si no es el primer nodo
                actual.anterior.siguiente = actual.siguiente # Salta el nodo a eliminar
            else:
                self.cabeza = actual.siguiente # Actualiza la cabeza al siguiente nodo

            if actual.siguiente: # Si no es el último nodo
                actual.siguiente.anterior = actual.anterior # Salta el nodo a eliminar
            else:
                self.ultimo = actual.anterior # Actualiza el último nodo al anterior

            self.tamaño -= 1 # Decrementa el tamaño de la lista

    def obtener_lista(self):
        datos = [] # Inicializa una lista vacía para almacenar los datos
        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        while actual: # Recorre la lista
            datos.append(actual.dato) # Agrega el dato del nodo actual a la lista de datos
            actual = actual.siguiente # Avanza al siguiente nodo
        return datos # Retorna la lista de datos

    @benchmark
    def buscar(self, dato):
        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        posicion = 0 # Inicializa la posición como 0
        while actual: # Recorre la lista
            if actual.dato == dato: # Si el dato del nodo actual es igual al dato buscado
                return posicion # Retorna la posición del nodo
            actual = actual.siguiente # Avanza al siguiente nodo
            posicion += 1 # Incrementa la posición
        return -1 # Retorna -1 si no se encontró el dato

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
        self.cabeza = None # Inicializa la cabeza de la lista como None
        self.ultimo = None # Inicializa el último nodo como None
        self.tamaño = 0 # Inicializa el tamaño de la lista como 0

    @benchmark
    def insertar(self, dato):
        nuevo_nodo = Nodo(dato) # Crea un nuevo nodo con el dato dado
        if not self.cabeza: # Si la lista está vacía
            self.cabeza = nuevo_nodo # Asigna el nuevo nodo como cabeza
            self.ultimo = nuevo_nodo # Asigna el nuevo nodo como último
            nuevo_nodo.siguiente = nuevo_nodo # Apunta a sí mismo
        else:
            nuevo_nodo.siguiente = self.cabeza # Asigna el siguiente del nuevo nodo a la cabeza
            self.ultimo.siguiente = nuevo_nodo # Asigna el siguiente del último nodo al nuevo nodo
            self.ultimo = nuevo_nodo # Actualiza el último nodo a ser el nuevo nodo
        self.tamaño += 1 # Incrementa el tamaño de la lista

    @benchmark
    def eliminar(self, dato):
        if not self.cabeza: # Si la lista está vacía
            return # No hay nada que eliminar

        if self.cabeza.dato == dato: # Si el dato a eliminar es la cabeza
            if self.tamaño == 1: # Si solo hay un nodo
                self.cabeza = None # Actualiza la cabeza a None
                self.ultimo = None # Actualiza el último nodo a None
            else:
                self.cabeza = self.cabeza.siguiente # Actualiza la cabeza al siguiente nodo
                self.ultimo.siguiente = self.cabeza # Actualiza el siguiente del último nodo a la nueva cabeza
            self.tamaño -= 1 # Decrementa el tamaño de la lista
            return # Sale de la función

        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        while actual.siguiente != self.cabeza and actual.siguiente.dato != dato: # Recorre la lista hasta encontrar el nodo a eliminar
            actual = actual.siguiente # Avanza al siguiente nodo

        if actual.siguiente != self.cabeza: # Si se encontró el nodo a eliminar
            if actual.siguiente == self.ultimo: # Si es el último nodo
                self.ultimo = actual # Actualiza el último nodo al anterior
            actual.siguiente = actual.siguiente.siguiente # Salta el nodo a eliminar
            self.tamaño -= 1 # Decrementa el tamaño de la lista

    def obtener_lista(self):
        if not self.cabeza: # Si la lista está vacía
            return [] # Retorna una lista vacía
        datos = [] # Inicializa una lista vacía para almacenar los datos
        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        while True: # Recorre la lista
            datos.append(actual.dato) # Agrega el dato del nodo actual a la lista de datos
            actual = actual.siguiente # Avanza al siguiente nodo
            if actual == self.cabeza: # Si se ha vuelto a la cabeza
                break # Sale del bucle
        return datos # Retorna la lista de datos

    @benchmark
    def buscar(self, dato):
        if not self.cabeza: # Si la lista está vacía
            return -1 # Retorna -1
        actual = self.cabeza # Inicializa el nodo actual como la cabeza
        posicion = 0 # Inicializa la posición como 0
        while True: # Recorre la lista
            if actual.dato == dato: # Si el dato del nodo actual es igual al dato buscado
                return posicion # Retorna la posición del nodo
            actual = actual.siguiente # Avanza al siguiente nodo
            posicion += 1 # Incrementa la posición
            if actual == self.cabeza: # Si se ha vuelto a la cabeza
                break # Sale del bucle
        return -1 # Retorna -1 si no se encontró el dato

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

if __name__ == '__main__': # Si este archivo se ejecuta directamente
    app.run(debug=True, host='0.0.0.0') # Inicia la aplicación Flask en modo de depuración