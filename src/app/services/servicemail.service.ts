import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalesService } from './globales.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));

@Injectable({
  providedIn: 'root'
})
export class ServiceMail {
  dbMensajes: any;
  dbMensajesRemote: any;
  serverMasivo: any;
  smtpUrl: any;
  smtpUser: any;
  smtpPort: any;
  smtpPass: any;
  bodyMessage: any [];
  msjHtml: any;
  constructor(
      private globales: GlobalesService,
      private http: HttpClient
  ) {
      this.dbMensajes = new pouchDB('mensajes');
      this.allSyncDb();
      this.getDataConexionSmtp();
  }
  allMsj() {
    return this.dbMensajes.allDocs({include_docs: true, descending: true});
  }
  showAllMsjs() {
    return this.dbMensajes.find({
      selector: {
        _id: {$gte: null}
      },
      sort: ['_id']
    });
  }
  allSyncDb() {
    this.globales.getDataConect().then((doc) => {
        this.sync(doc.url + 'mensajes');
    }).catch((err) => {
        console.log(err);
    });
  }
  getDataConexionSmtp() {
    this.globales.db.get('_local/smtp').then((smtp) => {
      this.serverMasivo = smtp.serverMasivo;
      this.smtpUrl = smtp.smtpUrl;
      this.smtpUser = smtp.smtpUser;
      this.smtpPort = smtp.smtpPort;
      this.smtpPass = smtp.smtpPass;
    });
  }
  sendMessage(msj: string, subj: string, playerId: string, playerName: string) {
    return this.dbMensajes.put({
      _id: new Date().toISOString(),
      playerDestiny: playerId,
      playerNombre: playerName,
      subject: subj,
      message: msj,
      estado: 'sin leer',
      reply: ''
    });
  }
  deleteMessage(id) {
    return this.dbMensajes.get(id).then((doc) => {
      return this.dbMensajes.remove(doc);
    });
  }
  postApiMail(bodyMessage) {
    const urlApi = this.serverMasivo;
    return this.http.post(urlApi, bodyMessage, {
    });
  }
  sendMail(mailTO, subjectMail, messageMail) {
    this.msjHtml = `
    <html>
      <img src="https://fulldominocolombia.com/wp-content/uploads/logo_appdomino_black.png" width="200px" heigth="auto">
      <h2>` + subjectMail + `</h2>
      <p>` + messageMail + `</p>
      <a target="_blank" href="https://app.fulldomino.com" >Ir a AppDomino</a>
      <p style="font-size:8px" > Este mensaje fue enviado de manera automatica.</p>
      <p style="font-size:8px" >Si este mensaje llego a Spam; favor indicar que  no es spam</p>
    </html>`;
    const bodyRequest = {
        host: this.smtpUrl,
        port: this.smtpPort,
        autuser: this.smtpUser,
        autpass: this.smtpPass,
        mailto: mailTO,
        mailfrom: 'info@fulldominocolombia.com',
        subject: subjectMail,
        message: messageMail,
        messageHtml: this.msjHtml,
      };
    this.postApiMail(bodyRequest).subscribe((resp) => {
      console.log(resp);
      // respuesta de api server mail
    });
  }
  sync(urlRemote: string) {
    this.dbMensajesRemote = new pouchDB(urlRemote);
    this.dbMensajes.replicate.from(urlRemote).on('complete',
      () => {
      this.dbMensajes.sync(this.dbMensajesRemote, {
        live: true,
        retry: true
      }).on('complete', () => {
        // yay, we're in sync!
        console.log('yay, we are in sync!');
      }).on('error', (err) => {
        console.log('error sync', err);
      });
    });
    this.dbMensajesRemote.sync(this.dbMensajes, {
      live: true,
      retry: true
    });
  }
}
