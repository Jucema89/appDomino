import { Component, OnInit } from '@angular/core';
import { Rankings } from '../../services/rankings.service';

@Component({
  selector: 'app-ranking-history',
  templateUrl: './ranking-history.component.html',
  styleUrls: ['./ranking-history.component.css']
})
export class RankingHistoryComponent implements OnInit {
  allRankingHistory: any[];
  pointsPlayer: any;
  i: any;
  page = 1;

  constructor(
    private Ranking: Rankings,
  ) { }

  ngOnInit() {
    this.getAllHistoryRankings();
  }
  async getAllHistoryRankings() {
    const datos = await this.Ranking.allDatosRankingHistory();
    this.allRankingHistory = datos.rows;
    console.log(this.allRankingHistory);
  }
  async modalPlayerPoints(id) {
    const array = [];
    const data = await this.Ranking.getOneRankingHistory(id);
    this.pointsPlayer = data;
    console.log(data);
  }
 deleteHistoryRanking(id) {
    this.Ranking.deleteHistoryDoc(id).then(() => {
      this.getAllHistoryRankings();
    });
  }

}
