import { Component, OnInit } from '@angular/core';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
// import { SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { Rankings } from '../../services/rankings.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-listar-jugador',
  templateUrl: './listar-jugador.component.html',
  styleUrls: ['./listar-jugador.component.css']
})
export class ListarJugadorComponent implements OnInit {
  page = 1;
  todos: any[];
  UpdateJugador: FormGroup;
  remoteDb;
  Countries: any [] = countries;
  States: any [] = states;
  Cities: any [] = cities;
  playerOne: any;
  mailInUse;
  playerJson = {};
  allPlayers: any [];
  searchPlayers: any [];

  selectedCountry = 0;
  selectedState = 0;
  cities = [];
  states = [];

  constructor(
    private db: DbJugadoresService,
    private Ranking: Rankings,
    // public readonly swalTargets: SwalPortalTargets,
    private builder: FormBuilder,
    ) {
      this.UpdateJugador = this.builder.group({
        name: ['', Validators.required],
        lastName: ['', Validators.required],
        cc: ['', Validators.required],
        mail: ['', Validators.compose([Validators.email, Validators.required])],
        celular: ['', Validators.compose([Validators.minLength(10), Validators.required])],
        direccion: ['', Validators.required],
        nameCountry: ['', Validators.required],
        nameState: ['', Validators.required],
        nameCity: ['', Validators.required],
      });
    }
  ngOnInit() {
    this.getTodos();
    this.getAllJugadores();
    this.db.allSyncDb();
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
  getOnePlayer(dni) {
    this.db.showPlayerDNI(dni).then((doc) => {
      this.playerOne = doc.docs[0];
      const playerNew = {
        _id: this.playerOne._id,
        _rev: this.playerOne._rev,
        nombre: this.playerOne.nombre,
        apellido: this.playerOne.apellido,
        DNI: this.playerOne.DNI,
        mail: this.playerOne.mail,
        celular: this.playerOne.celular,
        direccion: this.playerOne.direccion,
        pais: this.playerOne.pais,
        estado: this.playerOne.estado,
        ciudad: this.playerOne.ciudad,
        password: this.playerOne.password,
        id_team: this.playerOne.id_team,
        nombre_equipo: this.playerOne.nombre_equipo,
        id_club: this.playerOne.id_club,
        nombre_club: this.playerOne.nombre_club,
        id_pareja: this.playerOne.id_pareja,
        nombre_pareja: this.playerOne.nombre_pareja,
        duoId: this.playerOne.duoId,
        torneos: this.playerOne.torneos,
      };
    }).catch((err) => {
      console.log(err);
    });
  }
  validateDuo(id) {
    console.log(id);
    this.db.showPlayerId(id).then((response) => {
     console.log(response);
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
  // update player data OLD!!
  add(IDBD, datos, country, state, city) {
    console.log(IDBD);
    this.db.addOne(IDBD, datos, country, state, city);
    console.log(IDBD, datos, country, state, city);
  }
  // update player data NEW!!
  updatePlayerJson(value, dato) {
    console.log(this.playerJson[value]);
    console.log(dato);
    // this.playerJson[value] = dato;
  }
  validateDato(datoNew, datoOld) {
    if (datoNew === '') {
      return datoOld;
    } else if (datoNew !== '') {
      return datoNew;
    }
  }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
    }
  updatePlayerData(data, playerDni) {
    this.db.showPlayerDNI(playerDni).then((doc) => {
      this.playerOne = doc.docs[0];
      console.log(this.playerOne);
      const playerNew = {
        _id: this.playerOne._id,
        _rev: this.playerOne._rev,
        nombre: this.playerOne.nombre,
        apellido: this.playerOne.apellido,
        DNI: this.playerOne.DNI,
        mail: this.playerOne.mail,
        celular: this.playerOne.celular,
        direccion: this.playerOne.direccion,
        pais: this.playerOne.pais,
        estado: this.playerOne.estado,
        ciudad: this.playerOne.ciudad,
        password: this.playerOne.password,
        id_team: this.playerOne.id_team,
        nombre_equipo: this.playerOne.nombre_equipo,
        id_club: this.playerOne.id_club,
        nombre_club: this.playerOne.nombre_club,
        id_pareja: this.playerOne.id_pareja,
        nombre_pareja: this.playerOne.nombre_pareja,
        duoId: this.playerOne.duoId,
        torneos: this.playerOne.torneos,
      };
      console.log(playerNew);
      const playerPut = {
        _id: this.playerOne._id,
        _rev: this.playerOne._rev,
        nombre: this.validateDato(data.name, this.playerOne.nombre),
        apellido: this.validateDato(data.lastName, this.playerOne.apellido),
        DNI: this.validateDato(data.cc, +this.playerOne.DNI),
        mail: this.validateDato(data.mail, this.playerOne.mail),
        celular: this.validateDato(data.celular, this.playerOne.celular),
        direccion: this.validateDato(data.direccion, this.playerOne.direccion),
        pais: this.validateDato(data.nameCountry, this.playerOne.pais),
        estado: this.validateDato(data.nameState, this.playerOne.estado),
        ciudad: this.validateDato(data.nameCity, this.playerOne.ciudad),
        password: this.playerOne.password,
        id_team: this.playerOne.id_team,
        nombre_equipo: this.playerOne.nombre_equipo,
        id_club: this.playerOne.id_club,
        nombre_club: this.playerOne.nombre_club,
        id_pareja: this.playerOne.id_pareja,
        nombre_pareja: this.playerOne.nombre_pareja,
        duoId: this.playerOne.duoId,
        torneos: this.playerOne.torneos,
      };
      console.log(playerPut);
      this.savePlayerData(playerPut);
    });
    console.log(data);
    console.log(playerDni);
  }
  savePlayerData(data) {
    this.db.savePlayer(data);
    // actualiza datos en ranking
    this.Ranking.getRanking(data._id).then((playerR) => {
      // console.log(playerR);
      const pts = playerR.puntos;
      const tors = playerR.torneos;
      const user = {
        _id: data._id,
        _rev: playerR._rev,
        dni: data.DNI,
        nombre: data.nombre,
        puntos: pts,
        torneos: tors
      };
      this.Ranking.dbRanking.put(user).then((response) => {
        if (response.ok === true) {
          Swal.fire({
            title: 'Jugador Actualizado en Ranking',
            text: 'Los datos se actualizaron en base de datos ranking',
            icon: 'success',
            confirmButtonText: 'Genial!',
          });
        }
      });
      console.log(user);
    }).catch((err) => {
      console.log(err);
    });
  }
  disEnable(disableId, enableId) {
    document.getElementById(disableId).classList.add('d-none');
    document.getElementById(enableId).classList.remove('d-none');
  }
  updatePlayerClick(playerId, nameInput) {
    const smaller = document.getElementById(playerId + nameInput + 'Small');
    const input1 = document.getElementById(playerId + nameInput + 'Input1');
    const input2 = document.getElementById(playerId + nameInput + 'Input2');
    input1.classList.add('d-none');
    input2.classList.remove('d-none');
    input2.focus();
    smaller.classList.remove('d-none');
  }
  updatePlayerBlur(playerId, nameInput, cambio) {
    const smaller = document.getElementById(playerId + nameInput + 'Small');
    const input1 = document.getElementById(playerId + nameInput + 'Input1');
    const input2 = document.getElementById(playerId + nameInput + 'Input2');
    if (cambio === '') {
      smaller.classList.add('d-none');
      input2.classList.add('d-none');
      input1.classList.remove('d-none');
    } else if (cambio !== '') {
      console.log('nothing else');
      console.log(cambio);
    }
  }
  validateExistingMail(playerId, mail) {
    const inputMail = document.getElementById(playerId + 'mailInput2');
    const input1 = document.getElementById(playerId + 'mailInput1');
    const smaller = document.getElementById(playerId + 'mailSmall');
    const error = document.getElementById('mailError');
    const vacio = document.getElementById('mailEmpity');
    const ok = document.getElementById('mailSuccess');
    const mailCorrect = this.validateEmail(mail);
      // si mail viene vacio
    if (mail === '') {
        smaller.classList.add('d-none');
        input1.classList.remove('d-none');
        inputMail.classList.add('d-none');
        error.classList.add('d-none');
        vacio.classList.add('d-none');
        // si mail viene con length + 1
      }
    if (mail.length > 1 && mailCorrect === false) {
        // correo mal escrito
        console.log('mal escrito');
        smaller.classList.remove('d-none');
        input1.classList.add('d-none');
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
            smaller.classList.remove('d-none');
            input1.classList.add('d-none');
            inputMail.classList.remove('d-none');
            vacio.classList.add('d-none');
            error.classList.remove('d-none');
            ok.classList.add('d-none');
            inputMail.classList.remove('is-valid');
            inputMail.classList.add('is-invalid');
          } else if (mailUsed === true) {
            // mail correcto y esta libre
            console.log('todo Ok');
            smaller.classList.remove('d-none');
            input1.classList.add('d-none');
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
    this.db.deletePlayer(id).then((res) => {
      if (res.ok === true) {
        this.Ranking.deletePlayerInRanking(id).then((response) => {
          if (response.ok === true) {
            Swal.fire({
              title: 'Registro Eliminado!',
              text: 'Se borro Exitosamente!',
              icon: 'success',
              confirmButtonText: 'Genial!',
            });
          }
        });
      }
    });
    this.getAllJugadores();
  }
  deleteTodo(todo) {
    this.db.deleteTodo(todo);
    this.getTodos();
  }
  addAddress(idCountry: number, idState: number, idCity: string) {
    const control = 2;
    const txtCountry = document.getElementById('nameCountry');
    const txtState = document.getElementById('nameState');
    const txtCity = document.getElementById('nameCity');
    const countryName = countries.find((pais) => {
      return pais.id === Number(idCountry);
    });
    if ( control === 2) {
      txtCountry.innerHTML = countryName.name;
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
  validateEmail(mail) {
    // tslint:disable-next-line: max-line-length
    const emailPattern = (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return emailPattern.test(mail);
  }


}
