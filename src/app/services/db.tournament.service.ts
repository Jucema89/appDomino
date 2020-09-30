import {Injectable} from '@angular/core';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GlobalesService } from './globales.service';
import { DbJugadoresService } from './db.jugadores.service';
declare var $: any;

@Injectable({
    providedIn: 'root'
  })
  export class DbTournamentService {
    db: any;
    remoteTorneosDb: any;
    torIndex = false;
    data: any[];
    arrayRondas: any[];
    jugadorSorteum: any[];
    playersInRonda = [];
    idTor;
    nMesas; // numero de la mesa individual

    constructor(
      private router: Router,
      private globalService: GlobalesService,
      private DbJugadores: DbJugadoresService,
      // private mesa: Mesa,
    ) {
      this.db = new pouchDB('torneos');
      this.allSyncDb();
    }
   allSyncDb() {
      this.globalService.getDataConect().then((doc) => {
        this.syncTors(doc.url + 'torneos');
      }).catch((err) => {
        console.log(err);
      });
    }
    createIndexTournament() {
      return this.db.createIndex({
        index: {fields: ['_id', 'nombre', 'tipo', 'sistema', 'jugadores', 'rondas', 'tiempoRondas', 'players', 'sistema_rigido',
        'modoJuego', 'modoIndividual', 'metaJuego', 'numeroMeta', 'fechaInicio', 'fechaFinal', 'mesas', 'numeroParticipantes',
        'direccion', 'pais', 'estado', 'ciudad']}
      });
    }
    showAllTor() {
    return this.createIndexTournament().then(() => {
      return this.db.find({
        selector: {
          _id: {$gte: null}
        },
        fields: ['_id', 'nombre', 'tipo', 'activo', 'sistema', 'jugadores', 'rondas', ' rondaActual', 'tiempoRondas',
        'playersCharged', 'players', 'sistema_rigido',
         'modoJuego', 'modoIndividual', 'metaJuego', 'numeroMeta', 'fechaInicio', 'fechaFinal', 'mesas', 'numeroParticipantes',
         'direccion', 'pais', 'estado', 'ciudad'],
        sort: ['_id']
      });
    });
    }
    showUniqueTor(data) {
      return this.createIndexTournament().then(() => {
        return this.db.find({
          selector: {
            _id: data
          },
          fields: ['_id', 'nombre', 'tipo', 'sistema', 'rondas', 'tiempoRondas', 'players', 'sistema_rigido',
          'modoJuego', 'modoIndividual', 'metaJuego', 'numeroMeta', 'fechaInicio', 'fechaFinal', 'mesas',
          'numeroParticipantes', 'direccion', 'pais', 'estado', 'ciudad'],
          sort: ['_id']
        });
      });
    }
    deleteTournament(id) {
      this.db.get(id).then((doc) => {
        return this.db.remove(doc);
      }).then((res) => {
        Swal.fire({
          title: 'Torneo Eliminado!',
          text: 'Se borro Exitosamente!',
          icon: 'success',
          confirmButtonText: 'Genial!',
          onClose: () => { this.globalService.reloader('listar-torneo'); }
        });
      }).catch((err) => {
        console.log(err);
      });
    }
    addingPlayerTor(idTor, player) {
      this.db.get(idTor).then((doc) => {
      const n = doc.players.length;
      for (let i = 0;  i <= n; i++) {
        if ( i === n ) {
          doc.players[i] = {
            id: player._id,
            DNI: player.DNI,
            nombre: player.nombre,
            nombreEquipo: player.teamName,
            idEquipo: player.teamId,
            idPareja: player.duoId,
            puntos: 0,
            mesa: 0,
            };
        }
            }
      return this.db.put(doc);
          }).then((res) => {
            if (res.ok === true) {
              Swal.fire({
                title: 'Jugador Agregado',
                text: 'Jugador en torneo',
                icon: 'success',
                confirmButtonText: 'Genial!',
              });
            }
        });
      }
      // sorteo de puestos en mesas
      // busca pareja
      searchDuo(player2, idTor) {
        // recibimos el DNI del Jugador #2 que toca buscar
          this.db.get(idTor).then((doc) => {
            const n = doc.rondas.jugadores.length;
            for (let i = 0;  i <= n; i++) {
              if ( doc.rondas.jugadores[i].DNI === player2.DNI ) {
                return doc.rondas.jugadores[i];
              }
            }
          }).catch((err) => {
            console.log(err);
          });
      }
      // busca cualquier jugador con el numero DNI
      searchAnyPlayer(playerDNI, idTor) {
        // recibimos el DNI del Jugador #2 que toca buscar
          return this.db.get(idTor).then((doc) => {
            const jugador = doc.rondas.jugadores;
            for (let i = 0;  i < doc.rondas.jugadores.length; i++) {
              if ( jugador[i].DNI === +playerDNI ) {
                return doc.rondas.jugadores[i];
              }
            }
          });
      }
      playersListRondas(idTor) {
        const playersList = [];
        return this.db.get(idTor).then((doc) => {
          const n = doc.players.length;
          for (let i = 0; i < n; i++ ) {
            const player = doc.players[i].id;
            if ( player !== doc.rodas.jugadores[i].id) {
              playersList.push(player);
            }
          }
          console.log(playersList);
          return playersList;
        });
      }
      saveTor(dataTor) {
        return this.db.put(dataTor);
      }
      addTor(datos: any, country: any, state: any, city: any) {
        const tournament = {
              _id: new Date().toISOString(),
              nombre: datos.nameTournament.trim().toUpperCase(),
              tipo: datos.typeTournament,
              activo: true,
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
              playersCharged: false,
              ranking: [],
              players: [],
              rondas: {
                rondaActual: 1,
                jugadores: [],
                jugadoresList: [],
                allRondas: []
              }
            };
        this.db.put(tournament, (err) => {
          if (err) {
            return;
          }
          Swal.fire({
            title: 'Esta Hecho!',
            text: 'Torneo Creado',
            icon: 'success',
            confirmButtonText: 'Genial!',
            onClose: () => { this.globalService.reloader('torneo-en-curso'); }
          });
        }).catch((err) => {
          console.log(err);
        });
      }
    showPlayersTor(id) {
      return this.db.get(id);
    }
    showOne(id) {
      this.db.get(id).then((doc) => {
      const data = {
        nombre: doc.nombre,
        inicio: doc.fechaInicio,
        final: doc.fechaFinal,
        modo: doc.modalidad,
        individual: doc.modoIndividual,
        sistema: doc.sistema,
        rondas: doc.rondas,
        jugadores: doc.jugadores,
        torPlayers: doc.players,
        mesas: doc.mesas,
        estado: doc.estado,
        ciudad: doc.ciudad,
      };
      console.log(data);
      return data;
      }).catch((err) => {
        console.log(err);
      });
    }
    showTor(id) {
      return this.db.get(id);
    }
    showTodos() {
      return this.db.allDocs({include_docs: true, descending: true});
    }
    /*
    Se cuentan los jugadores, se agregan a jugadoresList y se borran de players */
    addPlayerAronda(torId, player) {
      return new Promise ((result, reject) => {
        this.db.get(torId).then((doc) => {
          const n = doc.rondas.jugadores.length;
          for ( let i = 0; i <= n; i++ ) {
            if ( i === n) {
              doc.rondas.jugadores[i] = player;
              doc.rondas.jugadoresList[i] = player;
            }
          }
          return this.db.put(doc).then((res) => {
            if (res.ok === true) {
              this.deletePlayerToRoda(torId, player);
              result ('agregado');
            }
          });
        }).catch((err) => {
          reject (err);
        });
      });
    }
    showToast(sendTipo: string, sendTitle: string, sendMessage: string) {
      // SENDTIPO === success, danger, info
      this.globalService.toastEvent.emit({
        tipo: 'success',
        title: sendTitle + '',
        message: sendMessage + '',
      });
    }
    deletePlayerToRoda(torId, player) {
      this.db.get(torId).then((doc) => {
        const n = doc.players.length;
        const arra = [];
        for (let i = 0; i < n; i++) {
          if ( i <= n) {
            arra.push(doc.players[i]);
          }
        }
        console.log(arra);
        for ( let i = 0; i <= n; i++ ) {
          if (arra[i].id === player._id) {
            arra.splice(i, 1);
            doc.players = arra;
            return this.db.put(doc).then((res) => {
              if (res.ok === true) {
                this.showToast('success', 'Jugador Agregado', player.nombre + ' se agrego al torneo');
              }
            }).catch((err) => {
              console.log(err);
            });
          }
        }
      });
    }
   deleteTodo(todo) {
      this.db.remove(todo)
      .then(() => {
        Swal.fire({
          title: 'Esta Hecho!',
          text: 'Torneo Eliminado',
          icon: 'success',
          confirmButtonText: 'Genial!',
          onClose: () => { this.globalService.reloader('crear-torneo'); }
      });
      }).catch((err) => {
        console.log(err);
      });
    }
    syncTors(urlRemote: string) {
      this.remoteTorneosDb = new pouchDB(urlRemote);
      this.db.replicate.from(urlRemote)
      .on('complete',
        () => {
        this.db.sync(this.remoteTorneosDb, {
          live: true,
          retry: true
        }).on('complete', () => {
          // yay, we're in sync!
          console.log('yay, we are in sync!');
        }).on('error', (err) => {
          console.log('error sync', err);
        });
      });
      this.remoteTorneosDb.sync(this.db, {
        live: true,
        retry: true
      });
    }
  }
