import {Injectable, EventEmitter} from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GlobalesService } from './globales.service';
import { DbJugadoresService } from './db.jugadores.service';
import { DbTournamentService } from './db.tournament.service';
import { DbJuecesService } from './db.jueces.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));


@Injectable({
    providedIn: 'root'
  })

  export class DbMesas {
      addRonda = new EventEmitter<string>();
      dbMesas: any;
      dbRemoteMesas: any;
      allMesas: any;
      urlRemote: any;
      idTor: any;

    constructor(
        private router: Router,
        private globalService: GlobalesService,
        private DbTorneos: DbTournamentService,
        private DbJueces: DbJuecesService,
        private DbJugadores: DbJugadoresService,
      ) {
        this.dbMesas = new pouchDB('mesas');
        this.allSyncDb();
      }
     allSyncDb() {
        this.globalService.getDataConect().then((doc) => {
          this.syncMesas(doc.url + 'mesas');
        }).catch((err) => {
          console.log(err);
        });
      }
      showMesas() {
      return this.dbMesas.allDocs({ include_docs: true, descending: true });
      }
      showMesa(id) {
        return this.dbMesas.get(id);
      }
      borraMesa(id) {
        return this.dbMesas.get(id).then((doc) => {
          return this.dbMesas.remove(doc);
        });
      }
      IndexarMesas() {
        this.dbMesas.createIndex({
          index: {
            fields: ['_id', '_rev', 'p11', 'p12', 'p21', 'p22', 'juez'],
            name: 'Index_mesas',
            ddoc: 'Mesas_index'
          }
        }).then((res) => {
          console.log('Index Mesas creados: ' + res);
        }).catch((err) => {
          console.log(err);
        });
      }
      agregarMesas(p11, p12, p21, p22, juez, mesa) {
        return this.dbMesas.put({
            _id: mesa.trim(),
            partidas: '',
            cerrada: false,
            p11: {
            nombre: p11.nombre,
            Dni: p11.DNI,
            pts_favor: 0,
            pts_contra: 0,
            result: '',
            observaciones: ''
            },
            p12: {
              nombre: p12.nombre,
              Dni: p12.DNI,
              pts_favor: 0,
              pts_contra: 0,
              result: '',
              observaciones: ''
            },
            p21: {
              nombre: p21.nombre,
              Dni: p21.DNI,
              pts_favor: 0,
              pts_contra: 0,
              result: '',
              observaciones: ''
            },
            p22: {
              nombre: p22.nombre,
              Dni: p22.DNI,
              pts_favor: 0,
              pts_contra: 0,
              result: '',
              observaciones: ''
            },
            juez: {
              id: juez._id,
              nombre: juez.nombre,
              Dni: juez.DNI,
            },
        });
      }
        // actualiza los pts de cada jugador en el torneo cada ronda
        // player === player.p11
        // playerValues === values.P11
      updatePtsPlayerRanking(player, idTor, ptsFavor, ptsContra, result) {
      return this.DbTorneos.db.get(idTor).then((res) => {
          let winPts = 0;
          let losePts = 0;
          switch (result) {
            case 'Gano':
              winPts = 1;
              losePts = 0;
              break;
            case 'Perdio':
              winPts = 0;
              losePts = 1;
              break;
          }
          const n = res.ranking.length;
          for ( let i = 0; i <= n; i++) {
            if ( +player.Dni === res.ranking[i].dni ) {
              res.ranking[i] = {
                nombre: res.ranking[i].nombre,
                apellido: res.ranking[i].apellido,
                dni: res.ranking[i].dni,
                pts_favor:  +res.ranking[i].pts_favor + +ptsFavor,
                pts_contra: +res.ranking[i].pts_contra + +ptsContra,
                efectividad: (+res.ranking[i].pts_favor + +ptsFavor) - (+res.ranking[i].pts_contra + +ptsContra),
                gano: +res.ranking[i].gano + winPts,
                perdio: +res.ranking[i].perdio + losePts,
              };
              return this.DbTorneos.db.put(res);
            }
          }
        });
      }
      updatePtsRanking(values, id, idTor) {
        // p11
        this.dbMesas.get(id).then((doc) => {
         this.updatePtsPlayerRanking(doc.p11, idTor, values.P11_ptsFavor,
          values.P11_ptsContra, values.P11_win).then((res1) => {
            if (res1.ok === true) {
              // p12
              this.dbMesas.get(id).then((doc2) => {
                this.updatePtsPlayerRanking(doc2.p12, idTor, values.P12_ptsFavor,
                  values.P12_ptsContra, values.P12_win).then((res2) => {
                    if (res2.ok === true) {
                      // p21
                      this.dbMesas.get(id).then((doc3) => {
                        this.updatePtsPlayerRanking(doc3.p21, idTor, values.P21_ptsFavor,
                          values.P21_ptsContra, values.P21_win).then((res3) => {
                            if (res3.ok === true) {
                              // p22
                              this.dbMesas.get(id).then((doc4) => {
                                this.updatePtsPlayerRanking(doc4.p22, idTor, values.P22_ptsFavor,
                                  values.P22_ptsContra, values.P22_win).then((res4) => {
                                    if (res4.ok === true) {
                                      this.DbTorneos.allSyncDb();
                                      setTimeout(() => {
                                        Swal.fire({
                                          title: 'Resultados Agregados',
                                          text: 'Los resultados de esta mesa se agregaron al ranking',
                                          icon: 'success',
                                          confirmButtonText: 'Genial!',
                                        });
                                      }, 1500);
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
    }
      saveMesa(values, id) {
        this.dbMesas.get(id).then((doc) => {
        return this.dbMesas.put({
           _id: doc._id,
           _rev: doc._rev,
           partidas: values.nPartidas,
           cerrada: true,
           p11: {
             nombre: doc.p11.nombre,
             Dni: doc.p11.Dni,
             pts_favor: values.P11_ptsFavor,
             pts_contra: values.P11_ptsContra,
             result: values.P11_win,
             observaciones: values.P11_obs,
             efectividad: +values.P11_ptsFavor - +values.P11_ptsContra
             },
           p12: {
             nombre: doc.p12.nombre,
             Dni: doc.p12.Dni,
             pts_favor: values.P12_ptsFavor,
             pts_contra: values.P12_ptsContra,
             result: values.P12_win,
             observaciones: values.P12_obs,
             efectividad: +values.P12_ptsFavor - +values.P12_ptsContra
             },
           p21: {
             nombre: doc.p21.nombre,
             Dni: doc.p21.Dni,
             pts_favor: values.P21_ptsFavor,
             pts_contra: values.P21_ptsContra,
             result: values.P21_win,
             observaciones: values.P21_obs,
             efectividad: +values.P21_ptsFavor - +values.P21_ptsContra
             },
           p22: {
             nombre: doc.p22.nombre,
             Dni: doc.p22.Dni,
             pts_favor: values.P22_ptsFavor,
             pts_contra: values.P22_ptsContra,
             result: values.P22_win,
             observaciones: values.P22_obs,
             efectividad: +values.P22_ptsFavor - +values.P22_ptsContra
             },
           juez: {
               id: doc.juez.id,
               nombre: doc.juez.nombre,
               Dni: doc.juez.Dni,
             },
           }).then((res) => {
           if (res.ok === true) {
             Swal.fire({
               title: 'Mesa Cerrada',
               text: 'Los resultados de esta mesa han sido guardados',
               icon: 'success',
               confirmButtonText: 'Genial!',
             });
           }
           }).catch((err) => {
             Swal.fire({
               title: 'Algo va mal',
               text: 'Datos error: ' + err,
               icon: 'error',
               confirmButtonText: 'Recibido',
             });
           });
         });
       }
       jugadorAleatorio() {
        return this.DbTorneos.db.get(this.idTor).then((doc) => {
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
        return this.DbTorneos.db.get(this.idTor).then((doc) => {
          const arrayPlayers =  doc.rondas.jugadoresList;
          const n = doc.rondas.jugadoresList.length;
          console.log(arrayPlayers);
          for ( let i = 0; i < n; i++) {
            if (arrayPlayers[i]._id === playerId) {
              arrayPlayers.splice(i, 1);
              doc.rondas.jugadoresList = arrayPlayers;
              return this.DbTorneos.db.put(doc);
            }
          }
        });
      }
      juezAleatorio() {
        return this.DbJueces.db.allDocs({include_docs: true, descending: true, startkey: '_design'})
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
                                        playerArray.push('Mesa' + nMesa);
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
         mesaRamdon(nMesa) {
          return this.aleatoriosPlayers(nMesa).then((players) => {
            return this.agregarMesas(
              players[0],
              players[1],
              players[2],
              players[3],
              players[4].doc,
              players[5],
            );
          });
        }
      syncMesas(urlRemote: string) {
        this.dbRemoteMesas = new pouchDB(urlRemote);
        this.dbMesas.replicate.from(urlRemote)
        .on('complete',
          () => {
          this.dbMesas.sync(this.dbRemoteMesas, {
            live: true,
            retry: true
          }).on('complete', () => {
            // yay, we're in sync!
            console.log('yay, we are in sync!');
          }).on('error', (err) => {
            console.log('error sync', err);
          });
        });
        this.dbRemoteMesas.sync(this.dbMesas, {
          live: true,
          retry: true
        });
      }
}
