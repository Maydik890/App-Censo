const URLBASE = "https://censo.develotion.com/";
const MENU = document.querySelector("#menu");
const INICIO = document.querySelector("#pantalla-inicio");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const HOME = document.querySelector("#pantalla-home");
const CENSAR = document.querySelector("#pantalla-censar");
const CENSADOS = document.querySelector("#pantalla-censados");
const CANTCENS = document.querySelector("#pantalla-cantCens");
const MAPA = document.querySelector("#pantalla-mapa");
const ROUTER = document.querySelector("#ruteo");
const NAV = document.querySelector("ion-nav");

class Usuario {
  constructor(usuario, password) {
    this.usuario = usuario;
    this.password = password;
  }
}

class Censado {
  constructor(
    idUsuario,
    nombre,
    departamento,
    ciudad,
    fechaNacimiento,
    ocupacion
  ) {
    this.idUsuario = idUsuario;
    this.nombre = nombre;
    this.departamento = departamento;
    this.ciudad = ciudad;
    this.fechaNacimiento = fechaNacimiento;
    this.ocupacion = ocupacion;
  }
}
