from flask import Flask, request, redirect, url_for, render_template
import pandas as pd
import time
from memory_profiler import memory_usage
from functools import wraps

app = Flask(__name__)

def benchmark(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        mem_before = memory_usage()[0]
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        mem_after = memory_usage()[0]
        tiempo = end - start
        memoria = mem_after - mem_before
        return result, tiempo, memoria
    return wrapper

# -------------------------------Lista Enlazda Simple---------------------------------

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

lista = ListaEnlazada()

# Ruta principal - Menú
@app.route('/')
def index():
    return render_template('index.html')

# Rutas para Lista Simple
@app.route('/lista-simple')
def lista_simple():
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    resultado_busqueda = request.args.get('resultado')
    mensaje_busqueda = ''
    if resultado_busqueda is not None:
        if int(resultado_busqueda) >= 0:
            mensaje_busqueda = f'Elemento encontrado en la posición {resultado_busqueda}'
        else:
            mensaje_busqueda = 'Elemento no encontrado'

    return render_template(
        'lista_simple.html',
        datos=df.to_html(index=False),
        mensaje_busqueda=mensaje_busqueda,
        lista=lista)

@app.route('/lista-simple/buscar', methods=['POST'])
def buscar():
    valor = request.form['valor']
    posicion, tiempo, memoria = lista.buscar(valor)
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}'
    return render_template(
        'lista_simple.html',
        datos=df.to_html(index=False),
        mensaje_busqueda=mensaje,
        lista=lista,
        tiempos=f"{tiempo:.7f} s",
        memorias=f"{memoria:.6f} MB"
    )

@app.route('/lista-simple/insertar', methods=['POST'])
def insertar():
    valor = request.form['valor']
    tiempos = []
    memorias = []
    for valor in valor.split(','):
        _, t, m = lista.insertar(valor.strip())
        tiempos.append(t)
        memorias.append(m)
    tiempo_total = sum(tiempos)
    memoria_total = sum(memorias)
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    return render_template(
        'lista_simple.html',
        datos=df.to_html(index=False),
        mensaje_busqueda='',
        lista=lista,
        tiempos=f"{tiempo_total:.7f} s",
        memorias=f"{memoria_total:.6f} MB"
    )

@app.route('/lista-simple/eliminar', methods=['POST'])
def eliminar():
    valor = request.form['valor']
    tiempos = []
    memorias = []
    for valor in valor.split(','):
        _, t, m = lista.eliminar(valor.strip())
        tiempos.append(t)
        memorias.append(m)
    tiempo_total = sum(tiempos)
    memoria_total = sum(memorias)
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    return render_template(
        'lista_simple.html',
        datos=df.to_html(index=False),
        mensaje_busqueda='',
        lista=lista,
        tiempos=f"{tiempo_total:.7f} s",
        memorias=f"{memoria_total:.6f} MB"
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

lista_doble = ListaEnlazadaDoble()

# Rutas para Lista Doble
@app.route('/lista-doble')
def mostrar_lista_doble():
    datos = lista_doble.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    resultado_busqueda = request.args.get('resultado')
    mensaje_busqueda = ''
    if resultado_busqueda is not None:
        if int(resultado_busqueda) >= 0:
            mensaje_busqueda = f'Elemento encontrado en la posición {resultado_busqueda}'
        else:
            mensaje_busqueda = 'Elemento no encontrado'

    return render_template('lista_doble.html',
                         datos=df.to_html(index=False),
                         mensaje_busqueda=mensaje_busqueda,
                         lista=lista_doble)

@app.route('/lista-doble/buscar', methods=['POST'])
def buscar_doble():
    valor = request.form['valor']
    posicion, tiempo, memoria = lista_doble.buscar(valor)
    datos = lista_doble.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}'
    return render_template(
        'lista_doble.html',
        datos=df.to_html(index=False),
        mensaje_busqueda=mensaje,
        lista=lista_doble,
        tiempos=f"{tiempo:.7f} s",
        memorias=f"{memoria:.6f} MB"
    )

@app.route('/lista-doble/insertar', methods=['POST'])
def insertar_doble():
    valor = request.form['valor']
    tiempos = []
    memorias = []
    for valor in valor.split(','):
        _, t, m = lista_doble.insertar(valor.strip())
        tiempos.append(t)
        memorias.append(m)
    tiempo_total = sum(tiempos)
    memoria_total = sum(memorias)
    datos = lista_doble.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    return render_template(
        'lista_doble.html',
        datos=df.to_html(index=False),
        mensaje_busqueda='',
        lista=lista_doble,
        tiempos=f"{tiempo_total:.7f} s",
        memorias=f"{memoria_total:.6f} MB"
    )

@app.route('/lista-doble/eliminar', methods=['POST'])
def eliminar_doble():
    valor = request.form['valor']
    tiempos = []
    memorias = []
    for valor in valor.split(','):
        _, t, m = lista_doble.eliminar(valor.strip())
        tiempos.append(t)
        memorias.append(m)
    tiempo_total = sum(tiempos)
    memoria_total = sum(memorias)
    datos = lista_doble.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor']) if datos else pd.DataFrame(columns=['Valor'])
    return render_template(
        'lista_doble.html',
        datos=df.to_html(index=False),
        mensaje_busqueda='',
        lista=lista_doble,
        tiempos=f"{tiempo_total:.7f} s",
        memorias=f"{memoria_total:.6f} MB"
    )
if __name__ == '__main__':
    app.run(debug=True)