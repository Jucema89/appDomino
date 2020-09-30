import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalesService } from '../../services/globales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, OnDestroy {
  FormLoginUser: FormGroup;
  FormCreateUser: FormGroup;
  allUsers: any[];

  constructor(
    private builder: FormBuilder,
    private global: GlobalesService,
    ) {
      this.FormLoginUser = this.builder.group({
        mail: ['', Validators.required],
        pass: ['', Validators.required],
      });
      this.FormCreateUser = this.builder.group({
        name: ['', Validators.required],
        mail: ['', Validators.required],
        pass: ['', Validators.required],
      });
     }

  ngOnInit() {
    document.getElementById('navDomino').classList.add('d-none');
    this.changeBackground('on');
  }
  ngOnDestroy() {
    this.changeBackground('off');
  }
  ingress() {
    document.getElementById('navDomino').classList.remove('d-none');
    this.global.redirecTo('/jugador');
  }
  changeBackground(action) {
    const back = document.getElementById('cuerpo');
    const login = document.getElementById('sectionLogin');
    if (action === 'on') {
      back.classList.add('bg-dark');
      login.classList.add('bg-dark');
    } else if (action === 'off') {
      back.classList.remove('bg-dark');
      login.classList.remove('bg-dark');
    }
  }
  validatorMail(mail, id) {
    const div = document.getElementById(id);
    const vacio = document.getElementById('mailEmpity');
    const error = document.getElementById('mailError');
    if ( mail !== '' && this.validateEmail(mail) === true) {
      div.classList.add('is-valid');
      div.classList.remove('is-invalid');
      vacio.classList.add('d-none');
      error.classList.add('d-none');

    } else if (this.validateEmail(mail) === false) {
      div.classList.add('is-invalid');
      div.classList.remove('is-valid');
      vacio.classList.add('d-none');
      error.classList.remove('d-none');
    } else if (mail === '') {
      div.classList.add('is-invalid');
      div.classList.remove('is-valid');
      vacio.classList.remove('d-none');
      error.classList.add('d-none');
    }
  }
  validateEmpity(id, value) {
    const campo = document.getElementById(id);
    if (value === '') {
      campo.classList.remove('is-valid');
      campo.classList.add('is-invalid');
    } else if (value !== '') {
      campo.classList.remove('is-invalid');
      campo.classList.add('is-valid');
    }
  }
  validatePass(pass, formPass) {
    const p1 = document.getElementById('pass1');
    const p2 = document.getElementById('pass2');
    const error = document.getElementById('passError');
    const vacio = document.getElementById('passEmpity');
    const ok = document.getElementById('passSuccess');
    if ( pass !== '' && pass === formPass.pass ) {
      p1.classList.remove('is-invalid');
      p2.classList.remove('is-invalid');
      p1.classList.add('is-valid');
      p2.classList.add('is-valid');
      vacio.classList.add('d-none');
      error.classList.add('d-none');
      ok.classList.remove('d-none');
    } else if (pass !== formPass.pass) {
      p1.classList.remove('is-valid');
      p2.classList.remove('is-valid');
      p1.classList.add('is-invalid');
      p2.classList.add('is-invalid');
      vacio.classList.add('d-none');
      error.classList.remove('d-none');
      ok.classList.add('d-none');
    } else if (pass === '') {
      p1.classList.remove('is-valid');
      p2.classList.remove('is-valid');
      p1.classList.add('is-invalid');
      p2.classList.add('is-invalid');
      vacio.classList.remove('d-none');
      error.classList.add('d-none');
      ok.classList.add('d-none');
    }
  }
  changeForm(idEnable, idDisable) {
    const dis = document.getElementById(idDisable);
    const ena = document.getElementById(idEnable);
    dis.classList.add('d-none');
    ena.classList.remove('d-none');
  }
  login(data) {
    console.log(data);
    this.global.getUserLocal(data.pass).then((res) => {
      console.log(res);
      if (data.mail === res.mail && data.pass === res.pass) {
        this.ingress();
      } else if (res.error === true || data.mail !== res.mail || data.pass !== res.pass) {
        Swal.fire({
          title: 'Error de Acceso',
          text: 'Datos no validos',
          icon: 'error',
          confirmButtonText: 'Ok!',
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }
  register(data) {
    console.log(data);
    this.global.saveUserLocal(data).then((res) => {
      if (res.ok === true) {
        Swal.fire({
          title: 'Usuario Creado',
          text: 'Datos Agregados Exitosamente!',
          icon: 'success',
          confirmButtonText: 'Genial!',
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }
  deleteUser(pass) {
    const user = '_local/users' + pass;
    this.global.deleteUserLocal(pass);
  }
  validateEmail(mail) {
    // retorna true si el mail es valido
    // tslint:disable-next-line: max-line-length
    const emailPattern = (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return emailPattern.test(mail);
  }
}
