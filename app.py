from flask import Flask, request, redirect, url_for, render_template
import pandas as pd
import time
from memory_profiler import memory_usage
from functools import wraps

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

app = Flask(__name__)
lista = ListaEnlazada()

@app.route('/')
def index():
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor'])
    resultado_busqueda = request.args.get('resultado')
    mensaje_busqueda = ''
    if resultado_busqueda is not None:
        if int(resultado_busqueda) >= 0:
            mensaje_busqueda = f'Elemento encontrado en la posición {resultado_busqueda}'
        else:
            mensaje_busqueda = 'Elemento no encontrado'

    return render_template('index.html', datos=df.to_html(index=False), mensaje_busqueda=mensaje_busqueda, lista=lista)

@app.route('/buscar', methods=['POST'])
def buscar():
    valor = request.form['valor']
    posicion, tiempo, memoria = lista.buscar(valor)
    datos = lista.obtener_lista()
    df = pd.DataFrame(datos, columns=['Valor'])
    mensaje = f'Elemento {"encontrado en posición " + str(posicion) if posicion >= 0 else "no encontrado"}'
    return render_template(
        'index.html',
        datos=df.to_html(index=False),
        mensaje_busqueda=mensaje,
        lista=lista,
        tiempos=f"{tiempo:.7f} s",
        memorias=f"{memoria:.6f} MB"
    )

@app.route('/insertar', methods=['POST'])
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
    df = pd.DataFrame(datos, columns=['Valor'])
    return render_template(
        'index.html',
        datos=df.to_html(index=False),
        mensaje_busqueda='',
        lista=lista,
        tiempos=f"{tiempo_total:.7f} s",
        memorias=f"{memoria_total:.6f} MB"
    )

@app.route('/eliminar', methods=['POST'])
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
    df = pd.DataFrame(datos, columns=['Valor'])
    return render_template(
        'index.html',
        datos=df.to_html(index=False),
        mensaje_busqueda='',
        lista=lista,
        tiempos=f"{tiempo_total:.7f} s",
        memorias=f"{memoria_total:.6f} MB"
    )

if __name__ == '__main__':
    app.run(debug=True)