import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputNames } from './components/input-names/input-names';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InputNames],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('game-score');
}
