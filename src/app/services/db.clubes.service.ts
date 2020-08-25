import {Injectable} from '@angular/core';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
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
  export class DbClubesService {
    Countries: any [] = countries;
    States: any [] = states;
    Cities: any [] = cities;
    db: any;
    remoteClubesDb: any;
    constructor(
      private router: Router,
      private globalesService: GlobalesService,
    ) {
      this.db = new pouchDB('clubes');
      this.allSyncDb();
    }
    allSyncDb() {
      this.globalesService.getDataConect().then((doc) => {
        this.syncClubs(doc.url + 'clubes');
      }).catch((err) => {
        console.log(err);
      });
    }
    addClub(datos, country, state, city) {
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
            text: 'Id Juez:' + res.id,
            icon: 'success',
            confirmButtonText: 'Genial!',
            onClose: () => { this.globalesService.reloader('jueces'); }
          });
        }).catch((err) => {
          console.log(err);
        });
      }
      deleteClub(id) {
        this.db.get(id).then((doc) => {
          return this.db.remove(doc);
        }).then((res) => {
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
      reloader() {
        this.router.navigate(['clubes']);
      }
      syncClubs(urlRemote: string) {
        this.remoteClubesDb = new pouchDB(urlRemote);
        this.db.replicate.from(urlRemote).on('complete',
          () => {
          this.db.sync(this.remoteClubesDb, {
            live: true,
            retry: true
          }).on('complete', () => {
            // yay, we're in sync!
            console.log('yay, we are in sync!');
          }).on('error', (err) => {
            console.log('error sync', err);
          });
        });
        this.remoteClubesDb.sync(this.db, {
          live: true,
          retry: true
        });
      }

  }
