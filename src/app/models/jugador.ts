export class Jugador {
    constructor(
        public _id: string,
        public name: string,
        public lastName: string,
        public cc: number,
        public mail: string,
        public phone: number,
        public address: string,
        public country: string,
        public state: string,
        public city: string,
    ){ }
}