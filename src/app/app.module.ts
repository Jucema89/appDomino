import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JugadoresComponent } from './componentes/jugadores/jugadores.component';
import { EjemploComponent } from './componentes/ejemplo/ejemplo.component';
import { MenuComponent } from './componentes/menu/menu.component';
import { GlobalesService } from './services/globales.service';
import { EditarJugadorComponent } from './componentes/editar-jugador/editar-jugador.component';
import { ListarJugadorComponent } from './componentes/listar-jugador/listar-jugador.component';
import { CrearTorneoComponent } from './componentes/crear-torneo/crear-torneo.component';
import { ListarTorneosComponent } from './componentes/listar-torneos/listar-torneos.component';
import { TorneoEnCursoComponent } from './componentes/torneo-en-curso/torneo-en-curso.component';
import { ParejasComponent } from './componentes/parejas/parejas.component';
import { ConfiguracionComponent } from './componentes/configuracion/configuracion.component';
import { InicioComponent } from './componentes/inicio/inicio.component';
import { RondasComponent } from './componentes/rondas/rondas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JuecesComponent } from './componentes/jueces/jueces.component';
import { RankingComponent } from './componentes/ranking/ranking.component';
import { ClubesComponent } from './componentes/clubes/clubes.component';
import { AppPasswordDirective } from './app-password.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { MesaComponent } from './componentes/mesa/mesa.component';
import { PrintLayoutComponent } from './componentes/printer/print-layout/print-layout.component';
import { CedulaMesaComponent } from './componentes/printer/cedula-mesa/cedula-mesa.component';
import { PrintService } from './services/print.service';
import {NgxPrintModule} from 'ngx-print';
import { NavFloatComponent } from './componentes/nav-float/nav-float.component';
import { SortByPipe } from './pipes/sort-by.pipe';
import { SearchComponent } from './componentes/search/search.component';
import { SendMailComponent } from './componentes/send-mail/send-mail.component';
import { ServiceMail } from './services/servicemail.service';


@NgModule({
  declarations: [
    AppComponent,
    JugadoresComponent,
    EjemploComponent,
    MenuComponent,
    EditarJugadorComponent,
    ListarJugadorComponent,
    CrearTorneoComponent,
    ListarTorneosComponent,
    TorneoEnCursoComponent,
    ParejasComponent,
    ConfiguracionComponent,
    InicioComponent,
    RondasComponent,
    JuecesComponent,
    RankingComponent,
    ClubesComponent,
    AppPasswordDirective,
    MesaComponent,
    PrintLayoutComponent,
    CedulaMesaComponent,
    NavFloatComponent,
    SortByPipe,
    SearchComponent,
    SendMailComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    BrowserAnimationsModule,
    NgxPaginationModule,
    NgxPrintModule
  ],
  providers: [
    GlobalesService,
    PrintService,
    ServiceMail
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
