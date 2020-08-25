import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { GlobalesService } from '../../services/globales.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
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
        idPareja: ['']
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
            } else{ console.log(stateName); }

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
      this.db.showTodos().then((players) => {
        const n = players.rows.length;
        for (let i = 0; i < n; i++) {
          if (+dni === players.rows[i].doc.DNI) {
            vacio.classList.add('d-none');
            error.classList.remove('d-none');
            ok.classList.add('d-none');
            inputDni.classList.remove('is-valid');
            inputDni.classList.add('is-invalid');
          } else if (+dni !== players.rows[i].doc.DNI && dni !== '' && dni.length > 4) {
            vacio.classList.add('d-none');
            inputDni.classList.remove('is-invalid');
            inputDni.classList.add('is-valid');
            ok.classList.remove('d-none');
            error.classList.add('d-none');
          } else if (dni === '' || dni.length <= 4 ) {
            vacio.classList.remove('d-none');
            inputDni.classList.add('is-invalid');
            ok.classList.add('d-none');
            error.classList.add('d-none');
          }
        }
      });
    }
    validateEmail(mail) {
      // tslint:disable-next-line: max-line-length
      const emailPattern = (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      return emailPattern.test(mail);
    }
    validateExistingMail(mail) {
      const inputMail = document.getElementById('mail');
      const error = document.getElementById('mailError');
      const vacio = document.getElementById('mailEmpity');
      const ok = document.getElementById('mailSuccess');
      this.db.showTodos().then((players) => {
        const n = players.rows.length;
        console.log('validacion de mail = ' + this.validateEmail(mail));
        for (let i = 0; i < n; i++) {
          if (mail === players.rows[i].doc.mail) {
            vacio.classList.add('d-none');
            error.classList.remove('d-none');
            ok.classList.add('d-none');
            inputMail.classList.remove('is-valid');
            inputMail.classList.add('is-invalid');
          } else if (mail !== players.rows[i].doc.mail && mail !== '' && this.validateEmail(mail) === true) {
            vacio.classList.add('d-none');
            inputMail.classList.remove('is-invalid');
            inputMail.classList.add('is-valid');
            ok.classList.remove('d-none');
            error.classList.add('d-none');
          } else if (mail === '' || this.validateEmail(mail) === false) {
            vacio.classList.remove('d-none');
            inputMail.classList.add('is-invalid');
            ok.classList.add('d-none');
            error.classList.add('d-none');
          }
        }
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
