import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JugadoresComponent } from './componentes/jugadores/jugadores.component';
import { EjemploComponent } from './componentes/ejemplo/ejemplo.component';
import { EditarJugadorComponent } from './componentes/editar-jugador/editar-jugador.component';
import { ListarJugadorComponent } from './componentes/listar-jugador/listar-jugador.component';
import { CrearTorneoComponent } from './componentes/crear-torneo/crear-torneo.component';
import { ListarTorneosComponent } from './componentes/listar-torneos/listar-torneos.component';
import { TorneoEnCursoComponent } from './componentes/torneo-en-curso/torneo-en-curso.component';
import { RondasComponent } from './componentes/rondas/rondas.component';
import { ParejasComponent } from './componentes/parejas/parejas.component';
import { ConfiguracionComponent } from './componentes/configuracion/configuracion.component';
import { InicioComponent } from './componentes/inicio/inicio.component';
import { JuecesComponent } from './componentes/jueces/jueces.component';
import { RankingComponent } from './componentes/ranking/ranking.component';
import { RankingHistoryComponent } from './componentes/ranking-history/ranking-history.component';
import { ClubesComponent } from './componentes/clubes/clubes.component';
import { SendMailComponent } from './componentes/send-mail/send-mail.component';
import { CedulaMesaComponent } from './componentes/printer/cedula-mesa/cedula-mesa.component';
import { PrintLayoutComponent } from './componentes/printer/print-layout/print-layout.component';




const routes: Routes = [
  {path: '.', component: InicioComponent},
  {path: '', component: InicioComponent},
  {path: 'inicio', component: InicioComponent},
  {path: 'jugador', component: JugadoresComponent},
  {path: 'editar-jugador', component: EditarJugadorComponent },
  {path: 'listar-jugador', component: ListarJugadorComponent},
  {path: 'parejas', component: ParejasComponent},
  {path: 'crear-torneo', component: CrearTorneoComponent},
  {path: 'listar-torneo', component: ListarTorneosComponent},
  {path: 'torneo-en-curso', component: TorneoEnCursoComponent},
  {path: 'rondas', component: RondasComponent},
  {path: 'ranking', component: RankingComponent},
  {path: 'ranking-historial', component: RankingHistoryComponent},
  {path: 'jueces', component: JuecesComponent},
  {path: 'ejemplo', component: EjemploComponent},
  {path: 'configuracion', component: ConfiguracionComponent},
  {path: 'mensajes', component: SendMailComponent},
  {path: 'clubes', component: ClubesComponent},
  { path: 'print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'invoice/:invoiceIds', component: CedulaMesaComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,  {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const appRoutingProviders: any[] = [];
