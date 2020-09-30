import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbTournamentService } from '../../services/db.tournament.service';
import { DbJugadoresService } from '../../services/db.jugadores.service';
import { DbJuecesService } from '../../services/db.jueces.service';
import { GlobalesService } from '../../services/globales.service';
import { DbTeamService } from '../../services/db.teams.service';
import { DbMesas } from '../../services/db.mesas.service';
import Swal from 'sweetalert2';
import { PrintService } from '../../services/print.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.css']
})
export class MesaComponent implements OnInit, OnDestroy {
  PlayerListArray: any[];
  prueba: any;
  navFloatEvent: Subscription;
  players: any[];
  doc: any[];
  allMesas: any;
  allPlayers: any[];
  allJueces: any[];
  AllTors: any[];
  duoOne;
  duoTwo;
  value2doDuo;
  select1erPar: any;
  select2doPar: any;
  Onemesa: any;
  oneTor: any[];
  playersInTor = [];
  @Input() playersINronda: any[];
  @Input() idTorneo: string;
  @Input() numberTable;
  @Input() nRonda;
  p11: any; p12: any; p21: any; p22: any; juez: any[];
  playersintoRonda = [];
  NumbersOfTables = []; // numero de mesas en ronda.
  player: any[];
  playerSearch: any[];
  mesaClose: any;
  FormMesa: FormGroup;
  FormMesaActive: FormGroup;
  constructor(
    private dbTournament: DbTournamentService,
    private dbJugadores: DbJugadoresService,
    private dbJueces: DbJuecesService,
    private dbParejas: DbTeamService,
    private global: GlobalesService,
    private dbMesas: DbMesas,
    public printService: PrintService,
    private builder: FormBuilder,
  ) {
    this.FormMesa = this.builder.group({
      mesa: [' ', Validators.required],
      P11: [' ', Validators.required],
      P12: [' ', Validators.required],
      P21: [' ', Validators.required],
      P22: [' ', Validators.required],
      juez: [' ', Validators.required],
    });
    this.FormMesaActive = this.builder.group({
      nPartidas: [' ', Validators.required],
      P11_ptsFavor: [' ', Validators.required],
      P11_ptsContra: [' ', Validators.required],
      P11_obs: [' '],
      P11_win: [' ', Validators.required],
      P12_ptsFavor: [' ', Validators.required],
      P12_ptsContra: [' ', Validators.required],
      P12_obs: [' '],
      P12_win: [' ', Validators.required],
      P21_ptsFavor: [' ', Validators.required],
      P21_ptsContra: [' ', Validators.required],
      P21_obs: [' '],
      P21_win: [' ', Validators.required],
      P22_ptsFavor: [' ', Validators.required],
      P22_ptsContra: [' ', Validators.required],
      P22_obs: [' '],
      P22_win: [' ', Validators.required],
    });
  }

  ngOnInit() {
    this.getAllJugadores();
    this.getAllTorneos();
    this.chargeMesas();
    this.chargeMesaClose();
    this.getJueces();
    this.listarPlayersRondas();
    this.navFloatEvent = this.dbMesas.addRonda.subscribe((e) => {
      this.prueba = e;
      this.listenRonda(e);
    });
  }
  listenRonda(e) {
    if (e === 'ronda') {
      this.dbTournament.db.get(this.idTorneo).then((doc) => {
          console.log(doc);
          const n = doc.mesas;
          for (let i = 0; i <= n; i++) {
            if ( i > 0 ) {
            document.getElementById('MesaCerrada' + i).classList.add('d-none');
            document.getElementById('Mesa' + i).classList.remove('d-none');
            }
          }
        });
    } else if ( e === 'final') {
      this.global.redirecTo('/listar-torneo');
    }
  }
  onPrintInvoice(n) {
    this.dbMesas.showMesa('Mesa' + n).then((doc) => {
      console.log(doc);
      this.dbTournament.showTor(this.idTorneo).then((tor) => {
        const invoiceIds = [
          'Mesa ' + n,
          doc.p11.nombre,
          doc.p11.Dni,
          doc.p12.nombre,
          doc.p12.Dni,
          doc.p21.nombre,
          doc.p21.Dni,
          doc.p22.nombre,
          doc.p22.Dni,
          doc.juez.nombre,
          doc.juez.Dni,
          tor.nombre,
          tor.fechaInicio,
          tor.fechaFinal,
          tor.ciudad,
          tor.direccion,
        ];
        this.printService
        .printDocument('invoice', invoiceIds);
      });
    });
  }
  chargeMesas() {
    this.dbTournament.showTor(this.idTorneo).then((doc) => {
      const n = doc.mesas;
      for (let i = 0; i <= n; i++) {
        this.dbMesas.showMesa('Mesa' + i).then((mesa) => {
          if (mesa._id === 'Mesa' + i) {
            this.changeMesaActive(i);
            }
        }).catch((err) => {
          console.log(err);
        });
      }
    });
  }
  chargeMesaClose() {
    this.dbTournament.showTor(this.idTorneo).then((doc) => {
      const n = doc.mesas;
      for (let i = 0; i <= n; i++) {
        this.dbMesas.showMesa('Mesa' + i).then((table) => {
          if (table.cerrada === true) {
            this.changeMesaCloser(i, table._id);
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    });
  }
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
  }
  Value2doDuo(dato) {
    this.value2doDuo = dato;
    return this.value2doDuo;
  }
  validatorDuo() {
    if (+this.value2doDuo === this.select1erPar.DNI || this.select2doPar.DNI === this.select1erPar.DNI || this.duoTwo === this.duoOne
      || this.duoTwo === this.select1erPar.DNI || +this.value2doDuo === this.duoOne ) {
      const titulo = 'Algo salio mal';
      const texto = 'Este jugador o pareja ya fue seleccionado';
      const icono = 'error';
      const boton = 'volver';
      this.global.alertCustom(titulo, texto, icono, boton);
    } else {
      console.log('validatorDuo OK');
    }
  }
  getOneMesa(id) {
    this.dbMesas.showMesa(id).then((doc) => {
      console.log(doc);
      return doc;
    });
    console.log(this.Onemesa);
  }
  getAllMesas() {
    this.dbMesas.showMesas().then((res) => {
      this.allMesas = res.rows;
    });
  }
  changeMesa() {
    const mesa1 = document.getElementById('validateMesa');
    const mesa2 = document.getElementById('mesa_activa');
    mesa1.classList.add('d-none');
    mesa2.classList.remove('d-none');
  }
  getAllJugadores() {
    // this.dbJugadores.createIndex();
    this.dbJugadores.showAllPlayers().then((res) => {
      console.log(res);
      console.log('getAllJugadores desde mesa' + this.allPlayers);
      this.allPlayers = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  getJueces() {
    this.dbJueces.showAllJueces().then((res) => {
      this.allJueces = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  getAllTorneos() {
    // this.dbTournament.createIndexTournament();
    this.dbTournament.showAllTor().then((res) => {
      console.log(res);
      this.AllTors = res.docs;
      console.log('All Tors List desde Mesa' + this.AllTors);
    }).catch((err) => {
      console.log(err);
    });
  }
  getOneTorneo(id) {
    // this.dbTournament.createIndexTournament();
    this.dbTournament.showUniqueTor(id).then((res) => {
      console.log(res);
      this.oneTor = res.docs;
    }).catch((err) => {
      console.log(err);
    });
  }
  getParejaIdOne(parejaId, jugadorDNI) {
  this.dbParejas.findPareja(parejaId).then((res) => {
      const j1 = res.docs[0].jugadorUnoDNI;
      const j2 = res.docs[0].jugadorDosDNI;
      console.log('j1: ' + j1 + '| j2: ' + j2);
      if (+jugadorDNI === j1) {
        this.duoOne = j2;
      } else {
        this.duoOne = j1;
      }
      this.dbTournament.showPlayersTor(this.idTorneo).then((response) => {
        const arrayPlayers = response.rondas.jugadores;
        let i;
        for ( i of arrayPlayers) {
          if ( i.DNI === this.duoOne) {
            console.log(i.nombre);
            this.select1erPar = i;
            return this.select1erPar;
          }
         }
      });
     }).catch(err => {
       console.log(err);
     });
  }
  getParejaIdTwo(parejaId, jugadorDNI) {
    this.dbParejas.findPareja(parejaId).then((res) => {
        const j1 = res.docs[0].jugadorUnoDNI;
        const j2 = res.docs[0].jugadorDosDNI;
        console.log('j1: ' + j1 + '| j2: ' + j2);
        if (+jugadorDNI === j1) {
          this.duoTwo = j2;
        } else {
          this.duoTwo = j1;
        }
        this.dbTournament.showPlayersTor(this.idTorneo).then((response) => {
          const arrayPlayers = response.rondas.jugadores;
          let i;
          for ( i of arrayPlayers) {
            if ( i.DNI === this.duoTwo) {
              console.log(i.nombre);
              this.select2doPar = i;
              this.validatorDuo();
              return this.select2doPar;
            }
           }
        });
       }).catch(err => {
         console.log(err);
       });
    }
 searchDuoOne(jugadorDNI) {
  console.log(+jugadorDNI);
  this.dbTournament.showPlayersTor(this.idTorneo).then((res) => {
    const n = res.rondas.jugadores.length;
    const player = res.rondas.jugadores;
    for (let i = 0; i < n; i++) {
      if (player[i].DNI === +jugadorDNI) {
        const parejaId = player[i].duoId;
        this.getParejaIdOne(parejaId, jugadorDNI);
      }
    }
  });
}
  listarPlayers(id) {
    // this.dbTournament.createIndexTournament();
    this.dbTournament.showPlayersTor(id).then((res) => {
      console.log(res);
      this.playersInTor = res.players;
      console.log('Jugadores en tor' + this.playersInTor);
    }).catch((err) => {
      console.log(err);
    });
  }
  listarPlayersRondas() {
    this.dbTournament.showPlayersTor(this.idTorneo).then((res) => {
      this.playersintoRonda = res.rondas.jugadoresList;
    }).catch((err) => {
      console.log('error listar player in rondas mes.TS = ' + err);
    });
  }
  borrarJugadorList(playerDni) {
    const array = [];
    return this.dbTournament.db.get(this.idTorneo).then((doc) => {
      const n = doc.rondas.jugadoresList.length;
      for ( let i = 0; i < n; i++) {
        if ( i <= n) {
          array.push(doc.rondas.jugadoresList[i]);
        }
      }
      console.log(array);
      for ( let i = 0; i < n; i++) {
        if ( array[i].DNI === +playerDni) {
          array.splice(i, 1);
          doc.rondas.jugadoresList = array;
          this.playersintoRonda = doc.rondas.jugadoresList;
          return this.dbTournament.db.put(doc);
        }
      }
    });
  }
  borrarJugadoresListSaveMesa(player1, player2, player3, player4) {
    this.borrarJugadorList(player1).then((res) => {
      if (res.ok === true) {
        this.borrarJugadorList(player2).then((res2) => {
          if (res2.ok === true) {
            this.borrarJugadorList(player3).then((res3) => {
              if (res3.ok === true) {
                this.borrarJugadorList(player4).then((res4) => {
                  if (res4.ok === true) {
                    Swal.fire({
                      title: 'Mesa Creada',
                      text: 'Mesa lista para recibir datos',
                      icon: 'success',
                      confirmButtonText: 'Genial!',
                    });
                  }
                });
              }
            });
          }
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }
  searchDuoTwo(jugadorDNI) {
    console.log(+jugadorDNI);
    this.dbTournament.showPlayersTor(this.idTorneo).then((res) => {
      const n = res.rondas.jugadores.length;
      const player = res.rondas.jugadores;
      for (let i = 0; i < n; i++) {
        if (player[i].DNI === +jugadorDNI) {
          const parejaId = player[i].duoId;
          this.getParejaIdTwo(parejaId, jugadorDNI);
        }
      }
    });
  }
  addTable(values) {
    console.log(values);
  }
  cleanData() {
    this.select1erPar = 0;
    this.select2doPar = 0;
    console.log('selector 1 y 2  a cero');
  }
  deleteMesa(n) {
    const mesaFirst = document.getElementById('Mesa' + n);
    const mesaActive = document.getElementById('MesaActive' + n);
    this.dbMesas.borraMesa('Mesa' + n).then((res) => {
      if (res.ok === true) {
        Swal.fire({
          title: 'Mesa ' + n + ' Borrada!',
          text: 'se eliminaron todos los datos',
          icon: 'success',
          confirmButtonText: 'Genial!',
          });
        mesaActive.classList.add('d-none');
        mesaFirst.classList.remove('d-none');
      }
    });
  }
  validateMesa(data, Nmesa, numberTable) {
    const nM = numberTable;
    this.dbJueces.showOneJuez(data.juez).then((doc) => {
      return this.juez = doc;
    });
    this.dbTournament.showPlayersTor(this.idTorneo).then((res) => {
      const n = res.rondas.jugadores.length;
      const player = res.rondas.jugadores;
      for (let i = 0; i < n; i++) {
        if (player[i].DNI === +data.P11) {
           this.p11 = player[i];
        }
        if (player[i].DNI === +data.P12) {
          this.p12 = player[i];
        }
        if (player[i].DNI === +data.P21) {
          this.p21 = player[i];
        }
        if (player[i].DNI === +data.P22) {
          this.p22 = player[i];
        }
      }
      const mesa = Nmesa.replace(/ /g, '');
      this.dbMesas.agregarMesas(this.p11, this.p12,
      this.p21, this.p22, this.juez, mesa).then((response) => {
        if (response.ok === true) {
          // eliminar player de lista de player
          this.borrarJugadoresListSaveMesa(
            this.p11.DNI,
            this.p12.DNI,
            this.p21.DNI,
            this.p22.DNI
          );
          Swal.fire({
            title: Nmesa + '  agregada',
            text: 'Esta mesa se ha registrado correctamente, puedes imprimir la cedula de esta mesa',
            icon: 'success',
            confirmButtonText: 'Genial!',
          });
          this.changeMesaActive(nM);
        }
      }).catch((err) => {
        if (err.message === 'Document update conflict') {
          Swal.fire({
            title: Nmesa + '  ya Existe!',
            text: 'Esta Mesa ya existe, Eliminala y luego guardala',
            icon: 'error',
            confirmButtonText: 'Genial!',
          });
          this.changeMesaActive(nM);
        }
      });
    });
  }
  changeMesaActive(n) {
    const mesaFirst = document.getElementById('Mesa' + n);
    const mesaActive = document.getElementById('MesaActive' + n);
    mesaActive.classList.remove('d-none');
    mesaFirst.classList.add('d-none');
    const p11Nombre = document.getElementById('p11Nombre' + n);
    const p11Dni = document.getElementById('p11Dni' + n);
    const p12Nombre = document.getElementById('p12Nombre' + n);
    const p12Dni = document.getElementById('p12Dni' + n);
    const p21Nombre = document.getElementById('p21Nombre' + n);
    const p21Dni = document.getElementById('p21Dni' + n);
    const p22Nombre = document.getElementById('p22Nombre' + n);
    const p22Dni = document.getElementById('p22Dni' + n);
    const juezNombre = document.getElementById('juezNombre' + n);
    const juezDni =  document.getElementById('juezDni' + n);
    this.dbMesas.showMesa('Mesa' + n).then((doc) => {
      p11Nombre.innerHTML = doc.p11.nombre;
      p11Dni.innerHTML = 'DNI: ' + doc.p11.Dni;
      p12Nombre.innerHTML = doc.p12.nombre;
      p12Dni.innerHTML = 'DNI: ' + doc.p12.Dni;
      p21Nombre.innerHTML = doc.p21.nombre;
      p21Dni.innerHTML = 'DNI: ' + doc.p21.Dni;
      p22Nombre.innerHTML = doc.p22.nombre;
      p22Dni.innerHTML = 'DNI: ' + doc.p22.Dni;
      juezNombre.innerHTML = doc.juez.nombre;
      juezDni.innerHTML = 'DNI: ' + doc.juez.Dni;
    }).catch((err) => {
      console.log(err);
    });
  }
  changeMesaCloser(n, id) {
    const mesaActive = document.getElementById('MesaActive' + n);
    const mesaClose = document.getElementById('MesaCerrada' + n);
    const juezCerrado = document.getElementById('juez' + n);
    mesaActive.classList.add('d-none');
    mesaClose.classList.remove('d-none');
    this.dbMesas.dbMesas.get(id).then((doc) => {
      juezCerrado.innerHTML = doc.juez.nombre;
    });
  }
  sendMesaActive(values, id, n) {
    console.log(values, id);
    this.dbMesas.saveMesa(values, id);
    this.changeMesaCloser(n, id);
    this.dbMesas.updatePtsRanking(values, id, this.idTorneo);
    this.dbMesas.allSyncDb();
  }
  mesaAleatoria(nMesa) {
    this.dbMesas.idTor = this.idTorneo;
    this.dbMesas.mesaRamdon(nMesa).then((res) => {
      if (res.ok === true) {
        Swal.fire({
          title: 'Mesa ' + nMesa + '  agregada',
          text: 'Esta mesa se ha registrado correctamente, puedes imprimir la cedula de esta mesa',
          icon: 'success',
          confirmButtonText: 'Genial!',
        });
        this.changeMesaActive(nMesa);
      }
    });
  }
  ngOnDestroy() {
    this.navFloatEvent.unsubscribe();
  }
}
