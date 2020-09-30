import { Component, OnInit } from '@angular/core';
import { Rankings } from '../../services/rankings.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  allRanking: any[];
  page = 1;

  constructor(
    private Ranking: Rankings,
    private Jugadores: DbJugadoresService
  ) {}

  ngOnInit() {
    this.getAllRankings();
    this.cargarPlayers();
  }
  async getAllRankings() {
     const datos = await this.Ranking.allDatosRanking();
     this.allRanking = datos.rows;
     console.log(this.allRanking);
  }
  deleteHistory(id) {
    this.Ranking.deleteHistoryDoc(id).then(() => {
      this.getAllRankings();
    });
  }
  // AUN NO ESTABA LA CARGA A RANKING DESDE LA CREACION DEL JUGADOR
  cargarPlayers() {
    this.Jugadores.showTodos().then((docs) => {
      console.log(docs);
      const n = docs.rows.length;
      for (let i = 0; i < n; i++) {
        const player = {
          _id: docs.rows[i].doc._id,
          nombre: docs.rows[i].doc.nombre,
          dni: docs.rows[i].doc.DNI,
          puntos: 0,
          torneos: ''
        };
        this.Ranking.saveRanking(player);
      }
    });
  }
}
