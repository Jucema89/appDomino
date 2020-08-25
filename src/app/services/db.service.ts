/*
import {Injectable} from '@angular/core';
import pouchDB from 'pouchdb';

@Injectable({
    providedIn: 'root'
  })
  export class DbService {
    db;
    remoteDb;
    constructor() {
      this.db = new pouchDB('torneo');
      //this.remoteDb = new pouchDB('http://localhost:5984/torneo');
      //this.sync();
    }
    addTodo(text) {
      const todo = {
        _id: new Date().toISOString(),
        title: text,
        completed: false
      };
      this.db.put(todo, (err) => {
        if (err) {
          return;
        }
        console.log('Successfully posted a todo!');
      });
    }
    showTodos() {
      return this.db.allDocs({include_docs: true, descending: true});
    }
    deleteTodo(todo) {
      this.db.remove(todo);
    }
   /*sync() {
      this.db.replicate.from('http://localhost:5984/torneo').on('complete', () => {
        this.db.sync(this.remoteDb, {
          live: true,
          retry: true
        }).on('complete', function () {
          // yay, we're in sync!
        }).on('error', function (err) {
          console.log('error', err);
        });
      });
      this.remoteDb.sync(this.db, {
        live: true,
        retry: true
      });
    }
  }
  */
