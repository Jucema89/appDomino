import { Component, OnInit , Input } from '@angular/core';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';
import { DbJuecesService } from '../../services/db.jueces.service';
import { Rankings } from '../../services/rankings.service';
import { DbMesas } from '../../services/db.mesas.service';
import { DbTournamentService } from '../../services/db.tournament.service';
import { GlobalesService } from '../../services/globales.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
declare var $: any;

@Component({
  selector: 'app-nav-float',
  templateUrl: './nav-float.component.html',
  styleUrls: ['./nav-float.component.css']
})
export class NavFloatComponent implements OnInit {
  page = 1;
  tables: any[];
  nRonda: number;
  arrayPlayersRandom: any;
  rankingTor: any[];
  tablePoints: any;
  ptsExt: any;
  @Input() idTor: any;
  remoteConect: boolean; // remote data base conect? yes - no

  constructor(
    private DBmesas: DbMesas,
    private dbTournament: DbTournamentService,
    private DbJuez: DbJuecesService,
    public globales: GlobalesService,
    public ranking: Rankings,
    private jugadoresDb: DbJugadoresService
  ) {}

  ngOnInit() {
    this.ranking.chargeRankingTables();
    this.getRankingTorPos();
    this.getAllMesas();
    this.wtfRonda();
    this.sendIdTorRanking();
    this.dbTournament.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getRankingTorPos();
    });
    this.DBmesas.dbMesas.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getAllMesas();
    });
  }
  conexionStatus() {
    this.globales.getDataConect().then((doc) => {
      console.log(doc);
      console.log(doc.ip);
      if (typeof(doc.ip) === 'string' && doc.ip !== '0.0.0.0') {
          this.remoteConect = true;
          console.log('si hay conexion');
        } else {
          this.remoteConect = false;
          console.log('No hay conexion');
      }
    });
  }
  sendIdTorRanking() {
    this.ranking.idTor = this.idTor;
  }
  getRankingTorPos() {
    this.page = 1;
    this.dbTournament.db.get(this.idTor).then((res) => {
      this.rankingTor = res.ranking;
    });
  }
  getAllMesas() {
    this.DBmesas.showMesas().then((docs) => {
      this.tables = docs.doc;
    });
  }
  reloadThisComponent(txt) {
    this.DBmesas.addRonda.emit(txt);
  }
  wtfRonda() {
      this.dbTournament.db.get(this.idTor).then((res) => {
        this.nRonda = res.rondas.rondaActual;
      }).catch((err) => {
        Swal.fire({
          title: 'Algo va mal al Buscar mesa desde Nav-Float',
          text: 'Error: ' + err + this.idTor,
          icon: 'error',
          confirmButtonText: 'Recibido',
        });
      });
      this.nRonda = this.nRonda++;
  }
  createPlayerList() {
    this.dbTournament.db.get(this.idTor).then((doc) => {
      doc.rondas.jugadoresList = doc.rondas.jugadores;
      return this.dbTournament.db.put(doc);
      });
  }
  createRonda() {
    const nM = this.nRonda + 1;
    this.DBmesas.showMesas().then((doc) => {
      this.dbTournament.db.get(this.idTor).then((res) => {
        res.rondas.rondaActual = nM;
        res.rondas.allRondas[nM] = doc.rows;
        return this.dbTournament.db.put(res).then((answer) => {
          if (answer.ok === true) {
            this.nRonda = nM;
            this.createPlayerList();
            this.DBmesas.dbMesas.destroy().then((response) => {
              if (response.ok === true) {
                // remote db conect yes - no
                this.conexionStatus();
                setTimeout(() => {
                  // alert(this.remoteConect);
                  switch (this.remoteConect) {
                    case true:
                      this.DBmesas.dbRemoteMesas.destroy();
                      this.DBmesas.dbMesas = new pouchDB('mesas');
                      this.DBmesas.allSyncDb();
                      this.reloadThisComponent('ronda');
                      break;
                    case false:
                      this.DBmesas.dbMesas = new pouchDB('mesas');
                      this.DBmesas.allSyncDb();
                      this.reloadThisComponent('ronda');
                      break;
                  }
                }, 500);
                Swal.fire({
                  title: 'Ronda Guardada',
                  text: 'Puedes Continuar con la Siguiente',
                  icon: 'success',
                  confirmButtonText: 'Genial!'
                });
              }
            }).catch((error) => {
              Swal.fire({
                title: 'Error eliminando todas las mesas',
                text: error,
                icon: 'error',
                confirmButtonText: 'Wtf?!',
              });
            });
          }
        }).catch((err) => {
          Swal.fire({
            title: 'Algo va mal al guardar mesa en torneo | 3ra linea',
            text: err,
            icon: 'error',
            confirmButtonText: 'wtf?',
          });
        });
      }).catch((err) => {
      console.log('error 2da linea = ' + err);
      Swal.fire({
        title: 'Algo va mal al traer torneo | 2da linea',
        text: err,
        icon: 'error',
        confirmButtonText: 'wtf?',
      });
    });
    }).catch((err) => {
      Swal.fire({
        title: 'Algo va mal al traer las mesas | 1ra linea',
        text: err,
        icon: 'error',
        confirmButtonText: 'wtf?',
      });
    });
  }
  redirectTorFinal() {
    this.globales.redirecTo('/listar-torneo');
  }
  finTorneo() {
    const nM = this.nRonda + 1;
    this.DBmesas.showMesas().then((doc) => {
      this.dbTournament.db.get(this.idTor).then((res) => {
        res.activo = false;
        res.rondas.rondaActual = nM;
        res.rondas.allRondas[nM] = doc.rows;
        return this.dbTournament.db.put(res).then((answer) => {
          if (answer.ok === true) {
            this.nRonda = nM;
            this.DBmesas.dbMesas.destroy().then((response) => {
              if (response.ok === true) {
                this.DBmesas.dbRemoteMesas.destroy();
                this.DBmesas.dbMesas = new pouchDB('mesas');
                this.DBmesas.allSyncDb();
                this.dbTournament.db.get(this.idTor).then((tor) => {
                  // update rankingTor
                  this.getRanking(tor.tipo);
                  tor.rondas.rondaActual = tor.rondas.rondaActual - 1;
                  return this.dbTournament.db.put(tor).then((info) => {
                    if (info.ok === true) {
                      this.dbTournament.allSyncDb();
                      Swal.fire({
                        title: 'Torneo Cerrado',
                        text: 'Datos guadados',
                        icon: 'success',
                        confirmButtonText: 'Genial!',
                      });
                      this.reloadThisComponent('final');
                    }
                  });
                });
              }
            });
          }
        });
      });
    });
  }
  jugadorAleatorio() {
    return this.dbTournament.db.get(this.idTor).then((doc) => {
    let arrayPlayers = [];
    arrayPlayers =  doc.rondas.jugadoresList;
    console.log(arrayPlayers);
    const n = doc.rondas.jugadoresList.length;
    console.log('numero de jugadores en lista = ' + n);
    const e = Math.floor(Math.random() * n); // Ramdon Number
    for (let i = 0; i < n; i++) {
      if (doc.rondas.jugadoresList[i] === doc.rondas.jugadoresList[e]) {
        console.log(doc.rondas.jugadoresList[i]);
        return doc.rondas.jugadoresList[i];
      }
    }
    }).catch((err) => {
      console.log(err);
    });
  }
  borrarJugadorList(playerId) {
    return this.dbTournament.db.get(this.idTor).then((doc) => {
      const arrayPlayers =  doc.rondas.jugadoresList;
      const n = doc.rondas.jugadoresList.length;
      console.log(arrayPlayers);
      for ( let i = 0; i < n; i++) {
        if (arrayPlayers[i]._id === playerId) {
          arrayPlayers.splice(i, 1);
          doc.rondas.jugadoresList = arrayPlayers;
          return this.dbTournament.db.put(doc);
        }
      }
    });
  }
  juezAleatorio() {
    return this.DbJuez.db.allDocs({include_docs: true, descending: true, startkey: '_design'})
    .then((jueces) => {
      console.log(jueces);
      const n = jueces.rows.length;
      console.log('numero de jueces = ' + n);
      console.log('numer de jueces: ' + n);
      const e = Math.floor(Math.random() * n); // Ramdon Number
      const juez = jueces.rows[e];
      return juez;
    });
  }
  aleatoriosPlayers(nMesa) {
    const players = new Promise((resolve, reject) => {
      const playerArray = [];
      this.jugadorAleatorio().then((player1) => {
            const p11 = player1;
            playerArray.push(p11);
            this.borrarJugadorList(p11._id).then((res) => {
              if (res.ok === true) {
                this.jugadorAleatorio().then((player2) => {
                  const p12 = player2;
                  playerArray.push(p12);
                  this.borrarJugadorList(p12._id).then((res2) => {
                    if (res2.ok === true) {
                      this.jugadorAleatorio().then((player3) => {
                        const p21 = player3;
                        playerArray.push(p21);
                        this.borrarJugadorList(p21._id).then((res3) => {
                          if (res3.ok === true) {
                            this.jugadorAleatorio().then((player4) => {
                              const p22 = player4;
                              playerArray.push(p22);
                              this.borrarJugadorList(p22._id).then((res4) => {
                                if (res4.ok === true) {
                                  this.juezAleatorio().then((juez) => {
                                    playerArray.push(juez);
                                    playerArray.push('Mesa' + ( nMesa + 1));
                                    resolve(playerArray);
                                    if (!playerArray) {
                                      reject('Algo salio mal');
                                    }
                                  });
                                }
                              });
                            });
                          }
                        });
                      });
                    }
                  });
                });
              }
            });
          });
      });
    return players;
     }
  allMesasRandom() {
    this.dbTournament.db.get(this.idTor).then((tor) => {
      const nMesas = tor.mesas;
      this.mesaRamdon(nMesas);
    });
  }
  mesaRamdon(nMesas) {
    for (let i = 0; i < nMesas; i++) {
      if ( i <= nMesas) {
        this.aleatoriosPlayers(i).then((players) => {
          this.DBmesas.agregarMesas(
            players[0],
            players[1],
            players[2],
            players[3],
            players[4].doc,
            players[5],
          );
        });
      }
    }
  }
  asignPointsInTable(pos) {
    const n = pos + '';
    return this.tablePoints[n];
  }
  /*
  asignPointsExtras(dni) {
     return new Promise ((resolve, reject) => {
      this.dbTournament.db.get(this.idTor).then((tor) => {
        // local 5pts -regional 7pts - nacional 10pts  - internacional 20pts - cerrado 3pts
        const torTipo = tor.tipo;
        const torCiudad = tor.ciudad;
        this.jugadoresDb.showPlayerDNI(+dni).then((player) => {
          let pts: number;
          const playerCiudad = player.docs[0].ciudad;
          if ( torTipo === 'Cerrado') {
            pts = 3;
          } else if (torTipo === 'Internacional') {
            pts = 20;
          } else if (torTipo === 'Nacional') {
            pts = 10;
          } else if ( torTipo === 'Local' && playerCiudad === torCiudad ) {
            pts = 5;
          } else if ( torTipo === 'Local' && playerCiudad !== torCiudad ) {
             pts = 7;
          }
          console.log('pts extra = ' + pts);
          resolve (pts);
        });
      }).catch((err) => {
        reject (err);
      });
     })
     ;
  }
  */
  // RANKING NACIONAL
  chargeTablePoints(typeTor) {
    if (typeTor === 'Local') {
      this.tablePoints = this.ranking.rankingLocales;
      } else if (typeTor === 'Nacional') {
        this.tablePoints = this.ranking.rankingNacionales;
        }  else if (typeTor === 'Mundial') {
          this.tablePoints = this.ranking.rankingMundiales;
    }
  }
  getRanking(typeTor: string) {
    console.log(typeTor);
    this.chargeTablePoints(typeTor);
    this.dbTournament.db.get(this.idTor).then((doc) => {
      // const ranking = doc.ranking;
      // const tipo = doc.tipo;
      const n = doc.ranking.length;
      const arrayUnOrder = [];
      const arrayFinal = [];
      for (let i = 0; i < n; i++) {
        if ( i <= n) {
          arrayUnOrder.push(doc.ranking[i]);
        }
      }
      const arrayOrder = arrayUnOrder.sort((a, b) => {
        return (b.efectividad - a.efectividad);
      });
      const m = arrayOrder.length;
      for (let e = 0; e < m; e++) {
        const num = e + 1;
        arrayFinal.push({
          pos: num,
          nombre: arrayOrder[e].nombre,
          apellido: arrayOrder[e].apellido,
          dni: arrayOrder[e].dni,
          pts: this.asignPointsInTable(num),
          ptsExtra: 0,
          ptsTotal: this.asignPointsInTable(num),
      });
      }
      console.log(JSON.stringify(arrayFinal));
      // this.ranking.updatePointsRanking(arrayFinal);
      this.ranking.esperaDatos(arrayFinal);
      }).catch((err) => {
      console.log(err);
      });
  }
  probarRanking() {
    this.dbTournament.db.get(this.idTor).then((tor) => {
      console.log('ejecutamos tor ranking' + tor.tipo);
      this.getRanking(tor.tipo);
    });
  }
}
