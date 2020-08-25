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
  export class DbJuecesService {
    Countries: any [] = countries;
    States: any [] = states;
    Cities: any [] = cities;
    db: any;
    remoteJuecesDb: any;
    constructor(
      private router: Router,
      private globalesService: GlobalesService,
    ) {
      this.db = new pouchDB('jueces');
      this.allSyncDb();
    }
    allSyncDb() {
      this.globalesService.getDataConect().then((doc) => {
        this.sync(doc.url + 'jueces');
      }).catch((err) => {
        console.log(err);
      });
    }
    createIndex() {
        this.db.createIndex({
          index: {
            fields: ['DNI', '_id', 'nombre'],
            name: 'Jueces_index',
            ddoc: 'jueces_index'
          }
        }).then((res) => {
          console.log('Create Index Players: ' + res);
        }).catch((err) => {
          console.log(err);
        });
      }
      showAllJueces() {
        this.createIndex();
        return this.db.find({
          selector: {
            _id: {$gte: null}
          },
          sort: ['_id']
        });
      }
      showOneJuez(id) {
        return this.db.get(id);
      }
      addJuez(datos, country, state, city) {
        this.db.put({
          _id: new Date().toISOString(),
          nombre: datos.name.trim().toUpperCase(),
          apellido: datos.lastName.trim().toUpperCase(),
          DNI: datos.cc,
          mail: datos.mail,
          telefono: datos.phone.trim(),
          direccion: datos.address,
          pais: country,
          estado: state,
          ciudad: city,
          }).then((res) => {
          console.log(res);
          Swal.fire({
            title: 'Registro Actualizado',
            text: 'Agregaste un nuevo Juez',
            icon: 'success',
            confirmButtonText: 'Genial!',
            onClose: () => { this.globalesService.reloader('jueces'); }
          });
        }).catch((err) => {
          console.log(err);
        });
      }
      deleteJuez(id) {
        this.db.get(id).then((doc) => {
          return this.db.remove(doc);
        }).then((res) => {
          if (res.ok === true) {
            Swal.fire({
              title: 'Juez Eliminado!',
              text: 'Se borro Exitosamente!',
              icon: 'success',
              confirmButtonText: 'Genial!',
              onClose: () => { this.reloader(); }
            });
          }
        }).catch((err) => {
          console.log(err);
        });
      }
      reloader() {
        location.reload();
      }
      sync(urlRemote: string) {
        this.remoteJuecesDb = new pouchDB(urlRemote);
        this.db.replicate.from(urlRemote).on('complete',
          () => {
          this.db.sync(this.remoteJuecesDb, {
            live: true,
            retry: true
          }).on('complete', () => {
            // yay, we're in sync!
            console.log('yay, we are in sync!');
          }).on('error', (err) => {
            console.log('error sync', err);
          });
        });
        this.remoteJuecesDb.sync(this.db, {
          live: true,
          retry: true
        });
      }


  }
