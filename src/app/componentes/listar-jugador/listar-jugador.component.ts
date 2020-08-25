import { Component, OnInit } from '@angular/core';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
declare var $: any;
@Component({
  selector: 'app-listar-jugador',
  templateUrl: './listar-jugador.component.html',
  styleUrls: ['./listar-jugador.component.css']
})
export class ListarJugadorComponent implements OnInit {
  todos: any[];
  UpdateJugador: FormGroup;
  remoteDb;
  Countries: any [] = countries;
  States: any [] = states;
  Cities: any [] = cities;
  player: any [];
  allPlayers: any [];
  searchPlayers: any [];

  selectedCountry = 0;
  selectedState = 0;
  cities = [];
  states = [];

  constructor(
    private db: DbJugadoresService,
    public readonly swalTargets: SwalPortalTargets,
    private builder: FormBuilder,
    ) {
      this.UpdateJugador = this.builder.group({
        name: [' ', Validators.required],
        lastName: [' ', Validators.required],
        cc: [' ', Validators.required],
        mail: [' ', Validators.compose([Validators.email, Validators.required])],
        phone: [' ', Validators.compose([Validators.minLength(10), Validators.required])],
        address: [' ', Validators.required],
        nameCountry: [' ', Validators.required],
        nameState: [' ', Validators.required],
        nameCity: [' ', Validators.required],
        selectedCountry: [' ', Validators.required],
        selectedState: [' ', Validators.required],
        selectedCity: [' ', Validators.required],
      });
    }
  ngOnInit() {
    this.getTodos();
    this.getAllJugadores();
    /*this.db.remoteDb.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getTodos();
      this.getAllJugadores();
    }).on('complete', info => {
    }).on('error', err => {
    });*/
  }
  async getTodos() {
    const data = await this.db.showTodos();
    if (data) {
      this.todos = data.rows;
    }
  }
  playerShow(data) {
    // this.db.createIndex();
    this.db.showPlayerId(data).then((res) => {
      console.log('tester: ' + res.doc);
      this.searchPlayers = res.docs;
    }).catch((err) => {
      console.log(err);
    });

  }
  getAllJugadores() {
    // this.db.createIndex();
    this.db.showAllPlayers().then((res) => {
      console.log(res);
      console.log('getAllJugadores' + this.allPlayers);
      this.allPlayers = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  searchPlayer(dato: any) {
    // this.db.createIndex();
    console.log(dato);
    if (this.wtfNumber(dato) === 0) {
      const numb = +dato;
      const nombre = this.db.showPlayerDNI(numb);
      nombre.then((res) => {
      console.log('searchNumber: ' + res.docs);
      this.searchPlayers = res.docs;
    }).catch((err) => {
        console.log(err);
      });
    } else {
      const nombre = this.db.showPlayerName(dato);
      nombre.then((res) => {
      console.log('searchName: ' + res);
      this.searchPlayers = res.docs;
    }).catch((err) => {
        console.log(err);
      });

     }
  }
  borrarIndices() {
    this.db.borrarIndexes();
  }
  deleteOne(id) {
    this.db.deletePlayer(id);
    this.getAllJugadores();
  }
  deleteTodo(todo) {
    this.db.deleteTodo(todo);
    this.getTodos();
  }
  addAddress(idCountry: number, idState: number, idCity: string){
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
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
  }
  add(IDBD, datos, country, state, city) {
    console.log(IDBD);
    this.db.addOne(IDBD, datos, country, state, city);
    console.log(IDBD, datos, country, state, city);
  }
  eraseForm() {
    return this.UpdateJugador.reset();
  }
  wtfNumber(dato) {
    const numeros = '0123456789';
    let i: any;
    for ( i = 0; i < dato.length; i++) {
      if (numeros.indexOf(dato.charAt(i), 0) !== -1) {
         return 1;
      }
   }
    return 0;
  }

}
