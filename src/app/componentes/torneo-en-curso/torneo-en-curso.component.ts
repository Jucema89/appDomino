import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbTournamentService } from '../../services/db.tournament.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { GlobalesService } from '../../services/globales.service';
import { DbMesas } from '../../services/db.mesas.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-torneo-en-curso',
  templateUrl: './torneo-en-curso.component.html',
  styleUrls: ['./torneo-en-curso.component.css']
})
export class TorneoEnCursoComponent implements OnInit {
  FormSearch: FormGroup;
  p = 1;
  page = 1;
  players: any[];
  playersAdded: number;
  doc: any[];
  allPlayers: any[];
  dbplayersGhost: any; // Pouch With all players for delete to into tor
  dbRemoteplayersGhost: any;
  dbplayersGhostName: any;
  AllTors: any[];
  torActive: any[];
  playerFind: any[];
  arraySorteo: any[];
  nRamdon: any;
  idTor;
  nRonda: number;
  allRonda = [];
  oneTor: any[];
  playersInTor: any[];
  playersInRonda: any[];
  NumbersOfTables = []; // numero de mesas en ronda.
  player: any[];
  playerSearch: any[];
  constructor(
    private dbTournament: DbTournamentService,
    private dbJugadores: DbJugadoresService,
    private global: GlobalesService,
    private builder: FormBuilder,
    private dbMesas: DbMesas,
  ) {
    this.FormSearch = this.builder.group({
      dataPlayer: ['', Validators.required],
      selectSearch: [' ', Validators.required],
    });
  }
  ngOnInit() {
    this.filterTorActive();
    this.getAllJugadores();
    this.getAllTorneos();
    $('#popSelector').modal('show');
  }
  filterTorActive() {
    this.dbTournament.showAllTor().then((res) => {
      const n = res.docs.length;
      console.log('numero de tors = ' + n);
      const arreglo = [];
      for (let i = 0; i < n; i++) {
        if (res.docs[i].activo === true) {
          arreglo.push(res.docs[i]);
        }
      }
      this.torActive = arreglo;
      console.log(this.torActive);
    }).catch((err) => {
      console.log(err);
    }).catch((err) => {
      alert('la cagamos: ' + err);
    });
  }
  getAllJugadores() {
    this.listarPlayersRondas();
    this.agregaJugadoresAlTor(this.idTor);
    /*this.dbTournament.db.get(this.idTor).then((doc) => {
      this.allPlayers = doc.players[0];
    }).catch((err) => {
      console.log(err); // bad request?
    });*/
  }
  getAllTorneos() {
    // this.dbTournament.createIndexTournament();
    this.dbTournament.showAllTor().then((res) => {
      this.AllTors = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  getOneTorneo(id) {
    // this.dbTournament.createIndexTournament();
    this.dbTournament.showUniqueTor(id).then((res) => {
      console.log(res);
      this.oneTor = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  getJugadoresList(id) {
    this.dbTournament.showUniqueTor(id).then((tor) => {
      console.log(tor);
      console.log(tor.docs[0].rondas.jugadoresList.length);
      if (tor.docs[0].rondas.jugadoresList.length >= 0) {
        this.playersAdded = tor.docs[0].rondas.jugadoresList.length;
      } else {
        this.playersAdded = 0;
      }
    });
  }
  redirect(url) {
    this.global.redirecTo(url);
  }
  goCreateTor() {
    this.global.redirecTo('crear-torneo');
  }
  torCloseInvisible() {
    const torClose = document.getElementById('false');
  }
  showModalSelector() {
    $('#popSelector').modal('show');
  }
  showId(id) {
    return this.dbTournament.showOne(id);
  }
  sendIdTor(id) {
     this.idTor = id;
     // this.listarPlayers(id);
     this.listarPlayersRondas();
    // this.checkNplayerTor();
     this.agregaJugadoresAlTor(id);
  }
  showToast(sendTipo: string, sendTitle: string, sendMessage: string) {
    // SENDTIPO === success, danger, info
    this.global.toastEvent.emit({
      tipo: 'success',
      title: sendTitle + '',
      message: sendMessage + '',
    });
  }
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
  }
  listarPlayersRondas() {
    this.dbTournament.db.get(this.idTor).then((doc) => {
    this.playersInRonda = doc.rondas.jugadores;
    }).catch((err) => {
      console.log(err);
    });
  }
  changeFases(id) {
    const fase1 = document.getElementById('fase1');
    const fase2 = document.getElementById('fase2');
    fase1.classList.add('d-none');
    fase2.classList.remove('d-none');
    // this.listarPlayers();
    this.addPlayersRankingTor();
    this.dbTournament.allSyncDb();
  }
  searchPlayers() {
    return this.dbJugadores.showAllPlayers();
  }
  sorteum(player, idTor) {
    this.dbTournament.searchDuo(player, idTor);
  }
  // crea el listado de jugadores del cual se borrarn a medida que se agregan a la ronda
  addYremove() {
    const button = document.getElementById('btn-chargePlayer');
    const lista = document.getElementById('listaJugadores');
    button.classList.add('d-none');
    lista.classList.remove('d-none');
  }
  agregaJugadoresAlTor(id) {
    this.dbJugadores.db.allDocs({include_docs: true, descending: true, startkey: '_design'})
    .then((docs) =>  {
      const fullPlayers = docs.rows;
      this.dbTournament.db.get(id).then((doc) => {
        if (doc.playersCharged === false && doc.players.length === 0) {
          doc.playersCharged = true;
          doc.players = fullPlayers;
          return this.dbTournament.db.put(doc).then((res) => {
            if (res.ok === true) {
                this.dbTournament.db.get(this.idTor).then((tor) => {
                  this.allPlayers = tor.players;
                }).then(() => {
                  Swal.fire({
                    title: 'Jugadores en Torneo',
                    text: 'La base de datos de jugadores se agregado al torneo',
                    icon: 'success',
                    confirmButtonText: 'Genial!',
                    onClose: this.dbTournament.db.get(this.idTor)
                    .then((tor) => {
                      this.allPlayers = tor.players;
                    })
                  });
                });
              }
            });
          } else if (doc.playersCharged === true && doc.players.length === 0) {
            // aparece que todo los jugadores estan en el torneo
            const divNoplayers = document.getElementById('Noplayers');
            const lista = document.getElementById('listaJugadores');
            const filtered = document.getElementById('selectorDeFiltros');
            const searchBar = document.getElementById('searchBar');
            divNoplayers.classList.remove('d-none');
            lista.classList.add('d-none');
            filtered.classList.add('d-none');
            searchBar.classList.add('d-none');
          } else if (doc.playersCharged === true && doc.players.length > 0) {
            this.dbTournament.db.get(this.idTor).then((tor) => {
                this.allPlayers = tor.players;
            }).then(() => {
              Swal.fire({
                title: 'Jugadores ya Existian',
                text: 'no se migraron datos',
                icon: 'success',
                confirmButtonText: 'Genial!',
              });
            });
          }
      });
    });
   }
  addPlayersRankingTor() {
    this.dbTournament.db.get(this.idTor).then((res) => {
      const n = res.rondas.jugadores.length;
      // valida si hay resgistros en ranking, si es 0 agrega los jugadores al ranking
      // si es mayor a cero toma los resultados de las mesas y actualiza el ranking
      if (res.ranking.length <= 0) {
        for ( let i = 0; i < n; i++) {
        res.ranking[i] = {
              nombre: res.rondas.jugadores[i].nombre,
              apellido: res.rondas.jugadores[i].apellido,
              dni: res.rondas.jugadores[i].DNI,
              pts_favor: 0,
              pts_contra: 0,
              efectividad: 0,
              gano: 0,
              perdio: 0
            };
        }
        return this.dbTournament.db.put(res).then((wt) => {
        if (wt.ok === true) {
            Swal.fire({
            title: 'Jugadores en Ranking',
            text: 'Los jugadores estan en el ranking de este torneo',
            icon: 'success',
            confirmButtonText: 'Genial!'
            });
          }
        }).catch((err) => {
          Swal.fire({
            title: 'Algo va mal',
            text: 'datos del error' + err,
            icon: 'error',
            confirmButtonText: 'Recibido'
            });
        });
      } else {
        console.log('los jugadores ya estan en ranking');
      }
    });
  }
  // agrega jugador del listado player a el listado rondas.jugador
  async addPlayerAronda(player) {
    const data = await this.dbTournament.addPlayerAronda(this.idTor, player);
    // const playersList = this.oneTor[0].rondas.jugadoresList.length;
    if (data === 'agregado') {
      const playerSelect = document.getElementById(player.DNI);
      playerSelect.classList.add('d-none');
      this.listarPlayersRondas();
      this.playersAdded ++;
    }
  }
  validateNumberPlayersInRonda() {
    const playersList = this.oneTor[0].rondas.jugadoresList.length;
    if (this.playersAdded === playersList) {
      console.log(this.playersAdded);
    }
  }
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
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
    }
  reload() {
    this.global.redirecTo('torneo-en-curso');
  }
  // aparece y desaparece un id especifico
  dnoneAuto(id: string, action: boolean) {
    if (action === true) {
      document.getElementById(id).classList.add('d-none');
    } else if (action === false) {
      document.getElementById(id).classList.remove('d-none');
    }
  }
  // borrar player que ya se agrego al tor
  deletePlayerInList(player) {
    this.deleteInObject(this.allPlayers, player);
  }
  deleteInObject(arr, objDelete) {
    console.log(arr);
    console.log(objDelete);
    const index = arr.indexOf(objDelete);
    if (index > -1) {
      arr.splice(index, 1);
    }
    console.log(arr);
  }
  // toma datos del form searching == data
  searchingPlayer(data) {
    document.getElementById('searchResult').classList.add('d-none');
    const inputSearch = data.dataPlayer.trim().toUpperCase();
    const selectSearch = data.selectSearch;
    const print = document.getElementById('searchResult');
    const noResult = document.getElementById('noResult');
    this.dbTournament.db.get(this.idTor).then((doc) => {
      const n = doc.players.length;
      const arra = [];
      switch (selectSearch) {
        case 'DNI':
          for (let i = 0; i < n; i++) {
            if (+inputSearch === +doc.players[i].doc.DNI) {
              arra.push(doc.players[i].doc);
              this.playerFind = arra;
              noResult.classList.add('d-none');
              print.classList.remove('d-none');
              console.log(this.playerFind);
              console.log(arra);
            } else {
              noResult.classList.remove('d-none');
            }
        }
          break;
        case 'Nombre':
          for (let i = 0; i < n; i++) {
            if (inputSearch === doc.players[i].doc.nombre) {
              arra.push(doc.players[i].doc);
              this.playerFind = arra;
              noResult.classList.add('d-none');
              print.classList.remove('d-none');
              console.log(this.playerFind);
              console.log(arra);
            } else {
              noResult.classList.remove('d-none');
            }
        }
          break;
      }
    });
  }
sorteAleatorioDeMesas() {
  // crear array con players
  const arrayPlayers = [];
  this.dbTournament.db.get(this.idTor).then((doc) => {
  const mesas = doc.mesas;
  this.arraySorteo = doc.rondas.jugadores;
  const n = this.arraySorteo.length;
  const e = Math.floor(Math.random() * n + 1 ); // Ramdon Number
  for (let i = 0; i < n; i++) {
    if (doc.rondas.jugadores[i] === doc.rondas.jugadores[e]) {
      const playerFind = doc.rondas.jugadores[i];
      this.nRamdon = playerFind.nombre;
    }
  }
  }).catch((err) => {
    console.log(err);
  });
  // crear mesas en JSON para salvar en mesas
  // salvar mesas
}
mesasRamdon(nMesa, player1, player2, player3, player4) {

}


}


