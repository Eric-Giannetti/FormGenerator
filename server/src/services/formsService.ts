import { forms_v1 } from 'googleapis';
import { MonthGames } from '../types.js';

/** Part 2 boundary. Drive thumbnail URLs are not public source URIs for Forms images. */
export class FormsService {
  constructor(private readonly forms: forms_v1.Forms) {}

  async create(_payload: MonthGames) {
    throw new Error('A criação do Google Forms será implementada na Parte 2.');
  }
}
