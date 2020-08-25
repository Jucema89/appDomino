import { Component, OnInit } from '@angular/core';
import pouchDB from 'pouchdb';
import { DbJugadoresService } from '../../services/db.jugadores.service';
pouchDB.plugin(require('pouchdb-find'));

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  playerRes: any[];

  constructor(
    private Dbjugadores: DbJugadoresService,
  ) { }

  ngOnInit() {
    this.createIndex();
  }

  createIndex() {
    this.Dbjugadores.db.createIndex({
      index: {
        fields: ['name', 'DNI']
      }
    });
  }

  searchPlayer(dni) {
    this.Dbjugadores.db.find({
      DNI: {$eq: dni}
    }).then((res) => {
      this.playerRes = res;
    });

  }

}
