import {Injectable} from '@angular/core';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
  })
  export class GeoService {
    Countries: any [] = countries;
    States: any [] = states;
    Cities: any [] = cities;

    selectedCountry = 0;
    selectedState = 0;
    cities = [];
    states = [];

    constructor(
      private router: Router,
    ) {}
    onSelectCountry(id: number) {
        this.selectedCountry = id;
        this.selectedState = 0;
        this.cities = [];
        this.states = this.getStates().filter((item) => {
        return item.country_id === Number(id);
        });
        }
        onSelectState(id: number) {
        this.selectedState = id;
        this.cities = this.getCity().filter((item) => {
        return item.state_id === Number(id);
        });
        }
        getCountries() {
          return this.Countries;
          }
        getStates() {
           return this.States;
           }
        getCity() {
           return this.Cities;
           }

  }
