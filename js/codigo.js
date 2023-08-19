Inicializar();

function Inicializar() {
  AgregarEventos();
  ArmarMenuOpciones();
  getGeolocation();
}

function ArmarMenuOpciones() {
  let HayToken = localStorage.getItem("apiKey");
  let Opciones = "";
  if (HayToken) {
    Opciones += `<ion-item onclick="cerrarMenu()" href="/censar">Censar</ion-item>
    <ion-item onclick="cerrarMenu()" href="/censados">Lista censados</ion-item>
    <ion-item onclick="cerrarMenu()" href="/cantCens">Cantidad censados</ion-item>
    <ion-item onclick="cerrarMenu()" href="/mapa">Mapa</ion-item>
    <ion-item onclick="logout()" >LOGOUT</ion-item>`;
  } else {
    Opciones += `<ion-item onclick="cerrarMenu()" href="/login">Login</ion-item>
    <ion-item onclick="cerrarMenu()" href="/registro">Registro</ion-item>`;
  }
  dqs("menuOpciones").innerHTML = Opciones;
}

function AgregarEventos() {
  ROUTER.addEventListener("ionRouteDidChange", Navegar);
  document
    .querySelector("#btnRegistrar")
    .addEventListener("click", TomarDatosRegistro);
  document
    .querySelector("#btnLoguear")
    .addEventListener("click", TomarDatosLogin);
  document.querySelector("#fechaNac").addEventListener("ionChange", verFecha);
  document.addEventListener("DOMContentLoaded", showSplash);
  document
    .querySelector("#select-depa")
    .addEventListener("ionChange", ObtenerCiudades);
  document
    .querySelector("#btnCensar")
    .addEventListener("click", TomarDatosCensados);
  document
    .querySelector("#btnFiltrar")
    .addEventListener("click", ObtenerPersona);
  document
    .querySelector("#btnMapa")
    .addEventListener("click", ObtenerCiudadPersona);
}
function showSplash() {
  let HayToken = localStorage.getItem("apiKey");
  if (HayToken) {
    setTimeout(function () {
      window.location.href = "#/censar";
    }, 0);
  } else {
    setTimeout(function () {
      window.location.href = "#/login";
    }, 2000);
  }
}

function dqs(id) {
  return document.querySelector("#" + id);
}

function Navegar(evt) {
  console.log(evt);
  OcultarPantallas();
  const ruta = evt.detail.to;
  if (ruta == "/login") {
    LOGIN.style.display = "block";
  } else if (ruta == "/registro") {
    REGISTRO.style.display = "block";
  } else if (ruta == "/censar") {
    CENSAR.style.display = "block";
    ObtenerDepartamento();
  } else if (ruta == "/censados") {
    CENSADOS.style.display = "block";
    ObtenerPersona();
    Loading("cargando");
  } else if (ruta == "/cantCens") {
    CANTCENS.style.display = "block";
    ObtenerCantCens();
  } else if (ruta == "/mapa") {
    MAPA.style.display = "block";
    CrearMapa();
  }
}

function OcultarPantallas() {
  LOGIN.style.display = "none";
  REGISTRO.style.display = "none";
  CENSAR.style.display = "none";
  CENSADOS.style.display = "none";
  CANTCENS.style.display = "none";
  MAPA.style.display = "none";
}
function cerrarMenu() {
  MENU.close();
}

function TomarDatosRegistro() {
  let usuario = dqs("regEmail").value;
  let password = dqs("regPassword").value;

  let usu = new Usuario(usuario, password);
  Registrar(usu);
}

function Registrar(u) {
  Loading("Registrando");
  fetch(`${URLBASE}usuarios.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(u),
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      loading.dismiss();
      if (data.codigo == 200) {
        let token = data.apiKey;
        let id = data.id;
        localStorage.setItem("apiKey", token);
        localStorage.setItem("id", id);
        NAV.push("page-censar");
        ArmarMenuOpciones();
      } else {
        Alertar("ERROR", "Revisar", data.error);
      }
    });
}

function TomarDatosLogin() {
  let email = dqs("logEmail").value;
  let password = dqs("logPassword").value;

  Login(email, password);
}

function Login(e, p) {
  let u = new Object();
  u.usuario = e;
  u.password = p;
  Loading("Iniciando sesión");
  fetch(`${URLBASE}login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(u),
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      loading.dismiss();
      console.log(data);
      if (data.codigo == "200") {
        let token = data.apiKey;
        let id = data.id;
        localStorage.setItem("apiKey", token);
        localStorage.setItem("id", id);
        NAV.push("page-censar");
        ArmarMenuOpciones();
      } else {
        Alertar(
          "Error",
          "No se pudo iniciar sesion",
          "Usuario o contraseña incorrectos"
        );
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function Alertar(titulo, subtitulo, mensaje) {
  const alert = document.createElement("ion-alert");
  alert.cssClass = "my-custom-class";
  alert.header = titulo;
  alert.subHeader = subtitulo;
  alert.message = mensaje;
  alert.buttons = ["OK"];

  document.body.appendChild(alert);
  alert.present();
}

const loading = document.createElement("ion-loading");
function Loading(texto) {
  loading.cssClass = "my-custom-class";
  loading.message = texto;
  //loading.duration = 2000;

  document.body.appendChild(loading);
  loading.present();
}

function verFecha(ev) {
  let nacimiento = new Date(ev.detail.value);
  EsMayor(nacimiento);
}

function EsMayor(fNacimiento) {
  let fnacSumado18 = fNacimiento.setFullYear(fNacimiento.getFullYear() + 18);
  let hoy = new Date();
  let mayor = true;
  if (hoy < fnacSumado18) {
    mayor = false;
  }
  obtenerOcupaciones(mayor);
}
function ObtenerDepartamento() {
  fetch(`${URLBASE}departamentos.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      let departamentos = data.departamentos;
      ArmadoDepartamentos(departamentos);
    })
    .catch(function (error) {
      console.log(error);
    });
}
let selectDepa = dqs("select-depa");
function ArmadoDepartamentos(dep) {
  let option = "";
  dep.forEach(function (dep) {
    option += `<ion-select-option value="${dep.id}">${dep.nombre}</ion-select-option>  `;
  });
  selectDepa.innerHTML = option;
}

function ObtenerCiudades(ev) {
  const idDep = ev.detail.value;
  fetch(`${URLBASE}ciudades.php?idDepartamento=${idDep}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      let ciudades = data.ciudades;
      ArmadoCiudades(ciudades);
    })
    .catch(function (error) {
      console.log(error);
    });
}
let selectCiud = dqs("select-ciud");
function ArmadoCiudades(ciu) {
  let option = "";
  ciu.forEach(function (ciu) {
    option += `<ion-select-option value="${ciu.id}">${ciu.nombre}</ion-select-option>  `;
  });
  selectCiud.innerHTML = option;
}
function obtenerOcupaciones(mayor) {
  fetch(`${URLBASE}ocupaciones.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      let ocupacion = data.ocupaciones;
      ArmarOcupaciones(ocupacion, mayor);
    })
    .catch(function (error) {
      console.log(error);
    });
}
let selectOcupa = dqs("select-ocupa");
function ArmarOcupaciones(ocupa, mayor) {
  let option = "";
  if (!mayor) {
    option = `<ion-select-option value="5">Estudiante</ion-select-option>  `;
  } else {
    ocupa.forEach(function (ocupa) {
      option += `<ion-select-option value="${ocupa.id}">${ocupa.ocupacion}</ion-select-option>  `;
    });
  }
  selectOcupa.innerHTML = option;
}
function TomarDatosCensados() {
  let idUser = localStorage.getItem("id");
  let nombre = dqs("nombreCensado").value;
  let departamento = dqs("select-depa").value;
  let ciudad = dqs("select-ciud").value;
  let fechaNacimient = dqs("fechaNac").value;
  let ocupacion = dqs("select-ocupa").value;
  if (!idUser || !nombre || !departamento || !ciudad || !ocupacion) {
    Alertar("Error", "No se pudo agregar", "Hay campos vacios");
  } else {
    let cens = new Censado(
      idUser,
      nombre,
      departamento,
      ciudad,
      fechaNacimient,
      ocupacion
    );
    agregarCensado(cens);
  }
}
function agregarCensado(cens) {
  let id = localStorage.getItem("id");

  Loading("Agregando");
  fetch(`${URLBASE}personas.php?idUsuario=${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
    body: JSON.stringify(cens),
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      loading.dismiss();
      console.log(data);
      if (data.codigo == "200") {
        Alertar("Exito", "Agregado", "Censado con exito");
      } else {
        Alertar(data.codigo);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function ObtenerPersona() {
  let id = localStorage.getItem("id");
  fetch(`${URLBASE}personas.php?idUsuario=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      let pers = data.personas;
      ArmarListaCensados(pers);
      ObtenerLatLong(pers.departamento);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function ArmarListaCensados(personas) {
  let lista = dqs("lista-censados");
  lista.innerHTML = "";
  let opciones = "";
  let valor = dqs("select-filtro").value;
  personas.forEach(function (persona) {
    if (valor == persona.ocupacion || valor == 0) {
      opciones += `
    <ion-item-sliding>
    <ion-item>
      <ion-label>${persona.nombre} ${persona.fechaNacimiento} ${persona.ocupacion}</ion-label>
    </ion-item>
    <ion-item-options>  
      <ion-item-option color="danger" onclick="EliminarPersona(${persona.id})">Eliminar</ion-item-option>
    </ion-item-options>
  </ion-item-sliding>`;
    }
  });
  lista.innerHTML = opciones;
  loading.dismiss();
}
function EliminarPersona(id) {
  Loading("Eliminando");
  fetch(`${URLBASE}personas.php?idCenso=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      loading.dismiss();
      if (data.codigo == 200) {
        Alertar("Exito", "Censado eliminado con exito", "");
        ObtenerPersona();
      } else {
        Alertar("Error", "Hubo un error", data.codigo);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function ObtenerCantCens() {
  let id = localStorage.getItem("id");
  fetch(`${URLBASE}personas.php?idUsuario=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      let pers = data.personas;
      ArmarCantCens(pers);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function ArmarCantCens(pers) {
  let mont = 0;
  let restpais = 0;
  let mostrarmont = dqs("Mont");
  let mosrarrest = dqs("restPais");

  pers.forEach(function (pers) {
    if (pers.departamento == 3218) {
      mont++;
    } else {
      restpais++;
    }
  });
  mostrarmont.innerHTML = mont;
  mosrarrest.innerHTML = restpais;
}

let MiLatitud;
let MiLongitud;
function getGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(mostrarMiUbicacion);
  } else {
    console.log("no soportado");
  }
}

function mostrarMiUbicacion(position) {
  MiLatitud = position.coords.latitude;
  MiLongitud = position.coords.longitude;
  console.log(MiLatitud);
  console.log(MiLongitud);
  setTimeout(function () {
    CrearMapa();
  }, 2000);
}
var map;
function CrearMapa() {
  if (map != null) {
    map.remove();
  }
  map = L.map("map").setView([MiLatitud, MiLongitud], 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  var greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.marker([MiLatitud, MiLongitud], {
    icon: greenIcon,
  })
    .addTo(map)
    .bindPopup(`Yo`)
    .openPopup();
}
function CrearMarcadores(ciudad) {
  let radioKm = dqs("kmMapa").value;
  Loading("Buscando");
  loading.dismiss();
  ciudad.forEach(function (ciudad) {
    let ciudadLatLng = [ciudad.latitud, ciudad.longitud];
    let userLatLng = [MiLatitud, MiLongitud];
    let distancia = calcularDistancia(userLatLng, ciudadLatLng);
    L.circle(userLatLng, {
      color: "lightgreen",
      fillColor: "lightgreen",
      fillOpacity: 0.01,
      radius: radioKm * 1000,
    }).addTo(map);

    if (distancia <= radioKm) {
      L.marker(ciudadLatLng)
        .addTo(map)
        .bindPopup(
          `Ciudad: ${ciudad.nombre}<br>Distancia: ${distancia.toFixed(2)} km`
        )
        .openPopup();
    }
  });
}
function calcularDistancia(coord1, coord2) {
  let distancia = map.distance(coord1, coord2) / 1000;
  return distancia;
}

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

function ObtenerCiudadPersona() {
  let id = localStorage.getItem("id");
  fetch(`${URLBASE}personas.php?idUsuario=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      idUser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      let dep = data.personas;
      ObtenerLatLong(dep);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function ObtenerLatLong(Dep) {
  Dep.forEach(function (idDep) {
    let id = idDep.departamento;
    fetch(`${URLBASE}ciudades.php?idDepartamento=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: localStorage.getItem("apiKey"),
        idUser: localStorage.getItem("id"),
      },
    })
      .then(function (response) {
        console.log(response);
        return response.json();
      })
      .then(function (data) {
        let ciu = data.ciudades;
        CrearMarcadores(ciu);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

function logout() {
  localStorage.clear();
  NAV.push("page-login");
  cerrarMenu();
  ArmarMenuOpciones();
}
