class Estudiante {
  notaProyecto: number;
  notaExtra: number;
  notaPresentacion: number;
  notaFinal: number;
  constructor(
    notaProyecto: number,
    notaExtra: number,
    notaPresentacion: number,
    notaFinal: number
  ) {
    this.notaProyecto = notaProyecto;
    this.notaExtra = notaExtra;
    this.notaPresentacion = notaPresentacion;
    this.notaFinal = notaFinal;
  }
}
import { readCSV } from "https://deno.land/x/csv/mod.ts";

export class Notas {
  notas: Map<string, Estudiante> = new Map<string, Estudiante>();
  fileName: string;
  constructor(csvFileName: string) {
    this.fileName = csvFileName;
  }

  async setup() {
    const notas = await Deno.open(this.fileName);
    for await (const row of readCSV(notas)) {
      const cells = [];
      for await (const cell of row) cells.push(cell);
      if (cells.length === 0) continue;
      const nick: string = cells.pop() as string;
      const estasNotas = cells.map((nota) => parseInt(nota));
      const estudiante = new Estudiante(
        estasNotas[0],
        estasNotas[1],
        estasNotas[2],
        estasNotas[3]
      );
      this.notas.set(nick, estudiante);
    }
    notas.close();
  }
}
