import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import countries from 'src/assets/json/countries.json';
import states from 'src/assets/json/states.json';
import cities from 'src/assets/json/cities.json';
import { DbJuecesService } from '../../services/db.jueces.service';


@Component({
  selector: 'app-jueces',
  templateUrl: './jueces.component.html',
  styleUrls: ['./jueces.component.css']
})
export class JuecesComponent implements OnInit {
  FormJueces: FormGroup;


  allJueces: any [];

  Countries: any [] = countries;
  States: any [] = states;
  Cities: any [] = cities;
  selectedCountry = 0;
  selectedState = 0;
  cities = [];
  states = [];

  constructor(
    private _builder: FormBuilder,
    private juecesService: DbJuecesService,
  ) {
    this.FormJueces = this._builder.group({
      name: [' ', Validators.required],
      lastName: [' ', Validators.required],
      cc: [' ', Validators.required],
      mail: [' ', Validators.compose([Validators.email, Validators.required])],
      phone: [' ', Validators.compose([Validators.minLength(10), Validators.required])],
      address: [' ', Validators.required],
      selectedCountry: [' ', Validators.required],
      selectedState: [' ', Validators.required],
      selectedCity: [' ', Validators.required],
      nameCountry: [' ', Validators.required],
      nameState: [' ', Validators.required],
      nameCity: [' ', Validators.required]
    });
  }

  ngOnInit() {
    this.getAllJueces();
  }
  getAllJueces() {
    this.juecesService.createIndex();
    this.juecesService.showAllJueces().then((res) => {
      console.log(res);
      this.allJueces = res.docs;
      console.log(this.allJueces);
    }).catch((err) => {
      console.log(err);
    });
  }
  add(datos, country, state, city) {
    console.log(datos);
    this.juecesService.addJuez(datos, country, state, city);
    console.log(datos);
  }
  toMayusculas(e) {
    e.value = e.value.toUpperCase();
    }
  copiarDatos(id) {
    const dato = id;
    const datofinal = document.getElementById(dato).innerHTML;
    return datofinal;
  }
  eraseForm() {
    return this.FormJueces.reset();
  }
  deleteJuez(id) {
    this.juecesService.deleteJuez(id);
  }
  // Selector de Pais - Esatdo - Ciudad
  addAddress(idCountry: number, idState: number, idCity: string) {
    const control = 2;
    const txtCountry = document.getElementById('nameCountry');
    const txtState = document.getElementById('nameState');
    const txtCity = document.getElementById('nameCity');
    const countryName = countries.find((pais) => {
      return pais.id === Number(idCountry);
    });
    if ( control === 2) { txtCountry.innerHTML = countryName.name;
        } else { console.log(countryName); }

    const stateName = states.find((state) => {
          return state.id === Number(idState);
        });
    if ( control === 2) { txtState.innerHTML = stateName.name;
            } else{ console.log(stateName); }

    const cityName = idCity;
    if ( control === 2) { txtCity.innerHTML = cityName;
                } else { console.log(cityName); }
    const data2 = {
      country: countryName.name,
      state: stateName.name,
      city: cityName
    };
    if ( control === 2) {
      console.log (data2);
      return data2;
    }
      }
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
