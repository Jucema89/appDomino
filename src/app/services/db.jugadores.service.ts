import {Injectable} from '@angular/core';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find').default);
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GlobalesService } from './globales.service';
declare var $: any;

@Injectable({
    providedIn: 'root'
  })
  export class DbJugadoresService {
    Countries: any [] = countries;
    States: any [] = states;
    Cities: any [] = cities;
    db: any;
    remoteJugadoresDb: any;
    constructor(
      private router: Router,
      private globalesService: GlobalesService,
    ) {
      this.db = new pouchDB('jugadores');
      this.allSyncDb();
    }
    allSyncDb() {
      this.globalesService.getDataConect().then((doc) => {
        this.sync(doc.url + 'jugadores');
      }).catch((err) => {
        console.log(err);
      });
    }
addPlayer(datos, pass, country, state, city) {
      this.db.put({
          _id: new Date().toISOString(),
          nombre: datos.name.trim().toUpperCase(),
          apellido: datos.lastName.trim().toUpperCase(),
          DNI: datos.cc,
          mail: datos.mail,
          password: pass,
          celular: datos.phone.trim(),
          direccion: datos.address,
          pais: country,
          estado: state,
          ciudad: city,
          id_team: ' ',
          nombre_equipo: ' ',
          id_club: ' ',
          nombre_club: ' ',
          id_pareja: datos.idPareja,
          nombre_pareja: ' ',
          duoId: '',
          torneos: {},
        }).then((res) => {
        console.log(res);
        if (res.ok === true) {
          Swal.fire({
            title: 'Registro Actualizado',
            text: 'Id Player:' + res.id,
            icon: 'success',
            confirmButtonText: 'Genial!',
            onClose: () => { this.globalesService.reloader('listar-jugador'); }
          });
        }
      }).catch((err) => {
        console.log(err);
      });
    }
    createIndex() {
      this.db.createIndex({
        index: {
          fields: ['DNI', '_id', 'nombre'],
          name: 'General_index',
          ddoc: 'jugadores_index'
        }
      }).then((res) => {
        console.log('Create Index Players: ' + res);
      }).catch((err) => {
        console.log(err);
      });
    }
    createIndexName() {
      this.db.createIndex({
        index: {
          fields: ['nombre'],
          name: 'Nombres_index',
          ddoc: 'jugadores_nombres_index'
        }
      }).then((res) => {
        console.log('Create Index Names: ' + res);
      }).catch((err) => {
        console.log(err);
      });
    }
    createIndexDNI() {
      return this.db.createIndex({
        index: {
          fields: ['DNI'],
          name: 'DNI_index',
          ddoc: 'jugadores_DNI_index',
        },
      }); /*.then((res) => {
        console.log('Create Index DNI: ' + res);
      }).catch((err) => {
        console.log(err);
      });*/
    }
    listIndex() {
      return this.db.getIndexes();
      /*.then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      });*/
    }
    borrarIndexes() {
      this.listIndex().then((res) => {
        return this.db.deleteIndex(res.indexes[1]);
      }).then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      });
    }
    showAllPlayers() {
      // this.createIndex();
      return this.db.find({
        selector: {
          _id: {$gte: null}
        },
        sort: ['_id']
      });
    }
    showPlayerName(data) {
     // this.createIndex();
      return this.db.find({
        selector: {
          nombre: data },
        fields: ['_id', 'nombre', 'apellido', 'DNI', 'mail', 'celular', 'direccion', 'pais', 'estado', 'ciudad'],
        sort: ['nombre']
      });
    }
    showPlayerNameAlls(data) {
     // this.createIndexName();
      return this.db.find({
        selector: {
          nombre: {$eq: data} },
        fields: ['_id', 'nombre', 'apellido', 'DNI', 'mail', 'celular', 'direccion', 'pais', 'estado', 'ciudad'],
        sort: ['nombre']
      });
    }
    showPlayerDNI(dato) {
     // this.createIndexDNI();
      return this.db.find({
        selector: {
          DNI: dato },
        fields: ['_id', 'nombre', 'apellido', 'DNI', 'mail', 'celular', 'direccion', 'pais', 'estado', 'ciudad'],
        sort: ['DNI']
      });
    }
    showPlayerDNIother(dato) {
     this.createIndexDNI().then(() => {
         this.db.find({
          selector: {
            DNI: {$eq: dato},
          },
          fields: ['_id', 'nombre', 'apellido', 'DNI', 'mail', 'celular', 'direccion', 'pais', 'estado', 'ciudad'],
          sort: ['DNI']
        }).then((res) => {
          console.log(res);
          return res;
        });
      }).catch((err) => {
        console.log(err);
      });
    }
    showPlayerId(data) {
      // this.createIndex();
      return this.db.find({
        selector: {
          _id: data },
          fields: ['_id', 'DNI', 'nombre', 'apellido',  'mail', 'celular', 'direccion', 'pais', 'estado', 'ciudad'],
          sort: ['_id']
      });
    }
    reloader() {
      $('#editaJugador').modal('hide');
      this.router.navigate(['listar-jugador']);
    }
    addOne(IDBD, datos, country, state, city) {
      this.db.get(IDBD).then((doc) => {
        console.log(doc);
        doc.nombre = datos.name;
        doc.apellido = datos.lastName;
        doc.DNI = datos.cc;
        doc.mail =  datos.mail;
        doc.telefono = datos.phone;
        doc.direccion = datos.address;
        doc.pais = country;
        doc.estado = state;
        doc.ciudad = city;
        return this.db.put(doc); // put updated doc, will create new revision
      }).then((response) => {
        console.log(response);
        Swal.fire({
          title: 'Todo Ok!',
          text: 'Registro Actualizado Exitosamente!',
          icon: 'success',
          confirmButtonText: 'Genial!',
          onClose: () => { this.globalesService.reloader('listar-jugador'); }
        });
      }).catch((err) => {
        if (err) {
          return;
        }
      });
    }
    showTodos() {
      return this.db.allDocs({include_docs: true, descending: true});
    }
    deletePlayer(id) {
      this.db.get(id).then((doc) => {
        return this.db.remove(doc);
      }).then((res) => {
        // console.log(res);
        Swal.fire({
          title: 'Registro Eliminado!',
          text: 'Se borro Exitosamente!',
          icon: 'success',
          confirmButtonText: 'Genial!',
          onClose: () => { this.reloader(); }
        });
      }).catch((err) => {
        console.log(err);
      });
    }
    deleteTodo(todo) {
      this.db.remove(todo);
    }
   sync(urlRemote: string) {
      this.remoteJugadoresDb = new pouchDB(urlRemote);
      this.db.replicate.from(urlRemote).on('complete',
        () => {
        this.db.sync(this.remoteJugadoresDb, {
          live: true,
          retry: true
        }).on('complete', () => {
          // yay, we're in sync!
          console.log('yay, we are in sync!');
        }).on('error', (err) => {
          console.log('error sync', err);
        });
      });
      this.remoteJugadoresDb.sync(this.db, {
        live: true,
        retry: true
      });
    }
  }
