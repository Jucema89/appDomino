import { Injectable, EventEmitter } from '@angular/core';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { Router } from '@angular/router';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class GlobalesService {

  db: any;
  Countries: any [] = countries;
  States: any [] = states;
  Cities: any [] = cities;
  ipConect: any;
  toastEvent = new EventEmitter();

  constructor(
    private router: Router,
  ) {
    this.db = new pouchDB('config');
   }
  SearchPais(id: any) {
    return this.Countries.find((pais) => {
      return pais.id === id;
    });
  }
  reloader(idComponent) {
    $('#editaJugador').modal('hide');
    this.router.navigate([idComponent]);
  }
  redirecTo(idComponent) {
    this.router.navigate([idComponent]);
  }
  alertCustom(titulo, texto, icono, boton) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: boton,
    });
  }
  saveUserLocal(data) {
    const password = data.pass;
    return this.db.put({
        _id: '_local/users' + password,
        name: data.name,
        mail: data.mail,
        pass: data.pass,
      });
  }
  deleteUserLocal(id) {
    this.db.get(id).then((doc) => {
      return this.db.delete(doc).then((res) => {
        if (res.ok === true) {
          alert('user deleted');
        }
      }).catch((err) => {
        console.log(err);
      });
    });
  }
  getUserLocal(pass) {
    return this.db.get('_local/users' + pass).then((res) => {
      return res;
    }).catch((err) => {
      console.log(err);
    });
  }
  saveConfig(data) {
    return this.db.get('_local/configuraciones').then((res) => {
      const rev = res._rev;
      return this.db.put({
        _id: '_local/configuraciones',
        _rev: rev,
        ip: data.numberIp,
        user: data.userIp,
        pass: data.passIp,
        url: 'http://' + data.userIp + ':' + data.passIp + '@' +  data.numberIp + ':5984/',
      }).catch((err) => {
        console.log(err);
      });
    });
  }
  getDataConect() {
    return this.db.get('_local/configuraciones');
  }
  // toma la variable de en el service y le agrega la URL de conexion;
  getUrlConect() {
    this.db.get('_local/configuraciones').then((doc) => {
      return doc.url;
    }).catch((err) => {
      console.log('error getUrlConect ' + err);
    });
  }


}
