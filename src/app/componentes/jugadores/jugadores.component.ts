import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { GlobalesService } from '../../services/globales.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { Rankings } from '../../services/rankings.service';
import { DbTournamentService } from '../../services/db.tournament.service';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-jugadores',
  templateUrl: './jugadores.component.html',
  styleUrls: ['./jugadores.component.css'],
})
export class JugadoresComponent implements OnInit {
  FormJugador: FormGroup;
  FormSearch: FormGroup;
  urlConect: any;
  todos: any[];
  p = 1;
  public FullName: any;
  public CityCopy: any;
  public viewBtn: boolean;
  fieldTextType: boolean;
  playerFind: any[];
  Countries: any [] = countries;
  States: any [] = states;
  Cities: any [] = cities;
  selectedCountry = 0;
  selectedState = 0;
  cities = [];
  states = [];
  players: any[];
  allPlayers: any[];
  searchPlayers: any[];
  constructor(
    private db: DbJugadoresService,
    private Ranking: Rankings,
    private globalesService: GlobalesService,
    private dbTorneos: DbTournamentService,
    private builder: FormBuilder,
    ) {
      this.FormJugador = this.builder.group({
        name: ['', Validators.required],
        lastName: ['', Validators.required],
        cc: ['', Validators.required],
        mail: ['', Validators.compose([
          Validators.email,
          Validators.required,
          ])],
        phone: ['', Validators.compose([Validators.minLength(10), Validators.required])],
        address: ['', Validators.required],
        selectedCountry: [''],
        selectedState: [''],
        selectedCity: [''],
        nameCountry: [' ', Validators.required],
        nameState: [' ', Validators.required],
        nameCity: [' ', Validators.required],
        // idPareja: ['']
      });
      this.FormSearch = this.builder.group({
        dataPlayer: ['', Validators.required],
        selectSearch: [' ', Validators.required],
      });
     }

  ngOnInit() {
    this.getTodos();
    this.getAllJugadores();
    this.getTodosPlayers();
  }
  async getTodosPlayers() {
    const data = await this.db.showTodos();
    if (data) {
      this.players = data.rows;
    }
  }
  getAllJugadores() {
    // this.db.db.createIndex();
    this.db.showAllPlayers().then((res) => {
      console.log(res);
      this.allPlayers = res.docs;
      console.log(this.allPlayers);
    }).catch((err) => {
      console.log(err);
    });
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
    if ( control === 2) { txtState.innerHTML = stateName.name;
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
      /* Switching method */
  toggleFieldTextType() {
        this.fieldTextType = !this.fieldTextType;
      }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
    }
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
  }
  eraseForm() {
    return this.FormJugador.reset();
  }
  add(datos, country, state, city) {
    console.log(datos);
    const pass = this.generateRandomPass();
    this.db.addPlayer(datos, pass, country, state, city);
    // crea player in ranking
    const player = {
      _id: new Date().toISOString(),
      nombre: datos.name.trim().toUpperCase(),
      dni: datos.cc,
      puntos: 0,
      torneos: {}
      };
    this.Ranking.savePlayerinRanking(player).then((answer) => {
      if (answer.ok === true) {
        console.log('Jugador agregado a ranking');
        console.log(player);
      }
    });
    console.log(datos);
  }
  async getTodos() {
    const data = await this.db.showTodos();
    if (data) {
      this.todos = data.rows;
    }
  }
  deleteTodo(todo) {
    this.db.deleteTodo(todo);
    this.getTodos();
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
    getCountries() {
    return this.Countries;
    }
    getStates() {
        return this.States;
        }
    getCity() {
        return this.Cities;
    }
    validateExistingDni(dni) {
      const inputDni = document.getElementById('cc');
      const error = document.getElementById('dniError');
      const vacio = document.getElementById('dniEmpity');
      const ok = document.getElementById('dniSuccess');
      if ( dni === '' || dni.length <= 4 ) {
        vacio.classList.remove('d-none');
        inputDni.classList.add('is-invalid');
        ok.classList.add('d-none');
        error.classList.add('d-none');
      } else if ( dni !== '' && dni.length > 4) {
        this.dniInUse(dni).then((response) => {
          const dniUsed = response;
          if ( dniUsed === false) {
              vacio.classList.add('d-none');
              error.classList.remove('d-none');
              ok.classList.add('d-none');
              inputDni.classList.remove('is-valid');
              inputDni.classList.add('is-invalid');
            } else if ( dniUsed === true ) {
              vacio.classList.add('d-none');
              inputDni.classList.remove('is-invalid');
              inputDni.classList.add('is-valid');
              ok.classList.remove('d-none');
              error.classList.add('d-none');
            }
        }).catch((err) => {
          console.log(err);
        });
      }
    }
    dniInUse(dni) {
      // retorna false si el dni ya existe
        return this.db.showTodos().then((players) => {
          const n = players.rows.length;
          console.log('Players conteo = ' + n);
          for (let i = 0; i < n; i++) {
            if (+dni === players.rows[i].doc.DNI) {
             return false;
            }
          }
          return true;
        }).catch((err) => {
          console.log(err);
        });
    }
    validatorPhone(dato) {
      const input = document.getElementById('phone');
      const error = document.getElementById('phoneError');
      const vacio = document.getElementById('phoneEmpity');
      const ok = document.getElementById('phoneSuccess');
      if ( dato === '') {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        vacio.classList.remove('d-none');
        error.classList.add('d-none');
        ok.classList.add('d-none');
      } else if (dato !== '' && dato.length < 10) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        vacio.classList.add('d-none');
        error.classList.remove('d-none');
        ok.classList.add('d-none');
      } else if (dato !== '' && dato.length >= 10) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
        vacio.classList.add('d-none');
        error.classList.add('d-none');
        ok.classList.remove('d-none');
      }
    }
    validateEmail(mail) {
      // retorna true si el mail es valido
      // tslint:disable-next-line: max-line-length
      const emailPattern = (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      return emailPattern.test(mail);
    }
    validateExistingMail(mail) {
      const inputMail = document.getElementById('mail');
      const error = document.getElementById('mailError');
      const vacio = document.getElementById('mailEmpity');
      const ok = document.getElementById('mailSuccess');
      const mailCorrect = this.validateEmail(mail);
      if (mail === '') {
        inputMail.classList.remove('is-valid');
        inputMail.classList.add('is-invalid');
        error.classList.add('d-none');
        vacio.classList.remove('d-none');
        // si mail viene con length + 1
      }
      if (mail.length > 1 && mailCorrect === false) {
          // correo mal escrito
          console.log('mal escrito');
          inputMail.classList.remove('d-none');
          vacio.classList.remove('d-none');
          error.classList.add('d-none');
          ok.classList.add('d-none');
          inputMail.classList.remove('is-valid');
          inputMail.classList.add('is-invalid');
        }
      if ( mail.length > 1 && mailCorrect === true ) {
          this.emailInUse(mail).then((response) => {
            const mailUsed = response;
            console.log(mailUsed);
            if (mailUsed === false) {
              // correo bien, pero mail esta en uso
              console.log('mail en uso');
              inputMail.classList.remove('d-none');
              vacio.classList.add('d-none');
              error.classList.remove('d-none');
              ok.classList.add('d-none');
              inputMail.classList.remove('is-valid');
              inputMail.classList.add('is-invalid');
            } else if (mailUsed === true) {
              // mail correcto y esta libre
              console.log('todo Ok');
              inputMail.classList.remove('d-none');
              vacio.classList.add('d-none');
              error.classList.add('d-none');
              inputMail.classList.remove('is-invalid');
              inputMail.classList.add('is-valid');
              ok.classList.remove('d-none');
            }
          });
        }
    }
    emailInUse(mail) {
      // retorna false si el mail ya existe
        return this.db.showTodos().then((players) => {
          const n = players.rows.length;
          console.log('Players conteo = ' + n);
          for (let i = 0; i < n; i++) {
            if (mail === players.rows[i].doc.mail) {
             return false;
            }
          }
          return true;
        }).catch((err) => {
          console.log(err);
        });
    }
    generateRandomPass() {
      return Math.random().toString(36).slice(-10);
    }
    searchingPlayer(data) {
      const inputSearch = data.dataPlayer.trim().toUpperCase();
      const selectSearch = data.selectSearch;
      this.db.showTodos().then((players) => {
        console.log(players);
        const n = players.rows.length;
        const arra = [];
        switch (selectSearch) {
          case 'DNI':
            for (let i = 0; i < n; i++) {
              if (+inputSearch === +players.rows[i].doc.DNI) {
                arra.push(players.rows[i].doc);
                this.playerFind = arra;
                console.log(this.playerFind);
                console.log(arra);
              }
          }
            break;
          case 'Nombre':
            for (let i = 0; i < n; i++) {
              if (inputSearch === players.rows[i].doc.nombre) {
                arra.push(players.rows[i].doc);
                this.playerFind = arra;
                console.log(this.playerFind);
                console.log(arra);
              }
          }
            break;
        }
      });
    }
}
