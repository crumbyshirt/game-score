import { Component, input } from '@angular/core';

/**
 * The name plate component displays a decorative name plate.
 * This component displays the player name.
 */
@Component({
  selector: 'app-name-plate',
  imports: [],
  templateUrl: './name-plate.html',
  styleUrl: './name-plate.css',
})
export class NamePlate {
  /** The name to display on the name plate. */
  name = input.required<string>();
}
