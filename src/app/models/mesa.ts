export class Mesa {
  constructor(
     public _id = '',
     public partidas: '',
     public cerrada: false,
     public p11 = {
      nombre: '',
      Dni: '',
      pts_favor: 0,
      pts_contra: 0,
      result: '',
      observaciones: '',
     },
     public p12 = {
      nombre: '',
      Dni: '',
      pts_favor: 0,
      pts_contra: 0,
      result: '',
      observaciones: '',
     },
     public p21 = {
      nombre: '',
      Dni: '',
      pts_favor: 0,
      pts_contra: 0,
      result: '',
      observaciones: '',
     },
     public p22 = {
      nombre: '',
      Dni: '',
      pts_favor: 0,
      pts_contra: 0,
      result: '',
      observaciones: '',
     },
     public juez = {
       id: '',
       nombre: '',
       Dni: '',
     }
  ) { }
}
