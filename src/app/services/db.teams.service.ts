import {Injectable} from '@angular/core';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DbJugadoresService } from './db.jugadores.service';
import { GlobalesService } from './globales.service';
declare var $: any;

@Injectable({
    providedIn: 'root'
  })
  export class DbTeamService {
    equiposDB: any;
    parejasDB: any;
    nameOne: any;
    remoteEquiposDb: any;
    remoteParejasDb: any;
    constructor(
        private router: Router,
        private jugadoresServices: DbJugadoresService,
        private globalService: GlobalesService,
      ) {
        this.equiposDB = new pouchDB('equipos');
        this.parejasDB = new pouchDB('parejas');
        this.allSyncDb();
      }
      allSyncDb() {
        this.globalService.getDataConect().then((doc) => {
          this.syncDuo(doc.url + 'parejas');
          this.syncTeam(doc.url + 'equipos');
        }).catch((err) => {
          console.log(err);
        });
      }
    createIndexTeam() {
        this.equiposDB.createIndex({
          index: {fields: ['nombre_equipo']}
        }).then((res) => {
          console.log('Create Index Teams: ' + res);
        }).catch((err) => {
          console.log(err);
        });
      }
      createIndexDuos() {
        this.parejasDB.createIndex({
          index: {fields: ['_id']}
        }).then((res) => {
          console.log('Create Index Duos: ' + res);
        }).catch((err) => {
          console.log(err);
        });
      }
      showAllTeams() {
        this.createIndexTeam();
        return this.equiposDB.find({
          selector: {
            nombre_equipo: {$gte: null}
          },
          fields: ['_id', 'nombre_equipo', 'jugadorUno', 'jugadorUnoDNI', 'jugadorDos', 'jugadorDosDNI', 'jugadorTres',
           'jugadorTresDNI', 'jugadorCuatro', 'jugadorCuatroDNI', 'capitanDNI', 'capitanNombre'],
          sort: ['nombre_equipo']
        });
      }
      showAllDuos() {
        this.createIndexDuos();
        return this.parejasDB.find({
          selector: {
            _id: {$gte: null}
          },
          fields: ['_id', 'jugadorUno', 'jugadorUnoDNI', 'jugadorDos', 'jugadorDosDNI'],
          sort: ['_id']
        });
      }
      deleteTeams(id) {
        this.equiposDB.get(id).then((doc) => {
          return this.equiposDB.remove(doc);
        }).then((res) => {
          console.log(res);
          Swal.fire({
            title: 'Esta Hecho!',
            text: 'El Equipo se Elimino',
            icon: 'success',
            confirmButtonText: 'Genial!',
            onClose: () => { this.globalService.reloader('parejas'); }
          });
        }).catch((err) => {
          console.log(err);
        });
      }
      deleteDuos(id) {
        this.parejasDB.get(id).then((doc) => {
          return this.parejasDB.remove(doc);
        }).then((res) => {
          console.log(res);
          Swal.fire({
            title: 'Esta Hecho!',
            text: 'El Equipo se Elimino',
            icon: 'success',
            confirmButtonText: 'Genial!',
            onClose: () => { this.globalService.reloader('parejas'); }
          });
        }).catch((err) => {
          console.log(err);
        });
      }
      /* upTeamToPlayer toma el id del player y en su data coloca el id del team al que se asigno
    --datos: _id del player
    --idTeam: id del equipo que ya se autogenero, nuevo _id para data base
    */
    upTeamToPlayer(id, idTeam, nameTeam) {
        this.jugadoresServices.db.get(id)
        .then((doc) => {
          doc.teamId = idTeam;
          doc.teamName = nameTeam;
          console.log(doc.team);
          return this.jugadoresServices.db.put(doc);
        }).then((res) => {
          console.log(' upTeamToPlayer Correcto' + res);
        }).catch((err) => {
          console.log(err);
        });
      }
    upAllTeamAllPlayers(resOk, nameTeam, idTeam, p1, p2, p3, p4 ) {
            if (resOk === true) {
              this.upTeamToPlayer(p1, idTeam, nameTeam);
              this.upTeamToPlayer(p2, idTeam, nameTeam);
              this.upTeamToPlayer(p3, idTeam, nameTeam);
              this.upTeamToPlayer(p4, idTeam, nameTeam);
            } else {
              console.log('no se ha actualizado ningun team dentro de los players');
            }
    }
    addTeam(data, playerCap) {
      const nameTeam = data.teamName.toUpperCase();
      console.log(nameTeam);
      this.equiposDB.put({
            _id: new Date().toISOString(),
            nombre_equipo: data.teamName.toUpperCase(),
            jugadorUno: data.playerOne.nombre.toUpperCase(),
            jugadorUnoDNI: data.playerOne.DNI,
            jugadorDos: data.playerTwo.nombre.toUpperCase(),
            jugadorDosDNI: data.playerTwo.DNI,
            jugadorTres: data.playerThree.nombre.toUpperCase(),
            jugadorTresDNI: data.playerThree.DNI,
            jugadorCuatro: data.playerFour.nombre.toUpperCase(),
            jugadorCuatroDNI: data.playerFour.DNI,
            capitanNombre: playerCap.nombre.toUpperCase(),
            capitanDNI: playerCap.DNI,
        }).then((res) => {
            console.log(res);
            const idTeam = res.id;
            console.log(idTeam, nameTeam);
            this.upAllTeamAllPlayers(res.ok, nameTeam, idTeam, data.playerOne._id,
              data.playerTwo._id, data.playerThree._id, data.playerFour._id);
            Swal.fire({
              title: 'Equipo Creado!',
              text: 'Los Datos se Guardaron',
              icon: 'success',
              confirmButtonText: 'Genial!',
              onClose: () => { this.globalService.reloader('parejas'); }
            });
        }).catch((err) => {
          console.log(err);
        });
      }
      upDuoToPlayer(id, idDuo) {
        this.jugadoresServices.db.get(id)
        .then((doc) => {
          doc.duoId = idDuo;
          console.log(doc.duoId);
          return this.jugadoresServices.db.put(doc);
        }).then((res) => {
          console.log(' upDuoToPlayer Correcto = ' + res.ok);
        }).catch((err) => {
          console.log(err);
        });
      }
      upAllDuoAllPlayers(resOk, idTeam, p1, p2 ) {
        if (resOk === true) {
          this.upDuoToPlayer(p1, idTeam);
          this.upDuoToPlayer(p2, idTeam);
        } else {
          console.log('no se ha actualizado ningun Duo dentro de los players');
        }
      }
      addDuo(data) {
        this.parejasDB.put({
              _id: new Date().toISOString(),
              jugadorUno: data.playerOne.nombre.toUpperCase(),
              jugadorUnoDNI: data.playerOne.DNI,
              jugadorDos: data.playerTwo.nombre.toUpperCase(),
              jugadorDosDNI: data.playerTwo.DNI,
          }).then((res) => {
              console.log(res);
              console.log(res);
              const idDuo = res.id;
              console.log(idDuo);
              this.upAllDuoAllPlayers(res.ok, idDuo, data.playerOne._id, data.playerTwo._id);
              Swal.fire({
                title: 'Pareja Creada!',
                text: 'Los Datos se Guardaron',
                icon: 'success',
                confirmButtonText: 'Genial!',
                onClose: () => { this.globalService.reloader('parejas'); }
              });
          }).catch((err) => {
            console.log(err);
          });
        }
    findPareja(id) {
        this.createIndexDuos();
        return this.parejasDB.find({
          selector: {
            _id: {$eq: id}
          },
          fields: ['_id', 'jugadorUno', 'jugadorUnoDNI', 'jugadorDos', 'jugadorDosDNI'],
          sort: ['_id']
        });
      }
    syncTeam(urlRemote: string) {
      this.remoteEquiposDb = new pouchDB(urlRemote);
      this.equiposDB.replicate.from(urlRemote).on('complete',
      () => {
        this.equiposDB.sync(this.remoteEquiposDb, {
          live: true,
          retry: true
        }).on('complete', () => {
          // yay, we're in sync!
        }).on('error', (err) => {
          console.log('error', err);
        });
      });
      this.remoteEquiposDb.sync(this.equiposDB, {
        live: true,
        retry: true
      });
    }
    syncDuo(urlRemote: string) {
        this.remoteParejasDb = new pouchDB(urlRemote);
        this.parejasDB.replicate.from(urlRemote).on('complete',
          () => {
          this.parejasDB.sync(this.remoteParejasDb, {
            live: true,
            retry: true
          }).on('complete', () => {
            // yay, we're in sync!
            console.log('yay, we are in sync!');
          }).on('error', (err) => {
            console.log('error sync', err);
          });
        });
        this.remoteParejasDb.sync(this.parejasDB, {
          live: true,
          retry: true
        });
      }

}
