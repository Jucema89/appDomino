import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { DbTournamentService } from '../../services/db.tournament.service';
import { GlobalesService } from '../../services/globales.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
declare var $: any;

@Component({
  selector: 'app-crear-torneo',
  templateUrl: './crear-torneo.component.html',
  styleUrls: ['./crear-torneo.component.css']
})
export class CrearTorneoComponent implements OnInit {
  FormTorneoAdd: FormGroup;
  todos: any[];
  check: any;
  Countries: any [] = countries;
  States: any [] = states;
  Cities: any [] = cities;

  selectedCountry = 0;
  selectedState = 0;
  cities = [];
  states = [];

  constructor(
    private builder: FormBuilder,
    private dbTorneos: DbTournamentService,
    private globales: GlobalesService,
    private DbJugadores: DbJugadoresService,
  ) {
      this.FormTorneoAdd = this.builder.group({
      nameTournament: [' ', Validators.required],
      typeTournament: [' ', Validators.required],
      players: [' ', Validators.required],
      // steps: [' ', Validators.required],
      dateStart: [' ', Validators.required],
      dateEnd: [' ', Validators.required],
      modoGame: [' ', Validators.required],
      modoSingle: [' '],
      tables: [' ', Validators.required],
      metaJuego: [' ', Validators.required],
      playsOrPoints: [' ', Validators.required],
      system: [' ', Validators.required],
      address: [' ', Validators.required],
      selectedCountry: [' ', Validators.required],
      selectedState: [' ', Validators.required],
      selectedCity: [' ', Validators.required],
      nameCountry: [' ', Validators.required],
      nameState: [' ', Validators.required],
      nameCity: [' ', Validators.required]
    });
  }

  ngOnInit() {
    this.getTodos();
    /*this.db.remoteTorneosDb.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getTodos();
    }).on('complete', info => {
    }).on('error', err => {
    });*/
  }
  getTodos() {
    const data = this.dbTorneos.showTodos();
    if (data) {
      this.todos = data.rows;
    }
  }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
    }
  addTournament(datos, country, state, city) {
   this.dbTorneos.addTor(datos, country, state, city);
   /*const dataTor = {
    _id: new Date().toISOString(),
    nombre: datos.nameTournament.trim().toUpperCase(),
    tipo: datos.typeTournament,
    numeroParticipantes: datos.players,
    sistema_rigido: datos.system,
    fechaInicio: datos.dateStart,
    fechaFinal: datos.dateEnd,
    mesas: datos.players / 4,
    metaJuego: datos.metaJuego,
    numeroMeta: datos.playsOrPoints,
    modoJuego: datos.modoGame,
    modoIndividual: datos.modoSingle,
    pais: country,
    estado: state,
    ciudad: city,
    direccion: datos.address,
    players: [],
    rondas: {
      ronda1: {
      },
    }
  };
   this.dbTorneos.saveTor(dataTor).then((res) => {
     if (res.ok === 'true') {
      Swal.fire({
        title: 'Esta Hecho!',
        text: 'Torneo Creado',
        icon: 'success',
        confirmButtonText: 'Genial!',
        onClose: () => { this.globales.redirecTo('listar-torneo'); }
      });
     }
   });*/
  }
  ViewSingleOptions(data) {
    const single = document.getElementById('SingleOptions');
    if ( data === 'Individual') {
      single.classList.remove('d-none');
    } else { single.classList.add('d-none'); }
  }
  systemActive(value) {
    console.log('system active = ' + value);
    const active = document.getElementById('sistema-activo');
    const inactive = document.getElementById('sistema-inactivo');
    if ( value === 'true' ) {
      active.classList.remove('d-none');
      inactive.classList.add('d-none');
    } else if (value === 'false') {
      active.classList.add('d-none');
      inactive.classList.remove('d-none');
    }
  }
  ViewMetaGame(data) {
    const print = document.getElementById('idMetaJuego');
    const label = document.getElementById('metaLabel');
    if ( data === 'Juegos' || data === 'Puntos') {
      print.classList.remove('d-none');
      label.innerHTML = 'Numero de ' + data;
    } else {
      print.classList.add('d-none'); }
  }
multiplo(numero, control) {
    const playersErr = document.getElementById('players');
    const mesas: any = document.getElementById('numeroMesas');
    const alert = document.getElementById('alertMultiplo');
    const n = numero % control;
    if (n === 0) {
      playersErr.classList.remove('is-invalid');
      alert.classList.add('d-none');
    } else {
      alert.classList.remove('d-none');
      playersErr.classList.add('is-invalid');
  } if (n === 0) {
    const nMesas = '<small class="btn  btn-sm btn-success col-md-12 mt-2">Mesas en Juego <span class="badge badge-light"> '  + numero / 4 +
    '</span></small>';
    mesas.innerHTML = nMesas;
  } else { console.log('nMesas');
  }
}
  eraseForm() {
    return this.FormTorneoAdd.reset();
  }
  getCountries() {
    return this.Countries;
    }
  getStates() {
     return this.States;
    }
  getCity() {
     return this.Cities;
     }
  addAddress(idCountry: number, idState: number, idCity: string) {
    const control = 2;
    const txtCountry = document.getElementById('nameCountry');
    const txtState = document.getElementById('nameState');
    const txtCity = document.getElementById('nameCity');
    const countryName = countries.find((pais) => {
      return pais.id === Number(idCountry);
    });
    if ( control === 2) { txtCountry.innerHTML = countryName.name;
        } else { console.log(countryName); }

    const stateName = states.find((state) => {
          return state.id === Number(idState);
        });
    if (control === 2) { txtState.innerHTML = stateName.name;
            } else { console.log(stateName); }

    const cityName = idCity;
    if ( control === 2) { txtCity.innerHTML = cityName;
                } else { console.log(cityName); }
    const data2 = {
      country: countryName.name,
      state: stateName.name,
      city: cityName
    };
    if ( control === 2) {
      console.log (data2);
      return data2;
    }
      }
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
        }
  onSelectCountry(id: number) {
    this.selectedCountry = id;
    this.selectedState = 0;
    this.cities = [];
    this.states = this.getStates().filter((item) => {
    return item.country_id === Number(id);
    });
    }
    onSelectState(id: number) {
    this.selectedState = id;
    this.cities = this.getCity().filter((item) => {
    return item.state_id === Number(id);
    });
    }
}
