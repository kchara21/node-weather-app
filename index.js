import "dotenv/config";
import {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} from "./helpers/inquirer.js";
import Busquedas from "./models/busquedas.js";

const main = async () => {
  let opt;
  const busquedas = new Busquedas();

  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        // Mostrar mensaje
        const termino = await leerInput("Ciudad: ");

        // Buscar los lugares
        const lugares = await busquedas.ciudad(termino);
        // Seleccionar el lugar
        const id = await listarLugares(lugares);
        if (id === "0") continue;

        // Clima de lo seleccionado
        const lugarSel = lugares.find((l) => l.id === id);

        // Guardar en DB
        busquedas.agregarHistorial(lugarSel.nombre);

        // Mostrar resultados
        console.log("\nInformacion de la ciudad\n".green);
        console.log("Ciudad:", lugarSel.nombre);
        console.log("Lat:", lugarSel.lat);
        console.log("Lng:", lugarSel.lng);

        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
        console.log("Temperatura:", clima.temp);
        console.log("Minima:", clima.min);
        console.log("Maxima:", clima.max);
        console.log("Estado:", clima.desc);

        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
