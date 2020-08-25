# DominoPouch

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.20.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

##PROCESO DE SUBIR A GIT

echo "# AppDomino" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/Jucema89/AppDomino.git
git push -u origin master


##DIAGRAMA DE BASES DE DATOS

PLAYERS / BD

    DATOS   Nombre
            Apellidos
            DNI
            Mail
            Celular
            Direccion
            Pais
            Estado
            Ciudad

    LOGIN   User
            Password
            Correo

    EQUIPO  
            ID-equipo
            Nombre-Equipo

    CLUB    
            IdClub
            Nombre_club

    PAREJA
            IdPareja

    RANKING
            Posicion
            puntos
    
    TORNEOS : [
            IdTorneo
            Nombre_Torneo
            Posicion_en_Torneo
            Puntos_de_Ranking:
            PARTIDOS : [
                        Partida-1 [
                                Mesa
                                Pareja
                                Juez
                                Puntos
                        ]
                    ]
            ]
    
# appDomino
