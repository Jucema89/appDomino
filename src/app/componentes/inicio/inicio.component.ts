import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  FormLogin: FormGroup;

  constructor(
    private _builder: FormBuilder,
    ) {
      this.FormLogin = this._builder.group({
        user: ['', Validators.required],
        pass: ['', Validators.required],
      });
     }

  ngOnInit() {
  }

}
