import { Component, OnInit, OnDestroy } from '@angular/core';
import { DbJugadoresService } from '../app/services/db.jugadores.service';
import { GlobalesService } from '../app/services/globales.service';
import { DbTournamentService } from '../app/services/db.tournament.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'dominoPouch';
  titleToast: string;
  message: string;
  icono: any;
  eventToast: Subscription;
  tipo: any;

  constructor(
    private dbTournament: DbTournamentService,
    private dbJugadores: DbJugadoresService,
    private globales: GlobalesService,
  ) { }

  ngOnInit() {
    this.dbJugadores.createIndex();
    this.dbTournament.createIndexTournament();
    this.eventToast = this.globales.toastEvent.subscribe((e) => {
      // alert('aqui esta la toast');
      this.tipo = e.tipo;
      this.titleToast = e.title;
      this.message = e.message;
      const toastId = document.getElementById('toast-header');
      if (this.tipo === 'success' || this.tipo ===  'danger' || this.tipo === 'info') {
        document.getElementById('myToast').classList.remove('hide');
        document.getElementById('myToast').classList.add('show');
        switch (this.tipo) {
          case 'success':
            toastId.classList.add('bg-success');
            break;
          case 'danger':
            toastId.classList.add('bg-danger');
            break;
          case 'info':
            toastId.classList.add('bg-info');
            break;
        }
        $('#myToast').toast('show');
      }
    });
  }

  ngOnDestroy() {
    this.eventToast.unsubscribe();
   }

}
