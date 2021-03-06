import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';

@Pipe({
  name: 'SortBypts'
})
export class SortBypts implements PipeTransform {
  transform(value: Array<any>, reverse: boolean): Array<any> {
    if (!value) { return []; }
    if ( reverse) {
      // tslint:disable-next-line: only-arrow-functions
      return _.sortBy( value, function(player) {return player.doc.puntos; }).reverse();
    } else {
      // tslint:disable-next-line: only-arrow-functions
      return _.sortBy( value, function(player) {return player.doc.puntos; });
    }
  }
}
