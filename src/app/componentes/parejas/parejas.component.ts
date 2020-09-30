import { Component, OnInit } from '@angular/core';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { DbTournamentService } from '../../services/db.tournament.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbTeamService } from '../../services/db.teams.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
declare var $: any;

@Component({
  selector: 'app-parejas',
  templateUrl: './parejas.component.html',
  styleUrls: ['./parejas.component.css']
})
export class ParejasComponent implements OnInit {
  FormTeam: FormGroup;
  FormDuo: FormGroup;
  page = 1;
  Teams: any [];
  Duos: any;
  todos: any[];
  players: any[];
  playerOne: any[];
  playerTwo: any[];
  playerThree: any[];
  playerFour: any[];
  playerDuoOne: any[];
  playerDuoTwo: any[];
  allPlayers: any[];
  TeamCap: any;
  searchPlayers: any[];
  doc: any[];

  constructor(
    private dbTournament: DbTournamentService,
    private dbJugadores: DbJugadoresService,
    private dbTeams: DbTeamService,
    private builder: FormBuilder,
  ) {
    this.FormTeam = this.builder.group({
      teamName: [' ', Validators.compose([Validators.minLength(3), Validators.required])],
      playerOne: [' ', Validators.required],
      playerTwo: [' ', Validators.required],
      playerThree: [' ', Validators.required],
      playerFour: [' ', Validators.required],
      playerCap: [' ', Validators.required],
    });
    this.FormDuo = this.builder.group({
      playerOne: [' ', Validators.required],
      playerTwo: [' ', Validators.required],
    });
   }

  ngOnInit() {
    this.getAllTeams();
    this.getAllDuos();
    this.getAllJugadores();
    this.getTodos();
    this.getTodosPlayers();

    /* this.dbTournament.remoteDb.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getTodos();
    }).on('complete', info => {
    }).on('error', err => {
    });
    // funciones para jugadores
   /* this.dbJugadores.remoteDb.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getTodosPlayers();
    }).on('complete', info => {
    }).on('error', err => {
    });*/
    // funciones para Teams
  /*  this.dbTeams.remoteDbTeams.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getAllTeams();
    }).on('complete', info => {
    }).on('error', err => {
    });*/
  }
  async getTodos() {
    const data = await this.dbTournament.showTodos();
    if (data) {
      this.todos = data.rows;
    }
  }
  listarIndices() {
    this.dbJugadores.listIndex();
  }
  getAllTeams() {
    this.dbTeams.createIndexTeam();
    this.dbTeams.showAllTeams().then((res) => {
      console.log(res);
      this.Teams = res.docs;
      console.log('Hello Teams' + this.Teams);
    }).catch((err) => {
      console.log(err);
    });
  }
  getAllDuos() {
    this.dbTeams.createIndexDuos();
    this.dbTeams.showAllDuos().then((res) => {
      console.log(res);
      this.Duos = res.docs;
      console.log('Hello Duos' + this.Duos);
    }).catch((err) => {
      console.log(err);
    });
  }
  async getTodosPlayers() {
    const data = await this.dbJugadores.showTodos();
    if (data) {
      this.players = data.rows;
    }
  }
  async getAllJugadores() {
    await this.dbJugadores.showAllPlayers().then((res) => {
      console.log(res);
      this.allPlayers = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  changeCapture(data) {
    console.log(data);
  }
  sendValue(data, playerCap) {
    console.log(data, playerCap);
    this.dbTeams.addTeam(data, playerCap);
    // console.log(data.playerOne);
  }
  sendValueDuo(data) {
    console.log(data);
   // this.validateDuo(data);
    const selecP1 = document.getElementById('inputPlayerOne');
    const selecP2 = document.getElementById('inputPlayerTwo');
    const p1valid = document.getElementById('p1-valid');
    const p1invalid = document.getElementById('p1-invalid');
    const p2valid = document.getElementById('p2-valid');
    const p2invalid = document.getElementById('p2-invalid');
    const p1 = data.playerOne;
    const p2 = data.playerTwo;
    if ( p1.duoId === '') {
      selecP1.classList.remove('is-invalid');
      selecP1.classList.add('is-valid');
      p1valid.classList.remove('d-none');
      p1invalid.classList.add('d-none');
    } else {
      selecP1.classList.add('is-invalid');
      selecP1.classList.remove('is-valid');
      p1valid.classList.add('d-none');
      p1invalid.classList.remove('d-none');
    }
    if ( p2.duoId === '') {
      selecP2.classList.remove('is-invalid');
      selecP2.classList.add('is-valid');
      p2valid.classList.remove('d-none');
      p2invalid.classList.add('d-none');
    } else {
      selecP2.classList.add('is-invalid');
      selecP2.classList.remove('is-valid');
      p2valid.classList.add('d-none');
      p2invalid.classList.remove('d-none');
    }
    if (p1.duoId === '' && p2.duoId === '' ) {
      this.dbTeams.addDuo(data);
    }
  }
  /*
  validateDuo(player) {
    const p1 = player.playerOne;
    const p2 = player.playerTwo;
    console.log(player);
    console.log(data);
    const selected = document.getElementById(select);
    const dni = player.DNI;
    this.validateDuoIdExist(dni).then((res) => {
      console.log(res);
      if (res === 'vacio') {
        selected.classList.add('is-valid');
      } else {
        selected.classList.add('is-invalid');
        selected.classList.add('is-valid');
      }
    });
  }
  validateDuoIdExist(dni) {
    console.log(dni);
    const numb = +dni;
    return new Promise ((result, reject) => {
      this.dbJugadores.createIndexDNI().then(() => {
        this.dbJugadores.showPlayerDNI(numb).then((res) => {
          console.log(res);
          console.log(res.docs[0].duoId);
          if (res.docs[0].duoId === '') {
            result ('vacio');
          } else {
            result (res.docs[0].duoId);
            }
        }).catch((err) => {
          reject (err);
        });
      });
    });
  }*/
  // wtfNumber devuelve 1 si el dato es un numero o tiene un numero
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
  searchPlayer(dato: any) {
      if (this.wtfNumber(dato) === 0) {
        const nombre = this.dbJugadores.showPlayerName(dato);
        nombre.then((res) => {
        console.log(res);
        this.searchPlayers = res.docs;
      }).catch((err) => {
          console.log(err);
        });
      } else {
        const numb = dato;
        this.dbJugadores.createIndexDNI();
        this.dbJugadores.showPlayerDNI(numb).then((res) => {
        console.log(res);
        this.searchPlayers = res.docs;
      }).catch((err) => {
          console.log(err);
        });
       }
  }
  searchPlayerOne(dato) {
    const numText = +dato;
    console.log(numText);
    const data = this.dbJugadores.showPlayerDNI(numText);
    data.then((res) => {
      this.playerOne = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  searchPlayerTwo(dato) {
    const numText = +dato;
    console.log(numText);
    const data = this.dbJugadores.showPlayerDNI(numText);
    data.then((res) => {
      this.playerTwo = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  searchPlayerThree(dato) {
    const numText = +dato;
    console.log(numText);
    const data = this.dbJugadores.showPlayerDNI(numText);
    data.then((res) => {
      this.playerThree = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  searchPlayerFour(dato) {
    const numText = +dato;
    console.log(numText);
    const data = this.dbJugadores.showPlayerDNI(numText);
    data.then((res) => {
      this.playerFour = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  toVisible(id) {
    const dato = 2;
    const print = document.getElementById(id);
    if (dato === 2) {
      print.classList.remove('d-none');
    }
  }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
  }
  deleteTeam(id) {
    this.dbTeams.deleteTeams(id);
    this.getAllTeams();
  }
  deleteDuo(id) {
    this.dbTeams.deleteDuos(id);
    this.getAllDuos();
  }

} // no borrar


