import { Component, OnInit } from '@angular/core';
import { DbEjemploService } from '../../services/db.ejemplo.service';

@Component({
  selector: 'app-ejemplo',
  templateUrl: './ejemplo.component.html',
  styleUrls: ['./ejemplo.component.css']
})
export class EjemploComponent implements OnInit {
  todos: any[];
  constructor(private db: DbEjemploService) { }

  ngOnInit() {
    this.getTodos();

    this.db.remoteDb.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', change => {
      this.getTodos();
    }).on('complete', info => {
    }).on('error', err => {
    });
  }
  add() {
    this.db.addTodo(Math.random().toString(36).substring(7));
    this.getTodos();
  }
  async getTodos() {
    const data = await this.db.showTodos();
    if (data) {
      this.todos = data.rows;
    }
  }
  deleteTodo(todo) {
    this.db.deleteTodo(todo);
    this.getTodos();
  }


}
