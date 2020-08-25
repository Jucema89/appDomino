import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { ServiceMail } from '../../services/servicemail.service';
import pouchDB from 'pouchdb';
pouchDB.plugin(require('pouchdb-find'));
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-send-mail',
  templateUrl: './send-mail.component.html',
  styleUrls: ['./send-mail.component.css']
})
export class SendMailComponent implements OnInit {
  p = 1;
  playerFind: any[];
  allMsj: any[];
  playerSelected: any;
  FormSearch: FormGroup;
  FormMail: FormGroup;

  constructor(
    private Dbjugadores: DbJugadoresService,
    private Mailer: ServiceMail,
    private builder: FormBuilder,
  ) {
    this.FormSearch = this.builder.group({
      dataPlayer: ['', Validators.required],
      selectSearch: [' ', Validators.required],
    });
    this.FormMail = this.builder.group({
      playerDni: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      sendToMail: [''],
    });
   }

  ngOnInit() {
    this.getAllMsj();
  }
  showModal(id) {
    $('#modal' + id).modal('show');
    console.log('show' + id);
  }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
  }
  async getAllMsj() {
    const mesjs = await this.Mailer.showAllMsjs();
    this.allMsj = mesjs.docs;
  }
  sendMsj(data) {
    console.log(data);
    console.log(data.playerDni);
    this.Dbjugadores.showPlayerDNI(+data.playerDni)
    .then((dato) => {
      console.log(dato);
      this.Mailer.sendMessage(
        data.message,
        data.subject,
        dato.docs[0]._id,
        dato.docs[0].nombre,
        )
      .then((res) => {
        if (res.ok === true) {
          if (data.sendToMail === true) {
            // enviando mail
          this.Mailer.sendMail(dato.docs[0].mail, data.subject, data.message);
          console.log(dato.mail);
          }
          this.getAllMsj();
          Swal.fire({
            title: 'Mensaje Enviado',
            text: 'El mensaje esta en la bandeja del jugador',
            icon: 'success',
            confirmButtonText: 'Genial!',
          });
        }
        }).catch((err) => {
          Swal.fire({
            title: 'Algo va mal',
            text: 'error' + err,
            icon: 'error',
            confirmButtonText: 'Recibido',
          });
        });
    });
  }
  deleteMsj(id) {
    this.Mailer.deleteMessage(id).then((res) => {
      if (res.ok === true) {
        this.getAllMsj();
        Swal.fire({
          title: 'Mensaje Borrado',
          text: 'Este Mensaje y su seguimiento se ha eliminado',
          icon: 'success',
          confirmButtonText: 'Listo',
        });
      }
    });
  }
  searchingPlayer(data) {
    const inputSearch = data.dataPlayer.trim().toUpperCase();
    const selectSearch = data.selectSearch;
    this.Dbjugadores.showTodos().then((players) => {
      console.log(players);
      const n = players.rows.length;
      const arra = [];
      switch (selectSearch) {
        case 'DNI':
          for (let i = 0; i < n; i++) {
            if (+inputSearch === +players.rows[i].doc.DNI) {
              arra.push(players.rows[i].doc);
              this.playerFind = arra;
              console.log(this.playerFind);
              console.log(arra);
            }
        }
          break;
        case 'Nombre':
          for (let i = 0; i < n; i++) {
            if (inputSearch === players.rows[i].doc.nombre) {
              arra.push(players.rows[i].doc);
              this.playerFind = arra;
              console.log(this.playerFind);
              console.log(arra);
            }
        }
          break;
      }
    });
  }

}
