import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { DbTournamentService } from '../../services/db.tournament.service';
import { GlobalesService } from '../../services/globales.service';
import { DbTeamService } from '../../services/db.teams.service';
import { DbMesas } from '../../services/db.mesas.service';
import { Rankings } from '../../services/rankings.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';


declare var $: any;

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  FormConfig: FormGroup;
  FormLogo: FormGroup;
  FormSmtp: FormGroup;
  allConfig: any [];
  allConfigArray: any [];
  allSmtp: any;
  statusSmtp: any;
  configData: any;

  constructor(
    private jugadoresService: DbJugadoresService,
    private torneosService: DbTournamentService,
    private equiposService: DbTeamService,
    private globalService: GlobalesService,
    private mesasDB: DbMesas,
    private Ranking: Rankings,
    private builder: FormBuilder,
    // public src: string,
    // public file: File,
  ) {
    this.FormConfig = this.builder.group({
      numberIp: ['', Validators.required],
      userIp: ['', Validators.required],
      passIp: ['', Validators.required],
    });
    this.FormLogo = this.builder.group({
      logo: ['', Validators.required],
    });
    this.FormSmtp = this.builder.group({
      serverMasivo: ['', Validators.required],
      smtpUrl: ['', Validators.required],
      smtpUser: ['', Validators.required],
      smtpPort: ['', Validators.required],
      smtpPass: ['', Validators.required],
    });
   }

  ngOnInit() {
    this.allSmtp = false;
    this.getDataConfig();
    this.smtpConfig();
  }
  inicialConfig() {
      this.globalService.db.put({
        _id: '_local/configuraciones',
        ip: '0.0.0.0',
        user: 'user',
        pass: 'password'
      }).catch((err) => {
        console.log(err);
      });
      this.getDataConfig();
      this.ngOnInit();
  }
  saveSmtp(data) {
    const smtpEmpity = document.getElementById('smtpEmpity');
    const smtpClosed = document.getElementById('smtpClosed');
    const smtpLoader = document.getElementById('smtpLoader');
    this.globalService.db.get('_local/smtp').then((smtp) => {
      smtp.serverMasivo = data.serverMasivo;
      smtp.smtpUrl = data.smtpUrl;
      smtp.smtpUser = data.smtpUser;
      smtp.smtpPort = data.smtpPort;
      smtp.smtpPass = data.smtpPass;
      return this.globalService.db.put(smtp).then((res) => {
        if (res.ok === true) {
          this.smtpConfig();
          smtpClosed.classList.remove('d-none');
          smtpEmpity.classList.add('d-none');
          smtpLoader.classList.add('d-none');
          Swal.fire({
            title: 'Datos SMTP configurados',
            text: 'Te recomendamos probar tu nuevo servicio de notificaciones por correo',
            icon: 'success',
            confirmButtonText: 'Genial!',
          });
        }
      }).catch((err) => {
        console.log('error de put smtp = ' + err);
        Swal.fire({
            title: 'No se pudo guardar',
            text: 'Algo va mal, codigo error = ' + err,
            icon: 'error',
            confirmButtonText: 'Recibido',
          });
      });
    });
  }
smtpConfig() {
    const smtpEmpity = document.getElementById('smtpEmpity');
    const smtpClosed = document.getElementById('smtpClosed');
    const smtpLoader = document.getElementById('smtpLoader');
    // smtpLoader.classList.remove('d-none');
    this.globalService.db.get('_local/smtp').then((doc) => {
      console.log('geting local smtp = ' + doc);
      if (doc.serverMasivo === '') {
        smtpEmpity.classList.remove('d-none');
        smtpClosed.classList.add('d-none');
        smtpLoader.classList.add('d-none');
      } else {
        this.allSmtp = doc;
        smtpEmpity.classList.add('d-none');
        smtpClosed.classList.remove('d-none');
        smtpLoader.classList.add('d-none');
      }
      console.log(doc);
    }).catch((err) => {
      console.log('geting local smtp ' + err);
      if ( err.name ===  'not_found') {
        this.globalService.db.put({
          _id: '_local/smtp',
          serverMasivo: '',
          smtpUrl: '',
          smtpUser: '',
          smtpPort: '',
          smtpPass: '',
        }).then((resPut) => {
          if (resPut.ok === true) {
            this.globalService.db.get('_local/smtp').then((smtpNew) => {
              this.allSmtp = smtpNew;
              smtpLoader.classList.add('d-none');
              smtpEmpity.classList.add('d-none');
              smtpClosed.classList.remove('d-none');
            });
            console.log('se agregaron datos dummy a smtp');
          }
        });
      }
    });
  }
  deleteSmtp() {
    this.globalService.db.get('_local/smtp').then((doc) => {
      return this.globalService.db.put({
        _id: doc._id,
        _rev: doc._rev,
        serverMasivo: '',
        smtpUrl: '',
        smtpUser: '',
        smtpPort: '',
        smtpPass: '',
      }).then((resPut) => {
        if (resPut.ok === true) {
          Swal.fire({
            title: 'SMTP eliminado',
            text: 'Los datos de conexión se eliminaron',
            icon: 'success',
            confirmButtonText: 'Genial!',
          }).then(() => {
            this.FormSmtp.reset();
            this.smtpConfig();
          });
        }
      }).catch((err) => {
        Swal.fire({
          title: 'SMTP no se puedo eliminar',
          text: 'algo salio mal, CODIGO: ' + err,
          icon: 'error',
          confirmButtonText: 'Recibido',
          onClose: this.smtpConfig
        });
      });
    });
  }
  deleteDatabase(dataBase, nombreDb) {
    dataBase.destroy().then((res) => {
      if (res.ok === true) {
        Swal.fire({
          title: 'Base de Datos ' + nombreDb + ' Eliminada',
          text: 'Los datos se eliminaron',
          icon: 'success',
          confirmButtonText: 'Genial!',
      });
      }
    }).catch((err) => {
      Swal.fire({
        title: 'No se pudo eliminar la base de datos',
        text: err,
        icon: 'error',
        confirmButtonText: 'wtf?',
    });
    });
  }
  borrarJugadores() {
    this.deleteDatabase(this.jugadoresService.db, 'Jugadores');
  }
  borrarTorneos() {
    this.deleteDatabase(this.torneosService.db, 'Torneos');
  }
  borrarParejas() {
    this.deleteDatabase(this.equiposService.parejasDB, 'Parejas');
  }
  borrarEquipos() {
    this.deleteDatabase(this.equiposService.equiposDB, 'Equipos');
  }
  borrarMesas() {
    this.deleteDatabase(this.mesasDB.dbMesas, 'Mesas');
  }
  borrarRanking() {
    this.deleteDatabase(this.Ranking.dbRanking, 'Ranking Nacional');
  }
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
  }
  listarIndices() {
    const jugadoresIndex = this.jugadoresService.listIndex();
    jugadoresIndex.then((res) => {
      console.log(res);
      this.allConfig = res.indexes;
      this.allConfigArray = res.indexes.def.fields;
    }).catch((err) => {
      console.log(err);
    });
  }
  // wtfNumber devuelve 1 si el dato es un numero o tiene un numero
  wtfNumber(dato) {
    const numeros = '0123456789';
    let i: any;
    for ( i = 0; i < dato.length; i++) {
      if (numeros.indexOf(dato.charAt(i), 0) !== -1) {
           return 1;
        }
     }
    return 0;
    }
  saveFormConfig(data) {
    this.globalService.saveConfig(data).then((res) => {
      console.log('true response ' + res.ok);
      if ( res.ok === true) {
        setTimeout('window.location.reload()', 500);
      }
    });
  }
  viewConfigForm() {
    const form = document.getElementById('formConfig');
    const formValues = document.getElementById('formConfigValues');
    form.classList.remove('d-none');
    formValues.classList.add('d-none');
  }
  getDataConfig() {
    const form = document.getElementById('formConfig');
    const formValues = document.getElementById('formConfigValues');
    const button = document.getElementById('inicialConfig');
    this.globalService.getDataConect().then((doc) => {
      this.configData = doc;
      if (typeof(doc.ip) === 'string' ) {
        form.classList.add('d-none');
        formValues.classList.remove('d-none');
        button.classList.add('d-none');
      }
    }).catch((err) => {
      console.log('error getConfig Data ' + err);
    });
  }
  deleteConfig() {
    this.globalService.db.get('_local/configuraciones').then((doc) => {
      return this.globalService.db.remove(doc);
    }).then((res) => {
      if (res.ok === true) {
        Swal.fire({
          title: 'Datos Borrados',
          text: 'Los datos de conexion a servidor remoto se eliminaron!',
          icon: 'success',
          confirmButtonText: 'Esta bien',
          onClose: () => { window.location.reload(); }
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }

}
