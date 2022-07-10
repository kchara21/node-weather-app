import axios from "axios";
import fs from "fs";

export default class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(" ");
    });
  }

  get paramsMapBox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      language: "es",
      limit: 5,
    };
  }

  get paramsWather() {
    return {
      units: "metric",
      lang: "es",
      appid: process.env.OPENWEATHER_KEY,
    };
  }

  async ciudad(lugar = "") {
    //peticion http...
    // console.log('ciudad: ',lugar);
    try {
      const intance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapBox,
      });

      const resp = await intance.get();
      // console.log(resp.data.features);
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (e) {
      console.log("error", e);

      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      //instance axios.create
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWather, lat, lon },
      });
      const respClima = await instance.get();
      const { weather, main } = respClima.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (e) {
      console.log("No se encontro ciudad: ", e);
    }
  }

  agregarHistorial(lugar = "") {
    //TODO:prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) return;

    this.historial = this.historial.splice(0,4);

    this.historial.unshift(lugar.toLocaleLowerCase());

    // Grabar en BD;
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    // Debe de existir...
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}
