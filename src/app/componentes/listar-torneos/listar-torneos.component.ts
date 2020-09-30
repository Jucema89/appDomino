import { Component, OnInit } from '@angular/core';
import { DbTournamentService } from '../../services/db.tournament.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { GlobalesService } from '../../services/globales.service';

@Component({
  selector: 'app-listar-torneos',
  templateUrl: './listar-torneos.component.html',
  styleUrls: ['./listar-torneos.component.css']
})
export class ListarTorneosComponent implements OnInit {
  todos: any[];
  players: any[];
  doc: any[];
  allPlayers: any[];
  AllTors: any[];
  idTor;

  constructor(
    private dbTournament: DbTournamentService,
    private dbJugadores: DbJugadoresService,
    private globales: GlobalesService,
  ) { }

  ngOnInit() {
    this.getAllJugadores();
    this.getAllTorneos();
    this.dbTournament.remoteTorneosDb.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.dbTournament.allSyncDb();
      this.getAllTorneos();
    }).on('complete', info => {
    }).on('error', err => {
    });
  }
  getAllJugadores() {
    this.dbJugadores.createIndexId();
    this.dbJugadores.showAllPlayers().then((res) => {
      console.log(res);
      console.log('getAllJugadores' + this.allPlayers);
      this.allPlayers = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  redirect(url) {
    this.globales.redirecTo(url);
  }
  getAllTorneos() {
    this.dbTournament.createIndexTournament();
    this.dbTournament.showAllTor().then((res) => {
      console.log(res);
      this.AllTors = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  showTournament(doc) {
    const control = 2;
    const nombre = document.getElementById('nombreTorneo');
    const tipo = document.getElementById('tipo');
    const inicio = document.getElementById('fechaInicio');
    const final = document.getElementById('fechaFinal');
    const modo = document.getElementById('modalidad');
    const individual = document.getElementById('modoIndividual');
    const sistema = document.getElementById('sistema');
    const rondas = document.getElementById('rondas');
    const jugadores = document.getElementById('jugadores');
    const mesas = document.getElementById('mesas');
    const estado = document.getElementById('estado');
    const ciudad = document.getElementById('ciudad');
    if (control === 2) {
      nombre.innerHTML = doc.nombre;
      tipo.innerHTML = doc.tipo;
      inicio.innerHTML = doc.fechaInicio;
      final.innerHTML = doc.fechaFinal;
      modo.innerHTML = doc.modalidad;
      individual.innerHTML = doc.modoIndividual;
      sistema.innerHTML = doc.sistema;
      rondas.innerHTML = doc.rondas;
      jugadores.innerHTML = doc.jugadores;
      mesas.innerHTML = doc.mesas;
      estado.innerHTML = doc.estado;
      ciudad.innerHTML = doc.ciudad;
      } else { console.log(control); }
  }
  goTor() {
    this.globales.reloader('torneo-en-curso');
  }
  deleteTor(id) {
    this.dbTournament.deleteTournament(id);
    this.getAllTorneos();
  }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
    }

}
