'use strict'

//Importar librerias
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const DBVDialogLib = require('./DBVDialogLib');

//Importar librerias googleCalendar
const {google} = require('googleapis');
require('dotenv').config();

// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({version : "v3"});

const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

//Uso de express
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json()); //Para analizar Json

//Si alguien intenta acceder desde un navegador
server.get('/', (req, res) => {
    return res.json("Hola, creo que tú no deberias de estar aquí");
});

server.post("/dentista", (req, res) => {
  let contexto = "nada";
  let respuestaEnviada = false;
  let textoEnviar = 'Peticion incorrecta post recibida';
  let resultado;
  try {
    contexto = req.body.queryResult.action;
    textoEnviar = `recibida petición de ${contexto}`;
  } catch (error) {
    console.log("Error contexto vacio:" + error);
  }
  if (req.body.queryResult.parameters) {
    console.log("parámetros:" + req.body.queryResult.parameters);
  } else {
    console.log("Sin parámetros");
  }if (contexto ==="cita.cita-custom"){
    let fecha = req.body.queryResult.parameters.fecha;
    let hora = req.body.queryResult.parameters.hora;
    let motivo = req.body.queryResult.parameters.motivo;
    let nombre = req.body.queryResult.parameters.nombre;
    let mail = req.body.queryResult.parameters.mail;
    let banner = "https://thumbs.dreamstime.com/b/white-big-healthy-tooth-different-tools-dental-care-stethoscope-gradient-background-banner-size-152485541.jpg";
    DBVDialogLib.enviarCorreo(mail,nombre,banner,motivo,fecha,hora);
    DBVDialogLib.insertarEvento(nombre,fecha,hora,motivo);
    resultado = DBVDialogLib.respuestaBasica(`Listo ${nombre}, tu cita fue agendada con exito y se envio un comprobante a ${mail}.`);
  } else if (contexto==="citaAgendar"){
    respuestaEnviada = true;
    let start = req.body.queryResult.parameters.fecha;
    const getEvents = async (dateTimeStart, dateTimeEnd) => {
      try {
          let response = await calendar.events.list({
              auth: auth,
              calendarId: calendarId,
              timeMin: dateTimeStart,
              timeMax: dateTimeEnd,
              timeZone: 'GMT-5'
          });
      
          let items = response['data']['items'];
          return items;
      } catch (error) {
          console.log(`Error at getEvents --> ${error}`);
          return 0;
      }};
    var horarios = ["10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","Agendar cita"]; //Modificar horarios de acuerdo al horario del dentista
    var horaF = "T23:00:00-05:00";//Hora de terminación de citas
    var horaI = "T08:00:00-05:00";//Hora de inicio de citas
    var hora = start.split("T");
    let end = `${hora[0]}${horaF}`;
    start = `${hora[0]}${horaI}`;
    getEvents(start, end)
    .then((respuesta) => {
        for (var i = 0; i<Object.keys(respuesta).length;i++){
        var hora = respuesta[i]['start']['dateTime'];
        hora = hora.split("T",2);
        hora = hora[1].split("-",2);
        var index = horarios.indexOf(hora[0]);
        if (index > -1) {
            horarios.splice(index,1);
        }}
        //resultado = DBVDialogLib.respuestaBasica(`Estos son los horarios disponibles ${horarios.join()} ¿A que hora te agendo tu cita? 😊 "De no encontrar una hora adecuada para ti, selecciona Agendar cita para consultar el horario de otro dia""`);
        resultado = DBVDialogLib.respuestaBasica(`Estos son los horarios disponibles ¿A que hora te agendo tu cita? 😊 "De no encontrar una hora adecuada para ti, selecciona Agendar cita para consultar el horario de otro dia""`);
        DBVDialogLib.addSugerencias(resultado,horarios);
        res.json(resultado);
        return true;
    })
    .catch((err) => {
        console.log(err);
    });
  }
  if (!respuestaEnviada) {
    res.json(resultado);
}
});

server.post("/nutriologo", (req, res) => {
  let contexto = "nada";
  let respuestaEnviada = false;
  let textoEnviar = 'Peticion incorrecta post recibida';
  let resultado;
  try {
    contexto = req.body.queryResult.action;
    textoEnviar = `recibida petición de ${contexto}`;
  } catch (error) {
    console.log("Error contexto vacio:" + error);
  }
  if (req.body.queryResult.parameters) {
    console.log("parámetros:" + req.body.queryResult.parameters);
  } else {
    console.log("Sin parámetros");
  }if (contexto ==="cita.cita-custom"){
    let fecha = req.body.queryResult.parameters.fecha;
    let hora = req.body.queryResult.parameters.hora;
    let motivo = req.body.queryResult.parameters.motivo;
    let nombre = req.body.queryResult.parameters.nombre;
    let mail = req.body.queryResult.parameters.mail;
    let banner = "https://z5f2d6e7.stackpathcdn.com/wp-content/uploads/2020/11/banner2-1.jpg";
    DBVDialogLib.enviarCorreo(mail,nombre,banner,motivo,fecha,hora);
    DBVDialogLib.insertarEvento(nombre,fecha,hora,motivo);
    resultado = DBVDialogLib.respuestaBasica(`Listo ${nombre}, tu cita fue agendada con exito y se envio un comprobante a ${mail}.`);
  } else if (contexto==="citaAgendar"){
    respuestaEnviada = true;
    let start = req.body.queryResult.parameters.fecha;
    const getEvents = async (dateTimeStart, dateTimeEnd) => {
      try {
          let response = await calendar.events.list({
              auth: auth,
              calendarId: calendarId,
              timeMin: dateTimeStart,
              timeMax: dateTimeEnd,
              timeZone: 'GMT-5'
          });
      
          let items = response['data']['items'];
          return items;
      } catch (error) {
          console.log(`Error at getEvents --> ${error}`);
          return 0;
      }};
    var horarios = ["10:00:00","11:00:00","12:00:00","13:00:00","14:00:00","15:00:00","16:00:00","17:00:00","Agendar cita"]; //Modificar horarios de acuerdo al horario del dentista
    var horaF = "T23:00:00-05:00";//Hora de terminación de citas
    var horaI = "T08:00:00-05:00";//Hora de inicio de citas
    var hora = start.split("T");
    let end = `${hora[0]}${horaF}`;
    start = `${hora[0]}${horaI}`;
    getEvents(start, end)
    .then((respuesta) => {
        for (var i = 0; i<Object.keys(respuesta).length;i++){
        var hora = respuesta[i]['start']['dateTime'];
        hora = hora.split("T",2);
        hora = hora[1].split("-",2);
        var index = horarios.indexOf(hora[0]);
        if (index > -1) {
            horarios.splice(index,1);
        }}
        //resultado = DBVDialogLib.respuestaBasica(`Estos son los horarios disponibles ${horarios.join()} ¿A que hora te agendo tu cita? 😊 "De no encontrar una hora adecuada para ti, selecciona Agendar cita para consultar el horario de otro dia""`);
        resultado = DBVDialogLib.respuestaBasica(`Estos son los horarios disponibles ¿A que hora te agendo tu cita? 😊 "De no encontrar una hora adecuada para ti, selecciona Agendar cita para consultar el horario de otro dia""`);
        DBVDialogLib.addSugerencias(resultado,horarios);
        res.json(resultado);
        return true;
    })
    .catch((err) => {
        console.log(err);
    });
  }
  if (!respuestaEnviada) {
    res.json(resultado);
}
});

server.post("/restaurant", (req, res) => {
  let contexto = "nada";
  let respuestaEnviada = false;
  let textoEnviar = 'Peticion incorrecta post recibida';
  let resultado;
  try {
    contexto = req.body.queryResult.action;
    textoEnviar = `recibida petición de ${contexto}`;
  } catch (error) {
    console.log("Error contexto vacio:" + error);
  }
  if (req.body.queryResult.parameters) {
    console.log("parámetros:" + req.body.queryResult.parameters);
  } else {
    console.log("Sin parámetros");
  }if (contexto ==="cita.cita-yes"){
    let fecha = req.body.queryResult.parameters.fecha;
    let hora = req.body.queryResult.parameters.hora;
    let motivo = req.body.queryResult.parameters.Npersonas;
    let nombre = req.body.queryResult.parameters.nombre;
    let mail = req.body.queryResult.parameters.mail;
    let banner = "https://previews.123rf.com/images/foodandmore/foodandmore2004/foodandmore200400070/144948999-panorama-banner-with-raw-beef-steak-on-a-bbq-grill-sizzling-over-flaming-hot-coals-in-a-close-up-vie.jpg";
    DBVDialogLib.enviarCorreo(mail,nombre,banner,motivo,fecha,hora);
    DBVDialogLib.insertarEvento(nombre,fecha,hora,motivo);
    resultado = DBVDialogLib.respuestaBasica(`Listo ${nombre}, tu reservación fue realizada con exito y se envio un comprobante a ${mail}.`);
  } 
  if (!respuestaEnviada) {
    res.json(resultado);
}
});

exports.dentista = functions.https.onRequest(server);
exports.nutriologo = functions.https.onRequest(server);
exports.restaurant = functions.https.onRequest(server);

