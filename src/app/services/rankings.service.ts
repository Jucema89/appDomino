import { Injectable } from '@angular/core';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';
import { GlobalesService } from './globales.service';
import { DbJugadoresService } from './db.jugadores.service';
import { DbTournamentService } from './db.tournament.service';
declare var $: any;

@Injectable({
    providedIn: 'root'
  })
export class Rankings {
    rankingMundiales: object;
    rankingNacionales: object;
    rankingLocales: object;
    dbRanking: any;
    remoteRankingDb: any;
    dbRankingHistorial: any;
    remoteRankingHistorial: any;
    idTor: any;
    puntos: number;
    arrayFinal = {};

constructor(
  private globales: GlobalesService,
  private dbJugadores: DbJugadoresService,
  private dbTorneos: DbTournamentService,
) {
  this.dbRanking = new pouchDB('ranking');
  this.dbRankingHistorial = new pouchDB('ranking_historial');
  this.allSyncDb();
  this.chargeRankingTables();
}
chargeRankingTables() {
      const mundiales = {
        1: 130, 2: 120, 3: 100, 4: 90, 5: 85, 6: 80, 7: 75, 8: 65, 9: 60, 10: 56,
        11: 54, 12: 52, 13: 50, 14: 48, 15: 44, 16: 40, 17: 36, 18: 34, 19: 32, 20: 30,
        21: 28, 22: 26, 23: 24, 24: 22, 25: 20, 26: 18, 27: 16, 28: 14, 29: 12, 30: 11,
        31: 10, 32: 9, 33: 8, 34: 7, 35: 6, 36: 5, 37: 4, 38: 3, 39: 2, 40: 1
      };
      const nacionales = {
        1: 100, 2: 90, 3: 80, 4: 70, 5: 65, 6: 60, 7: 55, 8: 50, 9: 46, 10: 42,
        11: 38, 12: 34, 13: 30, 14: 28, 15: 26, 16: 24, 17: 22, 18: 20, 19: 18, 20: 16,
        21: 14, 22: 12, 23: 10, 24: 9, 25: 8, 26: 7, 27: 6, 28: 5, 29: 4, 30: 3, 31: 2, 32: 1
      };
      const locales = {
        1: 80, 2: 70, 3: 60, 4: 50, 5: 44, 6: 38, 7: 32, 8: 26, 9: 20, 10: 16,
        11: 12, 12: 8, 13: 6, 14: 4, 15: 2, 16: 1
      };
      this.rankingLocales = locales;
      this.rankingNacionales = nacionales;
      this.rankingMundiales = mundiales;
  }
  alertSwall(titulo, mensaje, icono, btnClose) {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: icono,
      confirmButtonText: btnClose,
    });
  }
  putRankingPlayer(player) {
    this.dbRanking.put({
      _id: player.dni,
      nombre: player.nombre,
      dni: player.dni
    }).then((res) => {
      if (res.ok === true) {
        console.log('Jugador en Ranking General');
      }
    });
  }
  asignPointsExtras(dni) {
     return new Promise((result, reject) => {
      this.dbTorneos.db.get(this.idTor).then((tor) => {
        // local 5pts -regional 7pts - nacional 10pts  - internacional 20pts - cerrado 3pts
        const torTipo = tor.tipo;
        const torCiudad = tor.ciudad;
        this.dbJugadores.showPlayerDNI(+dni).then((player) => {
          // let pts: number;
          const playerCiudad = player.docs[0].ciudad;
          if ( torTipo === 'Cerrado') {
            this.puntos = 3;
          } else if (torTipo === 'Internacional') {
            this.puntos = 20;
          } else if (torTipo === 'Nacional') {
            this.puntos = 10;
          } else if ( torTipo === 'Local' && playerCiudad === torCiudad ) {
            this.puntos = 5;
          } else if ( torTipo === 'Local' && playerCiudad !== torCiudad ) {
            this.puntos = 7;
          }
          // console.log('pts extra = ' + pts);
          result(true);
        }).catch((err) => {
          reject(err);
        });
      });
     });
  }
  updatePointsRanking(arrayPlayers) {
    const m = arrayPlayers.length;
    const arrayToPut = {
      _id: '',
      puntos: {},
      datosTor: {
        nombre: '',
        participantes: 0,
        ubicacion: '',
       }
      };
    const arrayFinal = {};
    const arrayToPoints = [];
    return new Promise ((result) => {
      for (let e = 0; e < m; e++) {
        this.asignPointsExtras(+arrayPlayers[e].dni)
         .then((doc) => {
           if (doc === true) {
            const ptsExtraz: number = this.puntos;
            arrayFinal[e] = {
                posicion: arrayPlayers[e].pos,
                nombre: arrayPlayers[e].nombre,
                apellido: arrayPlayers[e].apellido,
                dni: arrayPlayers[e].dni,
                pts: arrayPlayers[e].pts,
                ptsExtra: ptsExtraz,
                ptsTotal: arrayPlayers[e].pts + ptsExtraz,
              };
            arrayToPoints.push({
                posicion: arrayPlayers[e].pos,
                nombre: arrayPlayers[e].nombre,
                apellido: arrayPlayers[e].apellido,
                dni: arrayPlayers[e].dni,
                pts: arrayPlayers[e].pts,
                ptsExtra: ptsExtraz,
                ptsTotal: arrayPlayers[e].pts + ptsExtraz,
              });
            if ( e + 1 === m) {
              this.dbTorneos.db.get(this.idTor).then((tor) => {
                  arrayToPut._id = tor._id;
                  arrayToPut.puntos = arrayFinal;
                  arrayToPut.datosTor.nombre = tor.nombre;
                  arrayToPut.datosTor.participantes = tor.numeroParticipantes;
                  arrayToPut.datosTor.ubicacion = tor.pais + ' | ' + tor.estado + ' | ' + tor.ciudad;
                  this.saveHistory(arrayToPut);
                  this.updatePtsAllPlayer(arrayToPoints);
                  // console.log(arrayToPut);
                });
            }
           }
         }).catch((err) => {
           console.log(err);
         });
      }
      result (arrayFinal);
    });
  }
  // toma los datos del tor al terminar y crea el historial de Pts del torneo
  esperaDatos(array) {
  this.updatePointsRanking(array);
  }
  updatePtsAllPlayer(array) {
    console.log(array);
    this.allDatosRanking().then((players) => {
      console.log(players.rows);
      const n = array.length;
      console.log(n);
      for (let i = 0; i <= n; i++) {
          for (let e = 0; e <= n; e++) {
              if (array[i].dni === players.rows[e].doc.dni) {
                const ptsOld: number = players.rows[e].doc.puntos;
                const ptsNew: number = array[i].ptsTotal;
                console.log(ptsOld);
                console.log(ptsNew);
                const tors = [];
                if (players.rows[e].doc.torneos.length >= 1) {
                  tors.push(players.rows[e].doc.torneos);
                }
                this.dbTorneos.db.get(this.idTor).then((tor) => {
                  tors.push(tor.nombre);
                  const user = {
                    dni: players.rows[e].doc.dni,
                    nombre: players.rows[e].doc.nombre,
                    puntos: ptsOld + ptsNew,
                    torneos: tors,
                    _id: players.rows[e].doc._id,
                    _rev: players.rows[e].doc._rev
                  };
                  this.dbRanking.put(user).then((res) => {
                    console.log(res);
                  });
                });
              }
            }
        }
    }).catch((err) => {
      console.log(err);
    });
  }
  saveHistory(arrayPut) {
    // console.log(arrayPut);
    this.dbRankingHistorial.put(arrayPut)
      .then((res) => {
        if (res.ok === true) {
          this.alertSwall(
            'Historial Actualizado',
            'El historial de puntos de este torneo se han guardado en el historial del ranking',
            'success',
            'Genial'
          );
        }
      }).catch((err) => {
        console.log(err);
        if (err.status === 409) {
          this.dbRankingHistorial.get(arrayPut._id).then((doc) => {
            this.dbRankingHistorial.put(arrayPut, doc._rev).then((response) => {
              if (response.ok === true) {
                this.alertSwall(
                  'Historial Actualizado',
                  'El historial de puntos de este torneo se han guardado en el historial del ranking',
                  'success',
                  'Genial'
                );
              } else {
                this.alertSwall(
                  'Algo salio mal',
                  'Ocurrio un error: ' + err,
                  'error',
                  'Recibido'
                );
              }
            });
          });
        }
      });
  }
  deleteHistoryDoc(id) {
    return this.dbRankingHistorial.get(id).then((doc) => {
      return this.dbRankingHistorial.remove(doc);
    });
  }
  allDatosRankingHistory() {
    return this.dbRankingHistorial.allDocs({include_docs: true, descending: true});
  }
  getOneRankingHistory(id) {
    return new Promise((result, reject) => {
      this.dbRankingHistorial.get(id)
      .then((datos) => {
        const array = [];
        const n = datos.datosTor.participantes;
        for (let i = 0; i < n; i++) {
          array.push(datos.puntos[i]);
        }
        result (array);
      }).catch((err) => {
        reject (err);
      });
    });
  }
  // this.dataRanking operations
  allDatosRanking() {
    return this.dbRanking.allDocs({include_docs: true, descending: true});
  }
  getOneRanking(id) {
    return new Promise((result, reject) => {
      this.dbRanking.get(id)
      .then((datos) => {
        result (datos);
      }).catch((err) => {
        reject (err);
      });
    });
  }
  getRanking(id) {
    return this.dbRanking.get(id);
  }
  saveRanking(doc) {
    this.dbRanking.put(doc).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }
  savePlayerinRanking(player) {
    return this.dbRanking.put(player).then((res) => {
      return res;
    }).catch((err) => {
      console.log(err);
    });
  }
  deletePlayerInRanking(playerId) {
    return this.dbRanking.get(playerId).then((doc) => {
      return this.dbRanking.remove(doc).then((res) => {
        return res;
      });
    });
  }
  // Sync Operations
  allSyncDb() {
    this.globales.getDataConect().then((doc) => {
    this.syncRanking(doc.url + 'ranking');
    this.syncRankingHistory(doc.url + 'ranking_historial');
    // console.log('data de conexion: ' + doc.url);
    }).catch((err) => {
      console.log(err);
    });
  }
  syncRanking(urlRemote: string) {
    this.remoteRankingDb = new pouchDB(urlRemote);
    this.dbRanking .replicate.from(urlRemote)
      .on('complete',
        () => {
      this.dbRanking .sync(this.remoteRankingDb, {
          live: true,
          retry: true
        }).on('complete', () => {
          // yay, we're in sync!
          console.log('yay, we are in sync!');
        }).on('error', (err) => {
          console.log('error sync', err);
        });
      })
      .on('error',
      () => {
      this.dbRanking.replicate.to(urlRemote);
      });
    this.remoteRankingDb.sync(this.dbRanking, {
        live: true,
        retry: true
      });
  }
  syncRankingHistory(urlRemote: string) {
    this.remoteRankingHistorial = new pouchDB(urlRemote);
    this.dbRankingHistorial.replicate.from(urlRemote)
      .on('complete',
        () => {
      this.dbRankingHistorial
      .sync(this.remoteRankingHistorial, {
          live: true,
          retry: true
        }).on('complete', () => {
          // yay, we're in sync!
          console.log('yay, we are in sync!');
        }).on('error', (err) => {
          console.log('error sync', err);
        });
      })
      .on('error',
      () => {
      this.dbRankingHistorial.replicate.to(urlRemote);
      });
    this.remoteRankingHistorial.sync(this.dbRankingHistorial, {
        live: true,
        retry: true
      });
    }


}
